import { PrismaClient } from "@prisma/client";

/**
 * Database client — single pooled Prisma instance.
 * Was lib/db.ts:5 bare PrismaClient; now centralized with pooling params
 * and observability hooks for production.
 *
 * Part of modular monolith: `src/database` owns client, migrations, seed.
 * Modules import via `@/src/database/client` (or `@/lib/db` re-export for compat).
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  const needsPoolingParams = url && !url.includes("connection_limit=");
  const datasourceUrl = needsPoolingParams
    ? `${url}${url.includes("?") ? "&" : "?"}connection_limit=5&pool_timeout=5&connect_timeout=10`
    : undefined;

  return new PrismaClient({
    ...(datasourceUrl ? { datasourceUrl } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Re-export Prisma types for modules
export type { PrismaClient };
export { Prisma } from "@prisma/client";
