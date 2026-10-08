import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AuthStore, Role, Session, User } from './store.js';

const migrationDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../backend/migrations');
const dbRoles: Record<Role, string> = { Consumer: 'USER', Provider: 'API_PROVIDER', Admin: 'ADMIN' };
const apiRoles: Record<string, Role> = { USER: 'Consumer', API_PROVIDER: 'Provider', ADMIN: 'Admin' };
const userQuery = 'SELECT u.*, r.name AS role_name FROM users u JOIN roles r ON r.id = u.role_id';
type Row = Record<string, unknown>;
function toUser(row: Row | undefined): User | undefined {
  if (!row) return undefined;
  const role = apiRoles[String(row.role_name)];
  if (!role) throw new Error('Unsupported database role');
  return { id: String(row.id), email: String(row.email), name: String(row.name),
    passwordHash: String(row.password_hash), role, active: row.is_active === 1 };
}
function toSession(row: Row | undefined): Session | undefined {
  return row && { id: String(row.id), userId: String(row.user_id), refreshHash: String(row.token_hash),
    expiresAt: Date.parse(String(row.expires_at)), revoked: row.revoked_at !== null };
}

export class SqliteAuthStore implements AuthStore {
  readonly db: DatabaseSync;
  constructor(path: string) {
    if (path !== ':memory:') mkdirSync(dirname(resolve(path)), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
  }
  migrate() {
    this.db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)');
    for (const name of readdirSync(migrationDir).filter(n => /^\d+_.*\.sql$/.test(n)).sort()) {
      const source = readFileSync(resolve(migrationDir, name), 'utf8');
      const checksum = createHash('sha256').update(source.replace(/\r\n/g, '\n')).digest('hex');
      this.db.exec('BEGIN IMMEDIATE');
      try {
        const applied = this.db.prepare('SELECT checksum FROM schema_migrations WHERE name = ?').get(name);
        if (applied) {
          if (applied.checksum !== checksum) throw new Error(`Applied migration changed: ${name}`);
        } else {
          // Danh's scripts carry their own transaction; wrap their body with history atomically.
          const sql = source.replace(/^\s*(?:PRAGMA foreign_keys = ON;|BEGIN TRANSACTION;|COMMIT;)\s*$/gm, '');
          this.db.exec(sql);
          this.db.prepare('INSERT INTO schema_migrations (name, checksum) VALUES (?, ?)').run(name, checksum);
        }
        this.db.exec('COMMIT');
      } catch (error) { this.db.exec('ROLLBACK'); throw error; }
    }
  }
  async createUser(user: User) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const existing = this.db.prepare('SELECT id FROM users WHERE email = ?').get(user.email);
      if (existing) { this.db.exec('ROLLBACK'); return undefined; }
      const role = this.db.prepare('SELECT id FROM roles WHERE name = ?').get(dbRoles[user.role]);
      if (!role) throw new Error('Role seed migration is missing');
      const result = this.db.prepare('INSERT INTO users (name, email, password_hash, role_id, is_active) VALUES (?, ?, ?, ?, ?)')
        .run(user.name ?? user.email.split('@')[0]!, user.email, user.passwordHash, Number(role.id), user.active ? 1 : 0);
      if (user.role === 'Provider') {
        this.db.prepare('INSERT INTO api_providers (user_id, provider_name) VALUES (?, ?)').run(result.lastInsertRowid, user.name ?? user.email);
      }
      const saved = toUser(this.db.prepare(`${userQuery} WHERE u.id = ?`).get(result.lastInsertRowid))!;
      this.db.exec('COMMIT');
      return saved;
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  async findUserByEmail(email: string) { return toUser(this.db.prepare(`${userQuery} WHERE u.email = ?`).get(email)); }
  async findUserById(id: string) { return toUser(this.db.prepare(`${userQuery} WHERE u.id = ?`).get(id)); }
  async createSession(session: Session) {
    const result = this.db.prepare('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)')
      .run(session.userId, session.refreshHash, new Date(session.expiresAt).toISOString());
    return { ...session, id: String(result.lastInsertRowid) };
  }
  async findSession(id: string) { return toSession(this.db.prepare('SELECT * FROM refresh_tokens WHERE id = ?').get(id)); }
  async findSessionByRefresh(hash: string) { return toSession(this.db.prepare('SELECT * FROM refresh_tokens WHERE token_hash = ?').get(hash)); }
  async rotateSession(id: string, previousHash: string, nextHash: string, now: number) {
    const result = this.db.prepare('UPDATE refresh_tokens SET token_hash = ? WHERE id = ? AND token_hash = ? AND revoked_at IS NULL AND expires_at > ?')
      .run(nextHash, id, previousHash, new Date(now).toISOString());
    return result.changes === 1;
  }
  async revokeSession(id: string) {
    this.db.prepare('UPDATE refresh_tokens SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL').run(new Date().toISOString(), id);
  }
  close() { this.db.close(); }
}
