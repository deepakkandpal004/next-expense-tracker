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
