import { createHash, randomBytes } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import { ApiError } from './auth.js';

const missing = () => new ApiError(404, 'NOT_FOUND', 'Resource not found');
export async function publishedApi(client: PoolClient, apiId: string) {
  const api = (await client.query(`SELECT a.id FROM apis a JOIN api_providers p ON p.id=a.provider_id
    JOIN users u ON u.id=p.user_id WHERE a.id=$1 AND a.status='Published' AND u.is_active`, [apiId])).rows[0];
  if (!api) throw missing();
}
async function consumerTransaction<T>(pool: Pool, userId: string, work: (client: PoolClient) => Promise<T>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Serialize this Consumer's key/grant mutations; never hold this lock across network I/O.
    const user = (await client.query(`SELECT u.id FROM users u JOIN roles r ON r.id=u.role_id
      WHERE u.id=$1 AND u.is_active AND r.name='USER' FOR UPDATE OF u`, [userId])).rows[0];
    if (!user) throw new ApiError(403, 'FORBIDDEN', 'Active Consumer account required');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    if ((error as { code?: string }).code === '23505') throw new ApiError(409, 'KEY_EXISTS', 'An active key already exists for this API');
    throw error;
  } finally { client.release(); }
}
const grantView = (r: Record<string, any>) => {
  const available = !r.revoked_at && new Date(r.expires_at).getTime() > Date.now() && r.used_requests < r.max_requests;
  return { id: String(r.id), apiId: String(r.api_id), maxRequests: r.max_requests, usedRequests: r.used_requests,
    remainingRequests: available ? r.max_requests - r.used_requests : 0, available,
    expiresAt: new Date(r.expires_at).toISOString(), revokedAt: r.revoked_at ? new Date(r.revoked_at).toISOString() : null };
};

export class SandboxService {
  constructor(readonly pool: Pool, readonly maxRequests = 5) {
    if (!Number.isInteger(maxRequests) || maxRequests < 3 || maxRequests > 10) throw new Error('Sandbox quota must be 3–10');
  }
  async get(userId: string, apiId: string) {
    return consumerTransaction(this.pool, userId, async c => {
      await publishedApi(c, apiId);
      const grant = (await c.query('SELECT * FROM sandbox_grants WHERE consumer_id=$1 AND api_id=$2', [userId, apiId])).rows[0];
      if (!grant) throw missing();
      return grantView(grant);
    });
  }
  async grant(userId: string, apiId: string) {
    return consumerTransaction(this.pool, userId, async c => {
      await publishedApi(c, apiId);
      const inserted = await c.query(`INSERT INTO sandbox_grants(consumer_id,api_id,max_requests,expires_at)
        VALUES($1,$2,$3,NOW()+INTERVAL '24 hours') ON CONFLICT(consumer_id,api_id) DO NOTHING RETURNING *`, [userId, apiId, this.maxRequests]);
      const record = inserted.rows[0] ?? (await c.query('SELECT * FROM sandbox_grants WHERE consumer_id=$1 AND api_id=$2', [userId, apiId])).rows[0];
      return { created: !!inserted.rowCount, data: grantView(record) };
    });
  }
  async consume(userId: string, apiId: string) {
    return consumerTransaction(this.pool, userId, async c => {
      await publishedApi(c, apiId);
      try {
        const record = (await c.query('SELECT * FROM consume_sandbox_grant($1,$2)', [userId, apiId])).rows[0];
        return { grantId: String(record.sandbox_grant_id), remainingRequests: record.remaining_requests };
      } catch (error) {
        if ((error as { code?: string }).code === 'P0001') throw new ApiError(403, 'SANDBOX_EXHAUSTED', 'Sandbox unavailable, expired or exhausted; choose a subscription plan');
        throw error;
      }
    });
  }
}

const keyColumns = `id::text, api_id::text AS "apiId", key_prefix AS "keyPrefix", label,
  is_active AS "isActive", last_used_at AS "lastUsedAt", revoked_at AS "revokedAt", created_at AS "createdAt"`;
const secretHash = (secret: string) => createHash('sha256').update(secret).digest('hex');
export class ApiKeyService {
  constructor(readonly pool: Pool) {}
  private async insert(c: PoolClient, userId: string, apiId: string, label?: string | null) {
    const key = `ak_live_${randomBytes(32).toString('base64url')}`;
    const record = (await c.query(`INSERT INTO api_keys(user_id,api_id,key_prefix,key_hash,label)
      VALUES($1,$2,$3,$4,$5) RETURNING ${keyColumns}`, [userId, apiId, key.slice(0, 16), secretHash(key), label ?? null])).rows[0];
    return { ...record, key };
  }
  async create(userId: string, apiId: string, label?: string) {
    return consumerTransaction(this.pool, userId, async c => { await publishedApi(c, apiId); return this.insert(c, userId, apiId, label); });
  }
  async list(userId: string, page = 1, pageSize = 20) {
    return consumerTransaction(this.pool, userId, async c => {
      const total = Number((await c.query('SELECT COUNT(*) FROM api_keys WHERE user_id=$1', [userId])).rows[0].count);
      const items = (await c.query(`SELECT ${keyColumns} FROM api_keys WHERE user_id=$1 ORDER BY id DESC LIMIT $2 OFFSET $3`, [userId, pageSize, (page - 1) * pageSize])).rows;
      return { items, total, page, pageSize };
    });
  }
  async rotate(userId: string, keyId: string) {
    return consumerTransaction(this.pool, userId, async c => {
      const previous = (await c.query('SELECT api_id,label,is_active FROM api_keys WHERE id=$1 AND user_id=$2 FOR UPDATE', [keyId, userId])).rows[0];
      if (!previous) throw missing();
      if (!previous.is_active) throw new ApiError(409, 'KEY_REVOKED', 'Only an active key can be rotated');
      await publishedApi(c, String(previous.api_id));
      await c.query('UPDATE api_keys SET is_active=false,revoked_at=NOW() WHERE id=$1', [keyId]);
      return this.insert(c, userId, String(previous.api_id), previous.label);
    });
  }
  async revoke(userId: string, keyId: string) {
    return consumerTransaction(this.pool, userId, async c => {
      const result = await c.query('UPDATE api_keys SET is_active=false,revoked_at=COALESCE(revoked_at,NOW()) WHERE id=$1 AND user_id=$2 RETURNING id', [keyId, userId]);
      if (!result.rowCount) throw missing();
    });
  }
  /** Gateway integration only. The HTTP Consumer API never exposes this verifier. */
  async authenticate(key: string, apiId: string) {
    const denied = () => new ApiError(401, 'INVALID_API_KEY', 'Invalid API key');
    if (!/^ak_live_[A-Za-z0-9_-]{43}$/.test(key)) throw denied();
    const result = await this.pool.query(`UPDATE api_keys k SET last_used_at=NOW()
      FROM users u, roles r, apis a, api_providers p, users pu
      WHERE k.key_hash=$1 AND k.api_id=$2 AND k.is_active AND k.revoked_at IS NULL
        AND u.id=k.user_id AND u.is_active AND r.id=u.role_id AND r.name='USER'
        AND a.id=k.api_id AND a.status='Published' AND p.id=a.provider_id AND pu.id=p.user_id AND pu.is_active
      RETURNING k.id::text, k.user_id::text AS "userId", k.api_id::text AS "apiId"`, [secretHash(key), apiId]);
    if (!result.rows[0]) throw denied();
    return result.rows[0] as { id: string; userId: string; apiId: string };
  }
}
