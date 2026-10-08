export type Role = 'Consumer' | 'Provider' | 'Admin';
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  active: boolean;
  name?: string;
}
export interface Session {
  id: string;
  userId: string;
  refreshHash: string;
  expiresAt: number;
  revoked: boolean;
}

// DB adapters must enforce unique email and atomic refresh rotation.
export interface AuthStore {
  createUser(user: User): Promise<User | undefined>;
  findUserByEmail(email: string): Promise<User | undefined>;
  findUserById(id: string): Promise<User | undefined>;
  createSession(session: Session): Promise<Session>;
  findSession(id: string): Promise<Session | undefined>;
  findSessionByRefresh(hash: string): Promise<Session | undefined>;
  rotateSession(id: string, previousHash: string, nextHash: string, now: number): Promise<boolean>;
  revokeSession(id: string): Promise<void>;
}

// Only for local demonstrations and tests; never a staging/production database.
export class MemoryAuthStore implements AuthStore {
  private users = new Map<string, User>();
  private sessions = new Map<string, Session>();
  async createUser(user: User) {
    if ([...this.users.values()].some(u => u.email === user.email)) return undefined;
    this.users.set(user.id, { ...user });
    return { ...user };
  }
  async findUserByEmail(email: string) {
    const user = [...this.users.values()].find(u => u.email === email);
    return user && { ...user };
  }
  async findUserById(id: string) {
    const user = this.users.get(id);
    return user && { ...user };
  }
  async createSession(session: Session) { this.sessions.set(session.id, { ...session }); return { ...session }; }
  async findSession(id: string) {
    const session = this.sessions.get(id);
    return session && { ...session };
  }
  async findSessionByRefresh(hash: string) {
    const session = [...this.sessions.values()].find(s => s.refreshHash === hash);
    return session && { ...session };
  }
  async rotateSession(id: string, previousHash: string, nextHash: string, now: number) {
    const session = this.sessions.get(id);
    if (!session || session.revoked || session.expiresAt <= now || session.refreshHash !== previousHash) return false;
    session.refreshHash = nextHash;
    return true;
  }
  async revokeSession(id: string) {
    const session = this.sessions.get(id);
    if (session) session.revoked = true;
  }
}
