import { ApiError } from "./auth.js";
export interface MeterInput {
  apiKeyId: string;
  endpointId: string;
  subscriptionId: string;
  periodStart: string;
  expiresAt: number;
  rateLimit: number;
  quota: number;
  floor: number;
}
export interface RedisEval {
  eval(
    script: string,
    options: { keys: string[]; arguments: string[] },
  ): Promise<unknown>;
}
const script = `
local quota=tonumber(redis.call('GET',KEYS[2]) or '0')
local rate=tonumber(redis.call('GET',KEYS[1]) or '0')
if not quota or not rate then return -3 end
quota=math.max(quota,tonumber(ARGV[1]))
if rate>=tonumber(ARGV[2]) then return -1 end
if quota>=tonumber(ARGV[3]) then return -2 end
redis.call('INCR',KEYS[1]);redis.call('EXPIRE',KEYS[1],120)
redis.call('SET',KEYS[2],quota+1,'PX',ARGV[4])
return quota+1
`;
export class RedisMeter {
  constructor(
    readonly client: RedisEval,
    readonly prefix = "api-market",
    readonly timeoutMs = 1000,
  ) {}
  async consume(i: MeterInput) {
    if (
      !Number.isSafeInteger(i.quota) ||
      !Number.isSafeInteger(i.floor) ||
      i.floor < 0 ||
      i.quota < 1 ||
      !Number.isInteger(i.rateLimit) ||
      i.rateLimit < 1
    )
      throw new ApiError(
        503,
        "QUOTA_UNAVAILABLE",
        "Invalid metering configuration",
      );
    const minute = Math.floor(Date.now() / 60000),
      ttl = Math.max(
        1,
        Math.min(2147483647, i.expiresAt - Date.now() + 86400000),
      );
    let value: number;
    let timer: NodeJS.Timeout | undefined;
    try {
      value = Number(
        await Promise.race([
          this.client.eval(script, {
            keys: [
              `${this.prefix}:rl:${i.apiKeyId}:${i.endpointId}:${minute}`,
              `${this.prefix}:quota:${i.subscriptionId}:${i.periodStart}`,
            ],
            arguments: [
              String(i.floor),
              String(i.rateLimit),
              String(i.quota),
              String(ttl),
            ],
          }),
          new Promise<never>((_resolve, reject) => {
            timer = setTimeout(
              () => reject(new Error("Meter timeout")),
              this.timeoutMs,
            );
          }),
        ]),
      );
    } catch {
      throw new ApiError(
        503,
        "QUOTA_UNAVAILABLE",
        "Redis metering unavailable",
      );
    } finally {
      if (timer) clearTimeout(timer);
    }
    if (value === -1)
      throw new ApiError(429, "RATE_LIMITED", "Plan request rate exceeded");
    if (value === -2)
      throw new ApiError(
        403,
        "QUOTA_EXHAUSTED",
        "Subscription quota exhausted",
      );
    if (!Number.isSafeInteger(value) || value < 1)
      throw new ApiError(
        503,
        "QUOTA_UNAVAILABLE",
        "Redis metering unavailable",
      );
    return { used: value, remaining: Math.max(0, i.quota - value) };
  }
  quotaKey(subscriptionId: string, periodStart: string) {
    return `${this.prefix}:quota:${subscriptionId}:${periodStart}`;
  }
  rateKey(apiKeyId: string, endpointId: string, minute = Math.floor(Date.now() / 60000)) {
    return `${this.prefix}:rl:${apiKeyId}:${endpointId}:${minute}`;
  }
  /** Drop hot counters so a revoke or suspension is visible on the next Gateway call. */
  async invalidate(input: { apiKeyIds?: string[]; endpointIds?: string[]; subscriptionId?: string; periodStart?: string }) {
    const keys: string[] = [];
    if (input.subscriptionId && input.periodStart) keys.push(this.quotaKey(input.subscriptionId, input.periodStart));
    const minute = Math.floor(Date.now() / 60000);
    for (const apiKeyId of input.apiKeyIds ?? []) {
      for (const endpointId of input.endpointIds ?? []) {
        keys.push(this.rateKey(apiKeyId, endpointId, minute));
        keys.push(this.rateKey(apiKeyId, endpointId, minute - 1));
      }
    }
    if (!keys.length) return;
    const del = (this.client as RedisEval & { del?: (...args: string[]) => Promise<unknown> }).del;
    if (typeof del !== "function") return;
    await del.call(this.client, ...keys);
  }
}
