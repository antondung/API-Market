import type { Pool, PoolClient } from 'pg';
import { ApiError } from './auth.js';

export type AuditActorRole = 'USER' | 'API_PROVIDER' | 'ADMIN';

export interface AuditEntry {
  actorId: string | null;
  actorRole: AuditActorRole | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  detail?: Record<string, unknown>;
  ip?: string | null;
}

export interface AuditQuery {
  actorId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
}

export interface AuditRecord {
  id: string;
  actorId: string | null;
  actorRole: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  detail: Record<string, unknown>;
  ip: string | null;
  createdAt: string;
}

const toRecord = (r: Record<string, any>): AuditRecord => ({
  id: String(r.id),
  actorId: r.actor_id === null ? null : String(r.actor_id),
  actorRole: r.actor_role ?? null,
  action: r.action,
  targetType: r.target_type ?? null,
  targetId: r.target_id ?? null,
  detail: r.detail ?? {},
  ip: r.ip ?? null,
  createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
});

/**
 * Audit log is written by both the Admin review flow and the Provider submission flow,
 * so it must be usable with either the shared pool or a caller-owned transaction client.
 */
export class AuditService {
  constructor(readonly pool: Pool) {}

  async ready() {
    await this.pool.query('SELECT id FROM audit_logs LIMIT 0');
  }

  async write(client: Pool | PoolClient, entry: AuditEntry) {
    const detail = entry.detail ?? {};
    if (detail === null || Array.isArray(detail) || typeof detail !== 'object') {
      throw new ApiError(500, 'AUDIT_DETAIL_INVALID', 'Audit detail must be an object');
    }
    await client.query(
      `INSERT INTO audit_logs(actor_id,actor_role,action,target_type,target_id,detail,ip)
       VALUES($1,$2,$3,$4,$5,$6,$7)`,
      [
        entry.actorId,
        entry.actorRole,
        entry.action,
        entry.targetType ?? null,
        entry.targetId === null || entry.targetId === undefined ? null : String(entry.targetId),
        JSON.stringify(detail),
        entry.ip ?? null,
      ],
    );
  }

  async list(query: AuditQuery) {
    const where: string[] = [];
    const values: unknown[] = [];
    const add = (clause: string, value: unknown) => { values.push(value); where.push(clause.replace('$?', `$${values.length}`)); };

    if (query.actorId) add('actor_id = $?', query.actorId);
    if (query.action) add('action = $?', query.action);
    if (query.targetType) add('target_type = $?', query.targetType);
    if (query.targetId) add('target_id = $?', query.targetId);
    if (query.from) add('created_at >= $?', query.from);
    if (query.to) add('created_at <= $?', query.to);

    const filter = where.length ? ` WHERE ${where.join(' AND ')}` : '';
    const total = Number((await this.pool.query(`SELECT COUNT(*) FROM audit_logs${filter}`, values)).rows[0].count);
    const offset = (query.page - 1) * query.pageSize;
    const rows = (await this.pool.query(
      `SELECT * FROM audit_logs${filter} ORDER BY id DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, query.pageSize, offset],
    )).rows;

    return { items: rows.map(toRecord), total, page: query.page, pageSize: query.pageSize };
  }

  /** Distinct action names, so the Admin UI can offer a filter without hardcoding the list. */
  async actions() {
    const rows = (await this.pool.query('SELECT DISTINCT action FROM audit_logs ORDER BY action')).rows;
    return rows.map(r => r.action as string);
  }
}
