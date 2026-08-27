/**
 * Health module — liveness + dependency checks.
 * Previously app/api/health/redis/route.ts ad-hoc.
 */
export { checkRedisHealth, isRedisConnected } from "@/lib/redis";
export { getCache, setCache } from "@/src/common/cache";
