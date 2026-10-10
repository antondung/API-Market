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

// Bản ghi người dùng dùng cho màn hình quản trị: không chứa passwordHash.
export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface ListUsersQuery {
  search?: string;
  role?: Role;
  active?: boolean;
  page: number;
  pageSize: number;
}

export interface ListUsersResult {
  items: AdminUserRecord[];
  total: number;
  page: number;
  pageSize: number;
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
  // Quản trị người dùng (US-04)
  listUsers(query: ListUsersQuery): Promise<ListUsersResult>;
  setUserActive(id: string, active: boolean): Promise<AdminUserRecord | undefined>;
  revokeAllSessions(userId: string): Promise<number>;
}

// Only for local demonstrations and tests; never a staging/production database.
export class MemoryAuthStore implements AuthStore {
  private users = new Map<string, User>();
  private sessions = new Map<string, Session>();
  private createdAt = new Map<string, string>();
  async createUser(user: User) {
    if ([...this.users.values()].some(u => u.email === user.email)) return undefined;
    this.users.set(user.id, { ...user });
    this.createdAt.set(user.id, new Date().toISOString());
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
  async listUsers(query: ListUsersQuery): Promise<ListUsersResult> {
    const needle = query.search?.trim().toLowerCase();
    const matched = [...this.users.values()]
      .filter(user => !query.role || user.role === query.role)
      .filter(user => query.active === undefined || user.active === query.active)
      .filter(user => !needle || user.email.toLowerCase().includes(needle) || (user.name ?? '').toLowerCase().includes(needle))
      .sort((a, b) => a.email.localeCompare(b.email));
    const start = (query.page - 1) * query.pageSize;
    return {
      items: matched.slice(start, start + query.pageSize).map(user => this.toRecord(user)),
      total: matched.length,
      page: query.page,
      pageSize: query.pageSize,
    };
  }
  async setUserActive(id: string, active: boolean) {
    const user = this.users.get(id);
    if (!user) return undefined;
    user.active = active;
    return this.toRecord(user);
  }
  async revokeAllSessions(userId: string) {
    let revoked = 0;
    for (const session of this.sessions.values()) {
      if (session.userId === userId && !session.revoked) { session.revoked = true; revoked += 1; }
    }
    return revoked;
  }
  private toRecord(user: User): AdminUserRecord {
    return {
      id: user.id, name: user.name ?? user.email.split('@')[0] ?? user.email,
      email: user.email, role: user.role, active: user.active,
      createdAt: this.createdAt.get(user.id) ?? new Date(0).toISOString(),
    };
  }
}
