/**
 * Common cache — re-exports lib/cache for modular imports.
 * New modules import from `@/src/common/cache`.
 */
export { getCache, setCache, deleteCache, deleteCacheByPattern, CacheKey } from "@/lib/cache";
