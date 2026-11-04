import { createApp, localFrontendOrigins } from './app.js';
import { AuthService } from './auth.js';
import { MemoryAuthStore } from './store.js';
import { PostgresAuthStore } from './postgres-store.js';
import { invalidDnsServers, parseDnsServers } from './provider-dns.js';
import { ProviderService } from './provider-service.js';
import { AdminReviewService } from './admin-review-service.js';
import { AuditService } from './audit-service.js';
import { MarketplaceService } from './marketplace-service.js';
import { GatewayService } from './gateway-service.js';
import { ReportService } from './report-service.js';
import {createClient} from 'redis';
import {sandboxSecret as resolveSandboxSecret} from './sandbox-config.js';
import {BillingService} from './billing-service.js';
import {UsageService} from './usage-service.js';
import {UsageAnalytics} from './usage-analytics.js';
import {RedisMeter} from './redis-meter.js';
import {GatewayEntitlement} from './gateway-entitlement.js';

const mode = process.env.AUTH_STORE ?? 'postgres';
if (!['postgres', 'memory'].includes(mode)) throw new Error('AUTH_STORE must be postgres or memory');
if (mode === 'memory' && process.env.NODE_ENV === 'production') throw new Error('Memory storage cannot run in production');
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.startsWith('replace-')) throw new Error('A random JWT_SECRET is required. Run npm run setup for local development.');
const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
const dnsServers = parseDnsServers(process.env.DNS_SERVERS);
const badDnsServers = invalidDnsServers(dnsServers);
if (badDnsServers.length) throw new Error(`DNS_SERVERS must be a comma-separated list of IP or IP:port values: ${badDnsServers.join(', ')}`);
const secret = process.env.JWT_SECRET;
const store = mode === 'postgres' ? new PostgresAuthStore(process.env.DATABASE_URL ?? '') : new MemoryAuthStore();
if (store instanceof PostgresAuthStore) await store.ready();
const allowedOrigins = process.env.CORS_ORIGINS !== undefined
  ? process.env.CORS_ORIGINS.split(',').map(value => value.trim()).filter(Boolean)
  : process.env.NODE_ENV === 'production' ? [] : localFrontendOrigins;
const provider = store instanceof PostgresAuthStore ? new ProviderService(store.pool) : undefined;
if (provider) await provider.ready();
const audit = store instanceof PostgresAuthStore ? new AuditService(store.pool) : undefined;
if (audit) await audit.ready();
const review = store instanceof PostgresAuthStore && audit ? new AdminReviewService(store.pool, audit) : undefined;
if (review) await review.ready();
const marketplace = store instanceof PostgresAuthStore ? new MarketplaceService(store.pool) : undefined;
const redis=store instanceof PostgresAuthStore?createClient({url:process.env.REDIS_URL??'redis://127.0.0.1:6379',socket:{connectTimeout:1000,reconnectStrategy:attempt=>Math.min(2000,100*(attempt+1))},disableOfflineQueue:true}):undefined;
redis?.on('error',()=>{});
void redis?.connect().catch(()=>console.error('Redis metering unavailable; Gateway fails closed'));
const usage=store instanceof PostgresAuthStore?new UsageService(store.pool):undefined;
if(store instanceof PostgresAuthStore)await store.pool.query('SELECT s.quota_limit,o.request_id FROM subscriptions s LEFT JOIN usage_outbox o ON false LIMIT 0');
usage?.start();
const sandboxSecret=resolveSandboxSecret(secret,process.env.SANDBOX_WEBHOOK_SECRET,process.env.NODE_ENV==='production');
const billing=store instanceof PostgresAuthStore?new BillingService(store.pool,sandboxSecret):undefined;
const analytics=store instanceof PostgresAuthStore?new UsageAnalytics(store.pool):undefined;
const gateway = store instanceof PostgresAuthStore&&redis&&usage ? new GatewayService(store.pool,undefined,undefined,new GatewayEntitlement(store.pool,new RedisMeter(redis),usage)) : undefined;
const reports = store instanceof PostgresAuthStore ? new ReportService(store.pool) : undefined;
if (reports) await reports.ready();
const app = createApp(new AuthService(store, secret), event => console.log(JSON.stringify(event)), { allowedOrigins, provider, review, audit, marketplace, gateway, reports,billing,usage:analytics });
const server = app.listen(port, process.env.HOST ?? '127.0.0.1', () => {
  console.log(`Backend listening on port ${port}; storage: ${mode}; Swagger: /docs.`);
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => { server.close(async () => { try{await usage?.close();}catch{console.error('Usage outbox retained for retry');}if(redis?.isOpen)redis.destroy();if (store instanceof PostgresAuthStore) await store.close(); process.exit(0); }); });
}
