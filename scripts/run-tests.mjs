import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createServer } from 'node:net';
import { Pool } from 'pg';
import { testRedis, redisBinaryIsUsable, REDIS_TEST_FILES } from './test-redis.mjs';

let directory, bin, started = false;
let redis;
const run = (file, args, options = {}) => execFileSync(file, args, { windowsHide: true, stdio: 'pipe', ...options });
try {
  let databaseUrl = process.env.PG_TEST_URL;
  if (!databaseUrl) {
    bin = run('pg_config', ['--bindir'], { encoding: 'utf8' }).trim();
    directory = mkdtempSync(join(tmpdir(), 'api-market-pg-test-'));
    const server = createServer();
    await new Promise((res, rej) => { server.once('error', rej); server.listen(0, '127.0.0.1', res); });
    const port = server.address().port;
    await new Promise(res => server.close(res));
    run(join(bin, 'initdb'), ['-D', directory, '-U', 'postgres', '--auth=trust', '--encoding=UTF8', '--no-locale']);
    run(join(bin, 'pg_ctl'), ['-D', directory, '-l', join(directory, 'server.log'), '-o', `-h 127.0.0.1 -p ${port} -c unix_socket_directories=`, '-w', 'start'], { stdio: 'ignore' });
    started = true;
    databaseUrl = `postgresql://postgres@127.0.0.1:${port}/postgres`;
  }
  // Prepare shared extension once before independent test files create schemas in parallel.
  const bootstrap = new Pool({ connectionString: databaseUrl });
  try { await bootstrap.query('CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public'); }
  finally { await bootstrap.end(); }
  const tests = ['test', 'integration'].flatMap(folder => readdirSync(`backend/${folder}`).filter(name => name.endsWith('.test.ts')).map(name => `dist/${folder}/${name.replace(/\.ts$/, '.js')}`));
  // A missing Redis must not hide the PostgreSQL suites: skip only the Redis-dependent files
    // and fail the run loudly so CI machines without Redis are fixed rather than silently green.
    let redisSkipped = false;
    if (process.env.REDIS_TEST_URL || redisBinaryIsUsable()) {
      try {
        redis = await testRedis();
      } catch {
        redisSkipped = true;
      }
    } else {
      redisSkipped = true;
    }
    const selected = process.env.TARGET_TEST ? tests.filter(name => new RegExp(process.env.TARGET_TEST).test(name)) : tests;
    const runnable = redisSkipped ? selected.filter(name => !REDIS_TEST_FILES.some(file => name.endsWith(file.replace(/\.ts$/, '.js')))) : selected;
    if (redisSkipped) {
      console.error(`\n[test] Redis unavailable: skipping ${selected.length - runnable.length} Redis-dependent file(s).`);
      console.error('[test] Set REDIS_TEST_URL or REDIS_SERVER_BIN, or install redis-server, to run them.\n');
    }
    const args = process.argv.includes('--benchmark')
      ? ['--import', 'tsx', 'backend/src/gateway-benchmark.ts']
      : process.argv.includes('--loadtest')
        ? ['--import', 'tsx', 'backend/src/gateway-loadtest.ts']
        : ['--test', '--test-concurrency=4', ...runnable];
    const result = spawnSync(process.execPath, args, { stdio: 'inherit', windowsHide: true, env: { ...process.env, PG_TEST_URL: databaseUrl, ...(redis ? { REDIS_TEST_URL: redis.url } : {}) } });
    // Skipping Redis tests is a partial run: never report success so CI cannot go green by omission.
    process.exitCode = redisSkipped ? 1 : (result.status ?? 1);
} catch (error) {
  // Avoid printing connection strings/passwords from child-process errors.
  console.error('PostgreSQL test setup failed. Install PostgreSQL CLI (pg_config/initdb/pg_ctl) or set PG_TEST_URL for a disposable test DB.');
  if (directory && existsSync(join(directory, 'server.log'))) console.error(readFileSync(join(directory, 'server.log'), 'utf8'));
  process.exitCode = 1;
} finally {
  if (redis) await redis.close();
  if (started) run(join(bin, 'pg_ctl'), ['-D', directory, '-m', 'fast', '-w', 'stop'], { stdio: 'ignore' });
  if (directory) {
    const target = realpathSync(directory);
    if (dirname(target) !== realpathSync(tmpdir()) || !target.startsWith(resolve(tmpdir(), 'api-market-pg-test-'))) throw new Error('Unsafe test cleanup path');
    rmSync(target, { recursive: true, force: true });
  }
}
