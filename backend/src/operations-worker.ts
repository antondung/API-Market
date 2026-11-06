import type { Pool } from "pg";
export class OperationsWorker {
  private timer?: NodeJS.Timeout;
  private running?: Promise<unknown>;
  constructor(
    readonly pool: Pool,
    readonly intervalMs = 60000,
  ) {}
  async runOnce(now = new Date()): Promise<{
    skipped?: boolean;
    expired_count: number;
    reset_count: number;
  }> {
    const c = await this.pool.connect();
    try {
      await c.query("BEGIN");
      if (
        !(await c.query("SELECT pg_try_advisory_xact_lock(913005) AS acquired"))
          .rows[0].acquired
      ) {
        await c.query("ROLLBACK");
        return { skipped: true, expired_count: 0, reset_count: 0 };
      }
      const result = { expired_count: 0, reset_count: 0 };
      for (let batch = 0; batch < 20; batch++) {
        const current = (
          await c.query("SELECT * FROM run_subscription_maintenance($1,500)", [
            now,
          ])
        ).rows[0];
        result.expired_count += current.expired_count;
        result.reset_count += current.reset_count;
        if (current.expired_count + current.reset_count === 0) break;
      }
      await c.query(
        "SELECT ensure_usage_log_partition((date_trunc('month',$1::timestamptz)+INTERVAL '2 months')::date)",
        [now],
      );
      await c.query("SELECT refresh_usage_aggregates($1::date-1,$1::date)", [
        now,
      ]);
      await c.query(
        "INSERT INTO backend_job_runs(name,last_started_at,last_succeeded_at,last_result) VALUES('subscription-maintenance',$1,NOW(),$2) ON CONFLICT(name) DO UPDATE SET last_started_at=$1,last_succeeded_at=NOW(),last_error_at=NULL,last_result=$2",
        [now, JSON.stringify(result)],
      );
      await c.query("COMMIT");
      return result;
    } catch (e) {
      await c.query("ROLLBACK");
      await c
        .query(
          "INSERT INTO backend_job_runs(name,last_started_at,last_error_at) VALUES('subscription-maintenance',$1,NOW()) ON CONFLICT(name) DO UPDATE SET last_started_at=$1,last_error_at=NOW()",
          [now],
        )
        .catch(() => {});
      throw e;
    } finally {
      c.release();
    }
  }
  start() {
    if (this.timer) return;
    const tick = () => {
      if (this.running) return;
      this.running = this.runOnce()
        .catch(() => console.error("Operations worker failed; retry scheduled"))
        .finally(() => {
          this.running = undefined;
        });
    };
    tick();
    this.timer = setInterval(tick, this.intervalMs);
    this.timer.unref();
  }
  async close() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    await this.running;
  }
}
