import { PostgresAuthStore } from './postgres-store.js';
if (process.argv.includes('--seed') && process.env.NODE_ENV === 'production') throw new Error('Development account seed is disabled in production');
const store = new PostgresAuthStore(process.env.DATABASE_URL ?? '');
try {
  await store.migrate();
  if (process.argv.includes('--seed')) {
    if (process.env.NODE_ENV === 'production') throw new Error('Development account seed is disabled in production');
    await store.migrate(true);
    console.log('Development demo seed from PR #32 applied. Do not use demo accounts in production.');
  }
  console.log('Database migrations up to date.');
} finally { await store.close(); }
