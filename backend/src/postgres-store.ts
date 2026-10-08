import { Pool } from 'pg';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AuthStore, Role, Session, User } from './store.js';

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
  async close() { await this.pool.end(); }
}
