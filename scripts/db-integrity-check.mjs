import { Pool } from "pg";

const url = process.env.DATABASE_URL ?? process.env.PG_TEST_URL;
if (!url) throw new Error("DATABASE_URL is required");

const pool = new Pool({ connectionString: url });
try {
  const result = await pool.query(
    "SELECT check_name, violation_count::int FROM validate_sprint5_integrity() ORDER BY check_name",
  );
  const failed = result.rows.filter((row) => row.violation_count !== 0);
  console.log(JSON.stringify({ ok: failed.length === 0, checks: result.rows }, null, 2));
  if (failed.length) process.exitCode = 1;
} finally {
  await pool.end();
}
