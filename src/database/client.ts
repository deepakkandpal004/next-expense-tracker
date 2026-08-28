import { PrismaClient } from "@prisma/client";

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

export type { PrismaClient };
export { Prisma } from "@prisma/client";
