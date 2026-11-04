import type { Pool, PoolClient } from 'pg';
import { ApiError } from './auth.js';
import type { AuditService } from './audit-service.js';
import type { RedisMeter } from './redis-meter.js';

export interface SubscriptionListQuery {
  status?: 'Pending' | 'Active' | 'Canceled' | 'Expired' | 'Suspended';
  consumerId?: string;
  apiId?: string;
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
}

export interface SandboxPaymentQuery {
  status?: 'Pending' | 'Succeeded' | 'Failed' | 'Expired';
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
}

const iso = (value: unknown) => value instanceof Date ? value.toISOString() : value ? String(value) : null;

function subscriptionView(row: Record<string, any>) {
  return {
    id: String(row.id),
    status: row.status as string,
    quotaUsed: String(row.quota_used),
    quotaLimit: String(row.quota_limit),
    expiresAt: iso(row.expires_at),
    currentPeriodEnd: iso(row.current_period_end),
    createdAt: iso(row.created_at),
    consumer: { id: String(row.consumer_id), email: row.consumer_email as string, name: row.consumer_name as string },
    api: { id: String(row.api_id), name: row.api_name as string },
    plan: { id: String(row.plan_id), name: row.plan_name as string },
  };
}

function paymentView(row: Record<string, any>) {
  return {
    id: String(row.id),
    subscriptionId: String(row.subscription_id),
    amount: String(row.amount),
    currency: row.currency as string,
    status: row.display_status as string,
    sandbox: true as const,
    label: 'sandbox' as const,
    provider: 'SANDBOX' as const,
    failureCode: row.failure_code ?? null,
    createdAt: iso(row.created_at),
    paidAt: iso(row.paid_at),
    expiresAt: iso(row.checkout_expires_at),
  };
}

const displayStatusSql = `CASE
  WHEN p.status = 'Succeeded' THEN 'Succeeded'
  WHEN p.failure_code = 'CHECKOUT_EXPIRED' OR (p.status = 'Pending' AND p.checkout_expires_at <= NOW()) THEN 'Expired'
  WHEN p.status = 'Failed' THEN 'Failed'
  WHEN p.status = 'Pending' THEN 'Pending'
  ELSE p.status
END`;

export class AdminSupervisionService {
  constructor(readonly pool: Pool, private readonly audit: AuditService, private readonly meter?: RedisMeter) {}

