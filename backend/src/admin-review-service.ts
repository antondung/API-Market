import type { Pool, PoolClient } from 'pg';
import { ApiError } from './auth.js';
import type { AuditService } from './audit-service.js';

export const idPattern = /^[1-9][0-9]{0,9}$/;

function id(value: string) {
  if (!idPattern.test(value) || Number(value) > 2147483647) throw new ApiError(404, 'NOT_FOUND', 'Resource not found');
  return value;
}

const row = (r: Record<string, any>): Record<string, any> => Object.fromEntries(
  Object.entries(r).map(([k, v]) => [
    k.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase()),
    v instanceof Date ? v.toISOString()
      : (/^id$|_id$/.test(k) || k === 'reviewed_by') && v !== null ? String(v)
        : ['price_monthly', 'quota'].includes(k) ? Number(v)
          : v,
  ]),
);

export interface ReviewInput { reason?: string }

/**
 * Admin review flow (US-07, US-13).
 *
 * Status transitions are enforced by the database trigger from migration 003, so this
 * service must move one legal step at a time: Submitted -> Under Review -> Approved ->
 * Published, or Under Review -> Rejected. Every transition also records an api_reviews
 * row and an Audit Log entry inside the same transaction.
 */
export class AdminReviewService {
  constructor(readonly pool: Pool, readonly audit: AuditService) {}

  async ready() {
    await this.pool.query('SELECT id FROM provider_verifications LIMIT 0');
    await this.pool.query('SELECT id FROM audit_logs LIMIT 0');
  }

