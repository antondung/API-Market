import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createServer } from 'node:net';

let directory, bin, started = false;
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
    run(join(bin, 'pg_ctl'), ['-D', directory, '-l', join(directory, 'server.log'), '-o', `-h 127.0.0.1 -p ${port}`, '-w', 'start'], { stdio: 'ignore' });
    started = true;
    databaseUrl = `postgresql://postgres@127.0.0.1:${port}/postgres`;
  }
  const tests = ['test', 'integration'].flatMap(folder => readdirSync(`backend/${folder}`).filter(name => name.endsWith('.test.ts')).map(name => `dist/${folder}/${name.replace(/\.ts$/, '.js')}`));
  const result = spawnSync(process.execPath, ['--test', ...tests], { stdio: 'inherit', windowsHide: true, env: { ...process.env, PG_TEST_URL: databaseUrl } });
  process.exitCode = result.status ?? 1;
} catch (error) {
  // Avoid printing connection strings/passwords from child-process errors.
  console.error('PostgreSQL test setup failed. Install PostgreSQL CLI (pg_config/initdb/pg_ctl) or set PG_TEST_URL for a disposable test DB.');
  if (directory && existsSync(join(directory, 'server.log'))) console.error(readFileSync(join(directory, 'server.log'), 'utf8'));
  process.exitCode = 1;
} finally {
  if (started) run(join(bin, 'pg_ctl'), ['-D', directory, '-m', 'fast', '-w', 'stop'], { stdio: 'ignore' });
  if (directory) {
    const target = realpathSync(directory);
    if (dirname(target) !== realpathSync(tmpdir()) || !target.startsWith(resolve(tmpdir(), 'api-market-pg-test-'))) throw new Error('Unsafe test cleanup path');
    rmSync(target, { recursive: true, force: true });
  }
}