  async listSubscriptions(query: SubscriptionListQuery) {
    const where: string[] = [];
    const values: unknown[] = [];
    const add = (clause: string, value: unknown) => {
      values.push(value);
      where.push(clause.replace('$?', `$${values.length}`));
    };
    if (query.status) add('s.status = $?', query.status);
    if (query.consumerId) add('s.consumer_id = $?', query.consumerId);
    if (query.apiId) add('s.api_id = $?', query.apiId);
    if (query.from) add('s.created_at >= $?', query.from);
    if (query.to) add('s.created_at <= $?', query.to);
    const filter = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const from = `FROM subscriptions s
      JOIN users u ON u.id = s.consumer_id
      JOIN apis a ON a.id = s.api_id
      JOIN api_plans p ON p.id = s.plan_id`;
    const total = Number((await this.pool.query(`SELECT COUNT(*) ${from} ${filter}`, values)).rows[0].count);
    const rows = (await this.pool.query(
      `SELECT s.id, s.status, s.quota_used, s.quota_limit, s.expires_at, s.current_period_end, s.created_at,
              u.id AS consumer_id, u.email AS consumer_email, u.name AS consumer_name,
              a.id AS api_id, a.name AS api_name, p.id AS plan_id, p.name AS plan_name
       ${from} ${filter}
       ORDER BY s.id DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, query.pageSize, (query.page - 1) * query.pageSize],
    )).rows;
    return { items: rows.map(subscriptionView), total, page: query.page, pageSize: query.pageSize };
  }

  async listSandboxPayments(query: SandboxPaymentQuery) {
    const where = [`p.provider = 'SANDBOX'`];
    const values: unknown[] = [];
    const add = (clause: string, value: unknown) => {
      values.push(value);
      where.push(clause.replace('$?', `$${values.length}`));
    };
    if (query.status) add(`${displayStatusSql} = $?`, query.status);
    if (query.from) add('p.created_at >= $?', query.from);
    if (query.to) add('p.created_at <= $?', query.to);
    const filter = `WHERE ${where.join(' AND ')}`;
    const total = Number((await this.pool.query(`SELECT COUNT(*) FROM payments p ${filter}`, values)).rows[0].count);
    const rows = (await this.pool.query(
      `SELECT p.id, p.subscription_id, p.amount, p.currency, p.failure_code, p.created_at, p.paid_at, p.checkout_expires_at,
              ${displayStatusSql} AS display_status
       FROM payments p ${filter}
       ORDER BY p.id DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, query.pageSize, (query.page - 1) * query.pageSize],
    )).rows;
    return {
      sandbox: true as const,
      label: 'sandbox' as const,
      items: rows.map(paymentView),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async revokeKey(actorId: string, ip: string | null, keyId: string, reason: string) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const row = (await client.query(
        'SELECT id, user_id, api_id, is_active FROM api_keys WHERE id=$1 FOR UPDATE',
        [keyId],
      )).rows[0];
      if (!row) throw new ApiError(404, 'NOT_FOUND', 'API key not found');
      if (!row.is_active) throw new ApiError(409, 'KEY_REVOKED', 'API key revocation is irreversible');
      const updated = (await client.query(
        'UPDATE api_keys SET is_active=false, revoked_at=NOW() WHERE id=$1 RETURNING revoked_at',
        [keyId],
      )).rows[0];
      await this.audit.write(client, {
        actorId,
        actorRole: 'ADMIN',
        action: 'admin.api_key.revoke',
        targetType: 'api_key',
        targetId: keyId,
        detail: { reason },
        ip,
      });
      const cache = await this.cacheTarget(client, String(row.user_id), String(row.api_id), [String(row.id)]);
      await client.query('COMMIT');
      await this.invalidate(cache);
      return { id: String(row.id), revokedAt: iso(updated.revoked_at), irreversible: true as const };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async suspend(actorId: string, ip: string | null, subscriptionId: string, reason: string) {
    return this.changeSubscription(actorId, ip, subscriptionId, reason, 'suspend');
  }

  async restore(actorId: string, ip: string | null, subscriptionId: string, reason: string) {
    return this.changeSubscription(actorId, ip, subscriptionId, reason, 'restore');
  }

  private async changeSubscription(actorId: string, ip: string | null, subscriptionId: string, reason: string, action: 'suspend' | 'restore') {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const row = (await client.query('SELECT * FROM subscriptions WHERE id=$1 FOR UPDATE', [subscriptionId])).rows[0];
      if (!row) throw new ApiError(404, 'NOT_FOUND', 'Subscription not found');
      const quotaUsed = String(row.quota_used);
      if (action === 'suspend') {
        if (row.status === 'Suspended') throw new ApiError(409, 'ALREADY_SUSPENDED', 'Subscription is already suspended');
        if (!['Active', 'Past Due'].includes(row.status)) throw new ApiError(409, 'INVALID_STATE', 'Only an active subscription can be suspended');
        await client.query("UPDATE subscriptions SET status='Suspended' WHERE id=$1", [subscriptionId]);
      } else {
        if (row.status !== 'Suspended') throw new ApiError(409, 'INVALID_STATE', 'Only a suspended subscription can be restored');
        const periodEnd = new Date(row.current_period_end).getTime();
        const expiresAt = row.expires_at ? new Date(row.expires_at).getTime() : Number.POSITIVE_INFINITY;
        if (periodEnd <= Date.now() || expiresAt <= Date.now()) throw new ApiError(409, 'PERIOD_ENDED', 'Subscription period has ended');
        await client.query("UPDATE subscriptions SET status='Active' WHERE id=$1", [subscriptionId]);
      }
      await this.audit.write(client, {
        actorId,
        actorRole: 'ADMIN',
        action: action === 'suspend' ? 'admin.subscription.suspend' : 'admin.subscription.restore',
        targetType: 'subscription',
        targetId: subscriptionId,
        detail: { reason },
        ip,
      });
      const keys = (await client.query(
        'SELECT id::text FROM api_keys WHERE user_id=$1 AND api_id=$2 AND is_active',
        [row.consumer_id, row.api_id],
      )).rows.map((item: { id: string }) => item.id);
      const cache = await this.cacheTarget(client, String(row.consumer_id), String(row.api_id), keys, row);
      await client.query('COMMIT');
      await this.invalidate(cache);
      const saved = (await this.pool.query('SELECT quota_used, quota_limit, status FROM subscriptions WHERE id=$1', [subscriptionId])).rows[0];
      return {
        id: subscriptionId,
        status: saved.status as string,
        quotaUsed: String(saved.quota_used),
        quotaLimit: String(saved.quota_limit),
        quotaPreserved: String(saved.quota_used) === quotaUsed,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async cacheTarget(client: PoolClient, consumerId: string, apiId: string, apiKeyIds: string[], subscription?: { id: unknown; quota_reset_at: unknown }) {
    const sub = subscription ?? (await client.query(
      `SELECT id, quota_reset_at FROM subscriptions
       WHERE consumer_id=$1 AND api_id=$2 AND status IN ('Active','Past Due','Suspended')
       ORDER BY id DESC LIMIT 1`,
      [consumerId, apiId],
    )).rows[0];
    const endpointIds = (await client.query('SELECT id::text FROM api_endpoints WHERE api_id=$1', [apiId])).rows.map((item: { id: string }) => item.id);
    return {
      apiKeyIds,
      endpointIds,
      subscriptionId: sub ? String(sub.id) : undefined,
      periodStart: sub?.quota_reset_at ? new Date(sub.quota_reset_at as string | Date).toISOString() : undefined,
    };
  }

  private async invalidate(target: { apiKeyIds: string[]; endpointIds: string[]; subscriptionId?: string; periodStart?: string }) {
    try {
      await this.meter?.invalidate(target);
    } catch {
      console.error('Entitlement cache invalidation failed');
    }
  }
}
