import { randomBytes } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
if (process.env.NODE_ENV === 'production') throw new Error('Local setup is disabled in production');
if (!existsSync('.env')) {
  const secret = () => randomBytes(32).toString('base64url');
  writeFileSync('.env', [
    'AUTH_STORE=sqlite', 'DATABASE_PATH=data/api-market.sqlite', 'PORT=3000', 'HOST=127.0.0.1',
    `JWT_SECRET=${secret()}`, `SEED_ADMIN_PASSWORD=${secret()}`,
    `SEED_CONSUMER_PASSWORD=${secret()}`, `SEED_PROVIDER_PASSWORD=${secret()}`, '',
  ].join('\n'), { flag: 'wx', mode: 0o600 });
  console.log('Created ignored .env with random local secrets.');
}
const child = spawnSync(process.execPath, ['--env-file=.env', '--import', 'tsx', 'backend/src/database-cli.ts', '--seed'], { stdio: 'inherit' });
process.exitCode = child.status ?? 1;
