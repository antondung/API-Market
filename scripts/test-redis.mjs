import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, realpathSync } from "node:fs";
import { tmpdir, homedir } from "node:os";
import { join, dirname } from "node:path";
import { createServer } from "node:net";
import { createClient } from "redis";
export async function testRedis() {
  if (process.env.REDIS_TEST_URL)
    return { url: process.env.REDIS_TEST_URL, close: async () => {} };
  const listener = createServer();
  await new Promise((r) => listener.listen(0, "127.0.0.1", r));
  const port = listener.address().port;
  await new Promise((r) => listener.close(r));
  const directory = mkdtempSync(join(tmpdir(), "api-market-redis-test-"));
  const binary =
    process.env.REDIS_SERVER_BIN ??
    (process.platform === "win32"
      ? join(
          homedir(),
          ".cache/api-market-test/redis-5.0.14.1/redis-server.exe",
        )
      : "redis-server");
  const child = spawn(
    binary,
    [
      "--bind",
      "127.0.0.1",
      "--port",
      String(port),
      "--save",
      "",
      "--appendonly",
      "no",
      "--dir",
      directory,
    ],
    { windowsHide: true, stdio: "ignore" },
  );
  let failure;
  child.on("error", () => {
    failure = true;
  });
  const close = async () => {
    if (child.exitCode === null && !failure) {
      child.kill();
      await new Promise((r) => {
        child.once("exit", r);
        setTimeout(r, 2000).unref();
      });
    }
    const target = realpathSync(directory);
    if (
      dirname(target) !== realpathSync(tmpdir()) ||
      !target.includes("api-market-redis-test-")
    )
      throw Error("Unsafe Redis cleanup");
    rmSync(target, { recursive: true, force: true });
  };
  const url = `redis://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 40; attempt++) {
    const client = createClient({
      url,
      socket: { connectTimeout: 250, reconnectStrategy: false },
    });
    client.on("error", () => {});
    try {
      await client.connect();
      await client.ping();
      await client.quit();
      return { url, close };
    } catch {
      if (client.isOpen) client.destroy();
    }
    if (failure || child.exitCode !== null) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  await close();
  throw Error(
    "Install redis-server or set REDIS_SERVER_BIN/REDIS_TEST_URL for a disposable test instance",
  );
}
