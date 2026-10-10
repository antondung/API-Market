import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { AdminUserRecord, AuthStore, ListUsersQuery, ListUsersResult, Session, User } from './store.js';

const derive = promisify(scrypt);
const refreshHash = (token: string) => createHash('sha256').update(token).digest('hex');
const publicUser = ({ id, email, role, name }: User) => ({ id, email, role, name: name ?? email.split('@')[0] });
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
const unauthorized = () => new ApiError(401, 'UNAUTHORIZED', 'Authentication failed');

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const key = await derive(password, salt, 64) as Buffer;
  return `${salt}:${key.toString('hex')}`;
}
async function checkPassword(password: string, encoded: string) {
  if (/^\$2[aby]\$/.test(encoded)) {
    if (bcrypt.truncates(password)) return false;
    return bcrypt.compare(password, encoded);
  }
  const [salt, value] = encoded.split(':');
  if (!salt || !value) return false;
  const actual = await derive(password, salt, 64) as Buffer;
  const expected = Buffer.from(value, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export class AuthService {
  private dummyHash: Promise<string>;
  constructor(private store: AuthStore, private secret: string, private now = Date.now) {
    if (Buffer.byteLength(secret) < 32) throw new Error('JWT secret must contain at least 32 bytes');
    this.dummyHash = hashPassword(randomBytes(32).toString('hex'));
  }
  async register(email: string, password: string, role: 'Consumer' | 'Provider', name?: string) {
    email = email.trim().toLowerCase();
    const user: User = { id: randomUUID(), email, passwordHash: await hashPassword(password), role, active: true, name: name ?? email.split('@')[0]?.slice(0, 100) };
    const saved = await this.store.createUser(user);
    if (!saved) throw new ApiError(409, 'EMAIL_EXISTS', 'Email already registered');
    return publicUser(saved);
  }
  async login(email: string, password: string) {
    email = email.trim().toLowerCase();
    const user = await this.store.findUserByEmail(email);
    const valid = await checkPassword(password, user?.passwordHash ?? await this.dummyHash);
    if (!user || !valid || !user.active) throw unauthorized();
    const refreshToken = randomBytes(32).toString('base64url');
    const session: Session = {
      id: randomUUID(), userId: user.id, refreshHash: refreshHash(refreshToken),
      expiresAt: this.now() + 7 * 24 * 60 * 60 * 1000, revoked: false,
    };
    const saved = await this.store.createSession(session);
    return this.tokens(user, saved, refreshToken);
  }
  private tokens(user: User, session: Session, refreshToken: string) {
    const accessToken = jwt.sign({ sid: session.id, iat: Math.floor(this.now() / 1000) }, this.secret, {
      algorithm: 'HS256', issuer: 'api-market', audience: 'api-market-backend', subject: user.id, expiresIn: 900,
    });
    return { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: 900, user: publicUser(user) };
  }
  async refresh(token: string) {
    const previous = refreshHash(token);
    const session = await this.store.findSessionByRefresh(previous);
    if (!session || session.revoked || session.expiresAt <= this.now()) throw unauthorized();
    const user = await this.store.findUserById(session.userId);
    if (!user?.active) throw unauthorized();
    const next = randomBytes(32).toString('base64url');
    if (!await this.store.rotateSession(session.id, previous, refreshHash(next), this.now())) throw unauthorized();
    return this.tokens(user, session, next);
  }
  async authenticate(token: string) {
    let payload: jwt.JwtPayload;
    try {
      const value = jwt.verify(token, this.secret, {
        algorithms: ['HS256'], issuer: 'api-market', audience: 'api-market-backend',
        clockTimestamp: Math.floor(this.now() / 1000),
      });
      if (typeof value === 'string' || typeof value.sub !== 'string' || typeof value.sid !== 'string') throw unauthorized();
      payload = value;
    } catch { throw unauthorized(); }
    const session = await this.store.findSession(payload.sid as string);
    if (!session || session.revoked || session.userId !== payload.sub || session.expiresAt <= this.now()) throw unauthorized();
    const user = await this.store.findUserById(session.userId);
    if (!user?.active) throw unauthorized();
    return { user: publicUser(user), sessionId: session.id };
  }
  async logout(sessionId: string) { await this.store.revokeSession(sessionId); }

    // =========================================
    // Quản trị người dùng (US-04)
    // =========================================

    async listUsers(query: ListUsersQuery): Promise<ListUsersResult> {
      return this.store.listUsers(query);
    }

    /**
     * Khóa hoặc mở khóa tài khoản.
     * Khi khóa, thu hồi toàn bộ phiên để access token đã cấp mất hiệu lực ngay
     * ở lần xác thực kế tiếp (AC US-04 #4).
     */
    async setUserActive(actorId: string, targetId: string, active: boolean) {
      if (actorId === targetId) {
        throw new ApiError(409, 'CANNOT_MODIFY_SELF', 'Không thể khóa tài khoản của chính mình');
      }
      const updated = await this.store.setUserActive(targetId, active);
      if (!updated) throw new ApiError(404, 'USER_NOT_FOUND', 'Không tìm thấy người dùng');
      const revokedSessions = active ? 0 : await this.store.revokeAllSessions(targetId);
      return { user: updated, revokedSessions };
    }
  }
