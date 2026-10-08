import { hashPassword } from './auth.js';
import { randomUUID } from 'node:crypto';
import { SqliteAuthStore } from './sqlite-store.js';
const store = new SqliteAuthStore(process.env.DATABASE_PATH ?? 'data/api-market.sqlite');
try {
  store.migrate();
  if (process.argv.includes('--seed')) {
    if (process.env.NODE_ENV === 'production') throw new Error('Development account seed is disabled in production');
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET required');
    const accounts = [
      { role: 'Consumer', email: 'consumer@example.test', env: 'SEED_CONSUMER_PASSWORD' },
      { role: 'Provider', email: 'provider@example.test', env: 'SEED_PROVIDER_PASSWORD' },
      { role: 'Admin', email: 'admin@example.test', env: 'SEED_ADMIN_PASSWORD' },
    ] as const;
    for (const account of accounts) {
      const password = process.env[account.env];
      if (!password || password.length < 12 || password.startsWith('replace-')) throw new Error(`${account.env} requires a random password (12+ characters)`);
    }
    for (const account of accounts) {
      if (await store.findUserByEmail(account.email)) continue;
      await store.createUser({
        id: randomUUID(), email: account.email, name: `Demo ${account.role}`,
        passwordHash: await hashPassword(process.env[account.env]!), role: account.role, active: true,
      });
    }
    console.log('Local sample accounts ready. Passwords are read from the ignored .env file.');
  }
  console.log('Database migrations up to date.');
} finally { store.close(); }
