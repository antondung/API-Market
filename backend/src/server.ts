import { createApp, localFrontendOrigins } from './app.js';
import { AuthService } from './auth.js';
import { MemoryAuthStore } from './store.js';
import { PostgresAuthStore } from './postgres-store.js';

const mode = process.env.AUTH_STORE ?? 'postgres';
if (!['postgres', 'memory'].includes(mode)) throw new Error('AUTH_STORE must be postgres or memory');
if (mode === 'memory' && process.env.NODE_ENV === 'production') throw new Error('Memory storage cannot run in production');
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.startsWith('replace-')) throw new Error('A random JWT_SECRET is required. Run npm run setup for local development.');
const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
const secret = process.env.JWT_SECRET;
const store = mode === 'postgres' ? new PostgresAuthStore(process.env.DATABASE_URL ?? '') : new MemoryAuthStore();
if (store instanceof PostgresAuthStore) await store.ready();
const allowedOrigins = process.env.CORS_ORIGINS !== undefined
  ? process.env.CORS_ORIGINS.split(',').map(value => value.trim()).filter(Boolean)
  : process.env.NODE_ENV === 'production' ? [] : localFrontendOrigins;
const app = createApp(new AuthService(store, secret), event => console.log(JSON.stringify(event)), { allowedOrigins });
const server = app.listen(port, process.env.HOST ?? '127.0.0.1', () => {
  console.log(`Backend listening on port ${port}; storage: ${mode}; Swagger: /docs.`);
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => { server.close(async () => { if (store instanceof PostgresAuthStore) await store.close(); process.exit(0); }); });
}
