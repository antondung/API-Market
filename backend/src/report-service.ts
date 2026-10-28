import type { Pool, PoolClient } from 'pg';
import { ApiError } from './auth.js';
import { AuditService } from './audit-service.js';

export const REPORT_CATEGORIES = [
  'Security Vulnerability', 'Copyright / IP Infringement', 'Extreme Downtime', 'Malicious Data',
] as const;
export type ReportCategory = (typeof REPORT_CATEGORIES)[number];
export type ModerationAction = 'Suspend' | 'Restore' | 'Remove' | 'Dismiss';

export interface ReportInput {
  category: ReportCategory;
  description: string;
}

const row = (record: Record<string, any>) => Object.fromEntries(Object.entries(record).map(([key, value]) => [
  key.replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase()),
  value instanceof Date ? value.toISOString() : /^id$|_id$/.test(key) && value !== null ? String(value) : value,
]));

/**
 * Consumer reports and Admin moderation (US-15).
 *
 * Moderation is the only path that can move an API to `Suspended`: the status trigger allows
 * `Published <-> Suspended` and nothing else, so a report decision cannot silently corrupt the
 * publication state machine.
 */
export class ReportService {
  private readonly audit: AuditService;

  constructor(readonly pool: Pool, audit = new AuditService(pool)) {
    this.audit = audit;
  }

  async ready() {
    await this.pool.query('SELECT id,status FROM reports LIMIT 0');
  }

  /** Only Published APIs can be reported: an unpublished API is already invisible to Consumers. */
  async create(reporterId: string, apiId: string, input: ReportInput) {
    return this.transaction(reporterId, async client => {
      const api = (await client.query('SELECT id,status FROM apis WHERE id=$1', [apiId])).rows[0];
      if (!api || api.status !== 'Published') throw new ApiError(404, 'NOT_FOUND', 'Published API not found');
      const inserted = (await client.query(
        `INSERT INTO reports(api_id,reporter_id,category,description) VALUES($1,$2,$3,$4)
         RETURNING id,api_id,reporter_id,category,description,status,created_at`,
        [apiId, reporterId, input.category, input.description.trim()]
      )).rows[0];
      return row(inserted);
    });
  }

  /** A Consumer sees only their own reports. */
  async listMine(reporterId: string, page = 1, pageSize = 20) {
    return this.transaction(reporterId, async client => {
      const offset = (page - 1) * pageSize;
      const items = (await client.query(
        `SELECT id,api_id,category,description,status,action_taken,created_at,reviewed_at
         FROM reports WHERE reporter_id=$1 ORDER BY created_at DESC, id DESC LIMIT $2 OFFSET $3`,
        [reporterId, pageSize, offset]
      )).rows.map(row);
      const total = (await client.query('SELECT COUNT(*)::int AS n FROM reports WHERE reporter_id=$1', [reporterId])).rows[0].n;
      return { items, total, page, pageSize };
    });
  }

  /** Admin queue. Defaults to the open cases so the queue is actionable. */
  async listForAdmin(status: string | null, page = 1, pageSize = 20) {
    const client = await this.pool.connect();
    try {
      const offset = (page - 1) * pageSize;
      // Both reports and apis have a status column, so the predicate must be qualified.
      const where = status ? 'WHERE r.status=$1' : "WHERE r.status IN ('Pending','Under Investigation')";
      const params = status ? [status, pageSize, offset] : [pageSize, offset];
      const items = (await client.query(
        `SELECT r.id,r.api_id,r.reporter_id,r.category,r.description,r.status,r.action_taken,
                r.created_at,r.reviewed_at,r.reviewed_by,a.name AS api_name,a.status AS api_status
         FROM reports r JOIN apis a ON a.id=r.api_id ${where}
         ORDER BY r.created_at ASC, r.id ASC LIMIT $${status ? 2 : 1} OFFSET $${status ? 3 : 2}`,
        params
      )).rows.map(row);
      const total = (await client.query(
        `SELECT COUNT(*)::int AS n FROM reports r ${status ? 'WHERE r.status=$1' : "WHERE r.status IN ('Pending','Under Investigation')"}`,
        status ? [status] : []
      )).rows[0].n;
      return { items, total, page, pageSize };
    } finally { client.release(); }
  }

