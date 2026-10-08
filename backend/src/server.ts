import { createApp } from './app.js';
import { AuthService } from './auth.js';
import { MemoryAuthStore } from './store.js';
import { SqliteAuthStore } from './sqlite-store.js';

const mode = process.env.AUTH_STORE ?? 'sqlite';
if (!['sqlite', 'memory'].includes(mode)) throw new Error('AUTH_STORE must be sqlite or memory');
if (mode === 'memory' && process.env.NODE_ENV === 'production') throw new Error('Memory storage cannot run in production');
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.startsWith('replace-')) throw new Error('A random JWT_SECRET is required. Run npm run setup for local development.');
const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
const secret = process.env.JWT_SECRET;
const store = mode === 'sqlite' ? new SqliteAuthStore(process.env.DATABASE_PATH ?? 'data/api-market.sqlite') : new MemoryAuthStore();
if (store instanceof SqliteAuthStore) store.migrate();
const app = createApp(new AuthService(store, secret), event => console.log(JSON.stringify(event)));
const server = app.listen(port, process.env.HOST ?? '127.0.0.1', () => {
  console.log(`Backend listening on port ${port}; storage: ${mode}; Swagger: /docs.`);
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => { server.close(() => { if (store instanceof SqliteAuthStore) store.close(); process.exit(0); }); });
}
