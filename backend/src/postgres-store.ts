import { Pool } from 'pg';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AdminUserRecord, AuthStore, ListUsersQuery, ListUsersResult, Role, Session, User } from './store.js';

const migrationDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../migrations');
const dbRoles: Record<Role, string> = { Consumer: 'USER', Provider: 'API_PROVIDER', Admin: 'ADMIN' };
const apiRoles: Record<string, Role> = { USER: 'Consumer', API_PROVIDER: 'Provider', ADMIN: 'Admin' };
const userQuery = 'SELECT u.*, r.name AS role_name FROM users u JOIN roles r ON r.id = u.role_id';
function toUser(row: Record<string, unknown> | undefined): User | undefined {
  if (!row) return undefined;
  const role = apiRoles[String(row.role_name)];
  if (!role) throw new Error('Unsupported database role');
  return { id: String(row.id), email: String(row.email), name: String(row.name), passwordHash: String(row.password_hash), role, active: row.is_active === true };
}
function toSession(row: Record<string, unknown> | undefined): Session | undefined {
  return row && { id: String(row.id), userId: String(row.user_id), refreshHash: String(row.token_hash),
    expiresAt: new Date(row.expires_at as string | Date).getTime(), revoked: row.revoked_at !== null };
}
function toAdminRecord(row: Record<string, unknown>): AdminUserRecord {
  const role = apiRoles[String(row.role_name)];
  if (!role) throw new Error('Unsupported database role');
  return {
    id: String(row.id), name: String(row.name), email: String(row.email), role,
    active: row.is_active === true,
    createdAt: new Date(row.created_at as string | Date).toISOString(),
  };
}
export class PostgresAuthStore implements AuthStore {
  readonly pool: Pool;
  constructor(connectionString: string, schema?: string) {
    if (!connectionString) throw new Error('DATABASE_URL is required');
    if (schema && !/^[a-z][a-z0-9_]*$/.test(schema)) throw new Error('Invalid test schema');
    this.pool = new Pool({ connectionString, options: schema ? `-c search_path=${schema},public` : undefined });
    this.pool.on('error', () => console.error('PostgreSQL idle connection error'));
  }
  async ready() {
    await this.pool.query('SELECT u.id, r.name, t.token_hash FROM users u JOIN roles r ON r.id=u.role_id LEFT JOIN refresh_tokens t ON t.user_id=u.id LIMIT 0');
  }
  async migrate(demoSeed = false) {
    if (demoSeed && process.env.NODE_ENV === 'production') throw new Error('Demo seed is disabled in production');
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock(913002)');
      await client.query('CREATE TABLE IF NOT EXISTS backend_schema_migrations (name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)');
      const files = ['001_create_auth_schema.sql', ...(demoSeed ? ['002_seed_auth_data.sql'] : [])];
      for (const name of files) {
        const source = readFileSync(resolve(migrationDir, name), 'utf8');
        const checksum = createHash('sha256').update(source.replace(/\r\n/g, '\n')).digest('hex');
        const applied = await client.query('SELECT checksum FROM backend_schema_migrations WHERE name=$1', [name]);
        if (applied.rows[0]) {
          if (applied.rows[0].checksum !== checksum) throw new Error(`Applied migration changed: ${name}`);
          continue;
        }
        await client.query(source.replace(/^\s*BEGIN;\s*/, '').replace(/\s*COMMIT;\s*$/, ''));
        await client.query('INSERT INTO backend_schema_migrations (name,checksum) VALUES ($1,$2)', [name, checksum]);
      }
      // Roles are needed for signup; demo users from 002 are explicit local seed only.
      for (const role of Object.values(dbRoles)) await client.query('INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [role]);
      await client.query('COMMIT');
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  }
  async createUser(user: User) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query('INSERT INTO users (name,email,password_hash,role_id,is_active) VALUES ($1,$2,$3,(SELECT id FROM roles WHERE name=$4),$5) ON CONFLICT (email_normalized) DO NOTHING RETURNING id',
        [user.name ?? user.email.split('@')[0]!.slice(0, 100), user.email, user.passwordHash, dbRoles[user.role], user.active]);
      if (!result.rows[0]) { await client.query('ROLLBACK'); return undefined; }
      const id = result.rows[0].id;
      if (user.role === 'Provider') await client.query('INSERT INTO api_providers (user_id,provider_name) VALUES ($1,$2)', [id, user.name ?? user.email.split('@')[0]!.slice(0, 100)]);
      const saved = await client.query(`${userQuery} WHERE u.id=$1`, [id]);
      await client.query('COMMIT');
      return toUser(saved.rows[0]);
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  }
  async findUserByEmail(email: string) { return toUser((await this.pool.query(`${userQuery} WHERE u.email_normalized=LOWER(BTRIM($1))`, [email])).rows[0]); }
  async findUserById(id: string) { return toUser((await this.pool.query(`${userQuery} WHERE u.id=$1`, [id])).rows[0]); }
  async createSession(session: Session) {
    const result = await this.pool.query('INSERT INTO refresh_tokens (user_id,token_hash,expires_at) VALUES ($1,$2,$3) RETURNING id', [session.userId, session.refreshHash, new Date(session.expiresAt)]);
    return { ...session, id: String(result.rows[0].id) };
  }
  async findSession(id: string) { return toSession((await this.pool.query('SELECT * FROM refresh_tokens WHERE id=$1', [id])).rows[0]); }
  async findSessionByRefresh(hash: string) { return toSession((await this.pool.query('SELECT * FROM refresh_tokens WHERE token_hash=$1', [hash])).rows[0]); }
  async rotateSession(id: string, previousHash: string, nextHash: string, now: number) {
    const result = await this.pool.query('UPDATE refresh_tokens SET token_hash=$1 WHERE id=$2 AND token_hash=$3 AND revoked_at IS NULL AND expires_at>$4', [nextHash, id, previousHash, new Date(now)]);
    return result.rowCount === 1;
  }
  async revokeSession(id: string) { await this.pool.query('UPDATE refresh_tokens SET revoked_at=CURRENT_TIMESTAMP WHERE id=$1 AND revoked_at IS NULL', [id]); }
    async listUsers(query: ListUsersQuery): Promise<ListUsersResult> {
      const conditions: string[] = [];
      const values: unknown[] = [];
      const needle = query.search?.trim();
      if (needle) {
        values.push(`%${needle}%`);
        // Tìm theo email hoặc tên; ILIKE để không phân biệt hoa thường.
        conditions.push(`(u.email ILIKE $${values.length} OR u.name ILIKE $${values.length})`);
      }
      if (query.role) {
        values.push(dbRoles[query.role]);
        conditions.push(`r.name = $${values.length}`);
      }
      if (query.active !== undefined) {
        values.push(query.active);
        conditions.push(`u.is_active = $${values.length}`);
      }
      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const totalResult = await this.pool.query(
        `SELECT COUNT(*)::int AS total FROM users u JOIN roles r ON r.id = u.role_id ${where}`, values);
      const offset = (query.page - 1) * query.pageSize;
      const rows = await this.pool.query(
        `SELECT u.id, u.name, u.email, u.is_active, u.created_at, r.name AS role_name
         FROM users u JOIN roles r ON r.id = u.role_id ${where}
         ORDER BY u.created_at DESC, u.id DESC
         LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        [...values, query.pageSize, offset]);
      return {
        items: rows.rows.map(toAdminRecord),
        total: totalResult.rows[0]?.total ?? 0,
        page: query.page,
        pageSize: query.pageSize,
      };
    }
    async setUserActive(id: string, active: boolean) {
      let result;
      try {
        result = await this.pool.query(
          `UPDATE users SET is_active=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING id`, [active, id]);
      } catch (error) {
        // PostgreSQL dùng IDENTITY (INTEGER); id không phải số sẽ lỗi 22P02.
        // Coi như không tìm thấy thay vì để lộ lỗi 500.
        if ((error as { code?: string }).code === '22P02') return undefined;
        throw error;
      }
      if (!result.rows[0]) return undefined;
      const row = await this.pool.query(
        `SELECT u.id, u.name, u.email, u.is_active, u.created_at, r.name AS role_name
         FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id=$1`, [id]);
      return row.rows[0] ? toAdminRecord(row.rows[0]) : undefined;
    }
    async revokeAllSessions(userId: string) {
      const result = await this.pool.query(
        'UPDATE refresh_tokens SET revoked_at=CURRENT_TIMESTAMP WHERE user_id=$1 AND revoked_at IS NULL', [userId]);
      return result.rowCount ?? 0;
    }
    async close() { await this.pool.end(); }
  }
