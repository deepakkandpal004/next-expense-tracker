import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis?: Redis };

function unavailableClient(): Redis {
  console.warn("[Redis] REDIS_URL is not set; caching and rate limiting are disabled.");
  return new Proxy({} as Redis, {
    get() {
      return async () => undefined;
    },
  });
}

function createRedisClient(): Redis {
  const url = process.env.REDIS_URL;
  if (!url) return unavailableClient();

  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableOfflineQueue: true,
  });
  client.on("ready", () => {
    console.log(`[Redis] connected to ${client.options.host}:${client.options.port}`);
  });
  client.on("error", (err) => {
    console.error("[Redis] connection error", err.message);
  });
  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();
globalForRedis.redis = redis;

export interface RedisHealth {
  configured: boolean;
  connected: boolean;
  latencyMs?: number;
  error?: string;
  host?: string;
  port?: number;
}

export async function checkRedisHealth(): Promise<RedisHealth> {
  if (!process.env.REDIS_URL) {
    return { configured: false, connected: false, error: "REDIS_URL not set" };
  }
  const start = Date.now();
  try {
    const pong = await redis.ping();
    const latencyMs = Date.now() - start;
    const opts = (redis as unknown as { options?: { host?: string; port?: number } }).options;
    if (pong !== "PONG") {
      return { configured: true, connected: false, latencyMs, error: `Unexpected PING response: ${pong}`, host: opts?.host, port: opts?.port };
    }
    return { configured: true, connected: true, latencyMs, host: opts?.host, port: opts?.port };
  } catch (e) {
    const latencyMs = Date.now() - start;
    return { configured: true, connected: false, latencyMs, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function isRedisConnected(): Promise<boolean> {
  const h = await checkRedisHealth();
  return h.connected;
}
