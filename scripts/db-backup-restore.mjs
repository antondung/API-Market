// Sprint 5 / EN-13: Backup, Restore & Rollback verification harness.
// Usage:
//   node scripts/db-backup-restore.mjs --verify-disposable
//   node scripts/db-backup-restore.mjs --backup <output.dump> --url <DATABASE_URL>
//   node scripts/db-backup-restore.mjs --restore <input.dump> --url <DATABASE_URL>
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";
import { Pool } from "pg";
import { PostgresAuthStore } from "../dist/src/postgres-store.js";

const run = (file, args, options = {}) =>
  execFileSync(file, args, { windowsHide: true, stdio: "pipe", ...options });

function resolvePgBin() {
  try {
    return run("pg_config", ["--bindir"], { encoding: "utf8" }).trim();
  } catch {
    throw Error(
      "pg_config not found on PATH. Add PostgreSQL bin directory to PATH.",
    );
  }
}

export function pgDump(bin, connectionUrl, outputPath) {
  run(join(bin, "pg_dump"), [
    "--dbname",
    connectionUrl,
    "--format=custom",
    "--no-owner",
    "--no-privileges",
    "--file",
    outputPath,
  ]);
  const stat = statSync(outputPath);
  if (stat.size < 64) throw Error("pg_dump produced an unexpectedly small file");
  return stat.size;
}

export function pgRestore(bin, connectionUrl, inputPath) {
  run(join(bin, "pg_restore"), [
    "--dbname",
    connectionUrl,
    "--clean",
    "--if-exists",
    "--no-owner",
    "--no-privileges",
    inputPath,
  ]);
}

async function tableCounts(url) {
  const pool = new Pool({ connectionString: url });
  try {
    const tables = [
      "roles",
      "users",
      "api_providers",
      "apis",
      "api_versions",
      "api_endpoints",
      "api_plans",
      "backend_schema_migrations",
    ];
    const counts = {};
    for (const table of tables) {
      const res = await pool.query(`SELECT COUNT(*)::int AS n FROM ${table}`);
      counts[table] = res.rows[0].n;
    }
    return counts;
  } finally {
    await pool.end();
  }
}

async function verifyDisposable() {
  const bin = resolvePgBin();
  const dir = mkdtempSync(join(tmpdir(), "api-market-backup-verify-"));
  let started = false;
  try {
    const server = createServer();
    await new Promise((res, rej) => {
      server.once("error", rej);
      server.listen(0, "127.0.0.1", res);
    });
    const port = server.address().port;
    await new Promise((res) => server.close(res));

    const dataDir = join(dir, "pgdata");
    const dumpFile = join(dir, "backup.dump");
    run(join(bin, "initdb"), [
      "-D",
      dataDir,
      "-U",
      "postgres",
      "--auth=trust",
      "--encoding=UTF8",
      "--no-locale",
    ]);
    run(
      join(bin, "pg_ctl"),
      [
        "-D",
        dataDir,
        "-l",
        join(dir, "server.log"),
        "-o",
        `-h 127.0.0.1 -p ${port} -c unix_socket_directories=`,
        "-w",
        "start",
      ],
      { stdio: "ignore" },
    );
    started = true;

    const adminUrl = `postgresql://postgres@127.0.0.1:${port}/postgres`;
    const sourceUrl = `postgresql://postgres@127.0.0.1:${port}/api_market_src`;
    const targetUrl = `postgresql://postgres@127.0.0.1:${port}/api_market_restored`;

    const adminPool = new Pool({ connectionString: adminUrl });
    try {
      await adminPool.query("CREATE DATABASE api_market_src");
      await adminPool.query("CREATE DATABASE api_market_restored");
    } finally {
      await adminPool.end();
    }

    for (const url of [sourceUrl, targetUrl]) {
      const p = new Pool({ connectionString: url });
      try {
        await p.query(
          "CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public",
        );
      } finally {
        await p.end();
      }
    }

    const store = new PostgresAuthStore(sourceUrl, "public");
    try {
      await store.migrate(true, true);
    } finally {
      await store.close();
    }

    const before = await tableCounts(sourceUrl);
    const bytes = pgDump(bin, sourceUrl, dumpFile);
    pgRestore(bin, targetUrl, dumpFile);
    const after = await tableCounts(targetUrl);

    for (const [k, v] of Object.entries(before)) {
      if (after[k] !== v) {
        throw Error(`Restore mismatch on ${k}: expected ${v}, got ${after[k]}`);
      }
    }

    console.log(
      JSON.stringify({
        verified: true,
        dumpBytes: bytes,
        tablesVerified: before,
      }),
    );
  } finally {
    if (started) {
      run(
        join(bin, "pg_ctl"),
        ["-D", join(dir, "pgdata"), "-m", "fast", "-w", "stop"],
        { stdio: "ignore" },
      );
    }
    if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  }
}

const args = process.argv.slice(2);
if (args.includes("--verify-disposable")) {
  await verifyDisposable();
} else if (args.includes("--backup")) {
  const out = args[args.indexOf("--backup") + 1];
  const url =
    args[args.indexOf("--url") + 1] ?? process.env.DATABASE_URL ?? "";
  if (!out || !url) throw Error("Usage: --backup <file.dump> --url <DB_URL>");
  const size = pgDump(resolvePgBin(), url, out);
  console.log(JSON.stringify({ backupFile: out, bytes: size }));
} else if (args.includes("--restore")) {
  const input = args[args.indexOf("--restore") + 1];
  const url =
    args[args.indexOf("--url") + 1] ?? process.env.DATABASE_URL ?? "";
  if (!input || !url)
    throw Error("Usage: --restore <file.dump> --url <DB_URL>");
  pgRestore(resolvePgBin(), url, input);
  console.log(JSON.stringify({ restoredFrom: input }));
} else {
  throw Error(
    "Specify --verify-disposable, --backup <file> --url <db>, or --restore <file> --url <db>",
  );
}
