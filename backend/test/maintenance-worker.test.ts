import test from 'node:test';
import assert from 'node:assert/strict';
import { MaintenanceWorker, maintenanceIntervalMs, type MaintenanceClient } from '../src/maintenance-worker.js';

test('maintenance interval defaults to five minutes and rejects unsafe values', () => {
  assert.equal(maintenanceIntervalMs(undefined), 300_000);
  assert.equal(maintenanceIntervalMs('   '), 300_000);
  assert.equal(maintenanceIntervalMs('5000'), 5000);
  assert.throws(() => maintenanceIntervalMs('0'));
  assert.throws(() => maintenanceIntervalMs('999'));
  assert.throws(() => maintenanceIntervalMs('30s'));
});

test('stop finishes the current tick and does not run again', async () => {
  let calls = 0;
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => { release = resolve; });
  let started: () => void = () => {};
  const ready = new Promise<void>((resolve) => { started = resolve; });
  const client: MaintenanceClient = {
    async query(sql: string) {
      if (sql.includes('pg_try_advisory_lock')) return { rows: [{ ok: true }] };
      if (sql.includes('pg_advisory_unlock')) return { rows: [{ ok: true }] };
      started();
      await gate;
      calls += 1;
      return { rows: [{ expired_count: 0, reset_count: 0 }] };
    },
    release() {},
  };
  const worker = new MaintenanceWorker({ connect: async () => client }, 1000);
  const running = worker.runOnce();
  await ready;
  const stopping = worker.stop();
  release();
  await stopping;
  await running;
  assert.equal(calls, 1);
  assert.deepEqual(await worker.runOnce(), { expired: 0, reset: 0, skipped: true });
  assert.equal(calls, 1);
});