  private async transaction<T>(actorId: string, ip: string | null, action: (client: PoolClient) => Promise<T>) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await action(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      const code = (error as { code?: string }).code;
      if (code === '23505') throw new ApiError(409, 'RESOURCE_EXISTS', 'Resource already exists');
      if (['23503', '23514', '22003'].includes(code ?? '')) {
        throw new ApiError(409, 'RESOURCE_CONFLICT', 'Resource conflicts with current database state');
      }
      throw error;
    } finally {
      client.release();
    }
  }

  // ---------------------------------------------------------------- Provider verification

  async listVerifications(status: 'Pending' | 'Verified' | 'Rejected', page: number, pageSize: number) {
    // Only the newest submission per provider decides that provider's status.
    const base = `
      FROM provider_verifications v
      JOIN api_providers p ON p.id = v.provider_id
      JOIN users u ON u.id = p.user_id
      WHERE v.id = (SELECT MAX(id) FROM provider_verifications WHERE provider_id = v.provider_id)
        AND v.status = $1`;
    const total = Number((await this.pool.query(`SELECT COUNT(*) ${base}`, [status])).rows[0].count);
    const rows = (await this.pool.query(
      `SELECT v.*, u.email, u.name AS user_name, p.provider_name
       ${base}
       ORDER BY v.id DESC LIMIT $2 OFFSET $3`,
      [status, pageSize, (page - 1) * pageSize],
    )).rows;
    return { items: rows.map(row), total, page, pageSize };
  }

  async getVerification(providerId: string) {
    const result = (await this.pool.query(
      `SELECT v.*, u.email, u.name AS user_name
       FROM provider_verifications v
       JOIN api_providers p ON p.id = v.provider_id
       JOIN users u ON u.id = p.user_id
       WHERE v.provider_id = $1 ORDER BY v.id DESC LIMIT 1`,
      [id(providerId)],
    )).rows[0];
    if (!result) throw new ApiError(404, 'NOT_FOUND', 'Verification not found');
    return row(result);
  }

  async reviewVerification(actorId: string, ip: string | null, providerId: string, decision: 'Verified' | 'Rejected', reason?: string) {
    return this.transaction(actorId, ip, async (client) => {
      const provider = id(providerId);
      const latest = (await client.query(
        'SELECT * FROM provider_verifications WHERE provider_id = $1 ORDER BY id DESC LIMIT 1 FOR UPDATE',
        [provider],
      )).rows[0];
      if (!latest) throw new ApiError(404, 'NOT_FOUND', 'Verification not found');
      if (latest.status !== 'Pending') throw new ApiError(409, 'VERIFICATION_ALREADY_REVIEWED', 'Verification was already reviewed');
      if (decision === 'Rejected' && !reason?.trim()) throw new ApiError(400, 'REASON_REQUIRED', 'Rejection reason is required');

      const updated = (await client.query(
        `UPDATE provider_verifications
         SET status = $1, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $2, reject_reason = $3
         WHERE id = $4 RETURNING *`,
        [decision, id(actorId), decision === 'Rejected' ? reason!.trim() : null, latest.id],
      )).rows[0];

      await this.audit.write(client, {
        actorId, actorRole: 'ADMIN',
        action: decision === 'Verified' ? 'provider.verification.approved' : 'provider.verification.rejected',
        targetType: 'provider', targetId: provider,
        detail: { verificationId: String(latest.id), reason: reason ?? null },
        ip,
      });
      return row(updated);
    });
  }

  // ---------------------------------------------------------------- API review

  private async reviewableApi(client: PoolClient, apiId: string) {
    const result = (await client.query('SELECT * FROM apis WHERE id = $1 FOR UPDATE', [id(apiId)])).rows[0];
    if (!result) throw new ApiError(404, 'NOT_FOUND', 'API not found');
    return result;
  }

  /** Full dossier the Admin needs before deciding (issue #6: Provider, docs, endpoints, pricing, legal). */
  async getApiDossier(apiId: string) {
    const api = (await this.pool.query(
      `SELECT a.*, p.provider_name, u.email AS provider_email, u.name AS account_name
       FROM apis a
       JOIN api_providers p ON p.id = a.provider_id
       JOIN users u ON u.id = p.user_id
       WHERE a.id = $1`,
      [id(apiId)],
    )).rows[0];
    if (!api) throw new ApiError(404, 'NOT_FOUND', 'API not found');

    const [versions, endpoints, plans, legal, documentation, reviews, verification] = await Promise.all([
      this.pool.query('SELECT * FROM api_versions WHERE api_id = $1 ORDER BY id', [apiId]),
      this.pool.query('SELECT * FROM api_endpoints WHERE api_id = $1 ORDER BY id', [apiId]),
      this.pool.query('SELECT * FROM api_plans WHERE api_id = $1 ORDER BY id', [apiId]),
      this.pool.query('SELECT * FROM api_legal_declarations WHERE api_id = $1 ORDER BY id DESC LIMIT 1', [apiId]),
      this.pool.query('SELECT * FROM api_documentations WHERE api_id = $1 ORDER BY id', [apiId]),
      this.pool.query(
        `SELECT r.*, u.email AS reviewer_email FROM api_reviews r
         LEFT JOIN users u ON u.id = r.reviewer_id
         WHERE r.api_id = $1 ORDER BY r.id DESC`,
        [apiId],
      ),
      this.pool.query(
        'SELECT * FROM provider_verifications WHERE provider_id = $1 ORDER BY id DESC LIMIT 1',
        [api.provider_id],
      ),
    ]);

    return {
      api: row(api),
      provider: {
        verification: verification.rows[0] ? row(verification.rows[0]) : null,
        providerName: api.provider_name,
        email: api.provider_email,
        accountName: api.account_name,
      },
      versions: versions.rows.map(row),
      endpoints: endpoints.rows.map(row),
      plans: plans.rows.map(row),
      legal: legal.rows[0] ? row(legal.rows[0]) : null,
      documentation: documentation.rows.map(row),
      reviews: reviews.rows.map(row),
    };
  }

  async listApis(status: string, page: number, pageSize: number) {
    const total = Number((await this.pool.query('SELECT COUNT(*) FROM apis WHERE status = $1', [status])).rows[0].count);
    const rows = (await this.pool.query(
      `SELECT a.*, p.provider_name, u.email AS provider_email
       FROM apis a
       JOIN api_providers p ON p.id = a.provider_id
       JOIN users u ON u.id = p.user_id
       WHERE a.status = $1
       ORDER BY a.submitted_at NULLS LAST, a.id DESC
       LIMIT $2 OFFSET $3`,
      [status, pageSize, (page - 1) * pageSize],
    )).rows;
    return { items: rows.map(row), total, page, pageSize };
  }

  /**
   * Move an API one step along the review path.
   * `next` is the target status; the intermediate Submitted -> Under Review step is
   * performed automatically when the Admin approves or rejects, because the database
   * trigger only allows single-step transitions.
   */
  async reviewApi(actorId: string, ip: string | null, apiId: string, next: 'Under Review' | 'Approved' | 'Rejected' | 'Published', reason?: string) {
    return this.transaction(actorId, ip, async (client) => {
      const api = await this.reviewableApi(client, apiId);
      const reviewer = id(actorId);
      const steps: string[] = [];

      const move = async (from: string, to: string, why?: string) => {
        // The 003 trigger validates this transition and stamps the matching timestamp column.
        await client.query('UPDATE apis SET status = $1 WHERE id = $2', [to, api.id]);
        await client.query(
          'INSERT INTO api_reviews(api_id, reviewer_id, from_status, to_status, reason) VALUES($1,$2,$3,$4,$5)',
          [api.id, reviewer, from, to, why ?? null],
        );
        steps.push(`${from}->${to}`);
      };

      if (next === 'Rejected' && !reason?.trim()) throw new ApiError(400, 'REASON_REQUIRED', 'Rejection reason is required');
      if (next === 'Published' && api.status !== 'Approved') {
        throw new ApiError(409, 'INVALID_TRANSITION', `Only an approved API can be published (current: ${api.status})`);
      }

      if (api.status === 'Submitted') {
        await move('Submitted', 'Under Review');
      } else if (api.status !== 'Under Review' && !(next === 'Published' && api.status === 'Approved')) {
        throw new ApiError(409, 'INVALID_TRANSITION', `API is not awaiting review (current: ${api.status})`);
      }

      const current = next === 'Published' && api.status === 'Approved' ? 'Approved' : 'Under Review';
      await move(current, next, reason);

      await this.audit.write(client, {
        actorId, actorRole: 'ADMIN',
        action: `api.review.${next.toLowerCase().replace(' ', '-')}`,
        targetType: 'api', targetId: String(api.id),
        detail: { name: api.name, from: api.status, to: next, steps, reason: reason ?? null },
        ip,
      });

      const updated = (await client.query('SELECT * FROM apis WHERE id = $1', [api.id])).rows[0];
      return row(updated);
    });
  }
}
