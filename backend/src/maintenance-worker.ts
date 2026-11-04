const LOCK_ID = 913005;

export interface MaintenanceClient {
  query(sql: string, params?: unknown[]): Promise<{ rows: Array<Record<string, unknown>> }>;
  release(): void;
}

export interface MaintenanceDb {
  connect(): Promise<MaintenanceClient>;
}

export interface MaintenanceResult {
  expired: number;
  reset: number;
  skipped: boolean;
}

export function maintenanceIntervalMs(raw = process.env.MAINTENANCE_INTERVAL_MS) {
  if (raw === undefined || raw.trim() === '') return 300_000;
  if (!/^\d+$/.test(raw.trim())) throw new Error('MAINTENANCE_INTERVAL_MS must be a positive integer');
  const value = Number(raw.trim());
  if (!Number.isSafeInteger(value) || value < 1000 || value > 86_400_000) {
    throw new Error('MAINTENANCE_INTERVAL_MS must be between 1000 and 86400000');
  }
  return value;
}

/**
 * Calls run_subscription_maintenance on a fixed interval.
 * A session advisory lock lets several processes run the worker; the others skip the tick.
 * Paid subscriptions past expires_at become Expired and are not renewed.
 * Free subscriptions roll quota forward by 30 days from the existing anchor.
 */
export class MaintenanceWorker {
  private timer: NodeJS.Timeout | undefined;
  private inflight: Promise<unknown> | undefined;
  private stopped = false;

  constructor(
    private readonly db: MaintenanceDb,
    private readonly intervalMs = 300_000,
    private readonly batchSize = 500,
  ) {
    if (!Number.isInteger(this.intervalMs) || this.intervalMs < 1) throw new Error('Invalid maintenance interval');
    if (!Number.isInteger(this.batchSize) || this.batchSize < 1 || this.batchSize > 10_000) throw new Error('Invalid maintenance batch size');
  }

  start() {
    if (this.timer || this.inflight || this.stopped) return;
    const tick = () => {
      if (this.stopped) return;
      this.inflight = this.execute()
        .catch((error: unknown) => {
          const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: unknown }).code ?? '') : '';
          console.error(`Subscription maintenance failed${code ? ` (${code})` : ''}`);
        })
        .finally(() => {
          this.inflight = undefined;
          if (this.stopped) return;
          this.timer = setTimeout(tick, this.intervalMs);
          this.timer.unref?.();
        });
    };
    tick();
  }

  async stop() {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
    await this.inflight;
  }

  runOnce() {
    if (this.stopped) return Promise.resolve<MaintenanceResult>({ expired: 0, reset: 0, skipped: true });
    const job = this.execute();
    this.inflight = job;
    return job.finally(() => {
      if (this.inflight === job) this.inflight = undefined;
    });
  }

  private async execute(): Promise<MaintenanceResult> {
    if (this.stopped) return { expired: 0, reset: 0, skipped: true };
    const client = await this.db.connect();
    let locked = false;
    try {
      const lock = await client.query('SELECT pg_try_advisory_lock($1) AS ok', [LOCK_ID]);
      locked = lock.rows[0]?.ok === true;
      if (!locked) return { expired: 0, reset: 0, skipped: true };
      let expired = 0;
      let reset = 0;
      for (let attempt = 0; attempt < 1000; attempt += 1) {
        if (this.stopped) break;
        const row = (await client.query(
          'SELECT expired_count, reset_count FROM run_subscription_maintenance(now(), $1)',
          [this.batchSize],
        )).rows[0];
        const expiredCount = Number(row?.expired_count ?? 0);
        const resetCount = Number(row?.reset_count ?? 0);
        expired += expiredCount;
        reset += resetCount;
        if (expiredCount === 0 && resetCount === 0) break;
        if (attempt === 999) throw new Error('Subscription maintenance did not converge');
      }
      return { expired, reset, skipped: false };
    } finally {
      if (locked) await client.query('SELECT pg_advisory_unlock($1)', [LOCK_ID]).catch(() => undefined);
      client.release();
    }
  }
}