  /**
   * Applies a moderation decision. `Suspend`/`Restore` change the API status; `Remove` deletes
   * nothing but leaves the API suspended so existing keys stop working; `Dismiss` closes the
   * report without touching the API.
   */
  /**
   * Applies a moderation decision.
   *
   * Suspend/Remove move a Published API to Suspended; Restore moves it back. Restore is allowed
   * on a report that was already Resolved by a Suspend: without that path an API would stay
   * Suspended forever, because a suspended API cannot be reported again to open a new case.
   * A dismissed report cannot be reopened.
   */
  async moderate(actorId: string, reportId: string, action: ModerationAction, note: string) {
    return this.transaction(actorId, async client => {
      const report = (await client.query(
        'SELECT id,api_id,status,action_taken FROM reports WHERE id=$1 FOR UPDATE', [reportId]
      )).rows[0];
      if (!report) throw new ApiError(404, 'NOT_FOUND', 'Report not found');
      if (report.status === 'Dismissed') {
        throw new ApiError(409, 'REPORT_CLOSED', 'Report has already been dismissed');
      }

      const api = (await client.query('SELECT id,status FROM apis WHERE id=$1 FOR UPDATE', [report.api_id])).rows[0];
      if (!api) throw new ApiError(404, 'NOT_FOUND', 'API not found');

      // Restore is a follow-up decision on a case already resolved by Suspend.
      const isRestoreFollowUp = action === 'Restore' && report.status === 'Resolved';
      if (report.status === 'Resolved' && !isRestoreFollowUp) {
        throw new ApiError(409, 'REPORT_CLOSED', 'Report has already been decided');
      }

      let nextApiStatus = api.status;
      if (action === 'Suspend' || action === 'Remove') {
        if (api.status !== 'Published') throw new ApiError(409, 'INVALID_STATE', 'Only a Published API can be suspended');
        await client.query("UPDATE apis SET status='Suspended' WHERE id=$1", [api.id]);
        nextApiStatus = 'Suspended';
      }
      if (action === 'Restore') {
        if (api.status !== 'Suspended') throw new ApiError(409, 'INVALID_STATE', 'Only a Suspended API can be restored');
        await client.query("UPDATE apis SET status='Published' WHERE id=$1", [api.id]);
        nextApiStatus = 'Published';
      }

      // A Restore follow-up keeps the report Resolved; it only appends the later decision.
      const nextStatus = action === 'Dismiss' ? 'Dismissed' : 'Resolved';
      const previousAction = typeof report.action_taken === 'string' ? report.action_taken : null;
      const actionTaken = isRestoreFollowUp && previousAction
        ? `${previousAction} | ${action}: ${note.trim()}`
        : `${action}: ${note.trim()}`;
      const updated = (await client.query(
        `UPDATE reports SET status=$1, reviewed_by=$2, reviewed_at=CURRENT_TIMESTAMP, action_taken=$3
         WHERE id=$4 RETURNING id,api_id,status,action_taken,reviewed_at`,
        [nextStatus, actorId, actionTaken, reportId]
      )).rows[0];

      await this.audit.write(client, {
        actorId, actorRole: 'ADMIN', action: `report.${action.toLowerCase()}`,
        targetType: 'api', targetId: String(report.api_id),
        // The note is operator text; it must never carry credentials or payloads.
        detail: { reportId: String(reportId), from: api.status, to: nextApiStatus },
      });
      return row(updated);
    });
  }

  private async transaction<T>(actorId: string, work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); void actorId; }
  }
}