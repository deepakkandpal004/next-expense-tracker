import { z } from "zod";

/**
 * Centralized env validation — fail-fast at boot, not at runtime.
 * Previously env was read ad-hoc in lib/redis.ts, lib/ai.ts, app/api/cron etc.
 * This module is the single source of truth for required secrets.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL (Neon/Supabase)"),
  DIRECT_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  CRON_SECRET: z.string().min(16, "CRON_SECRET must be >=16 chars, generate with: openssl rand -hex 32"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // In production fail fast; in dev warn and return partial
    console.error("[config] Invalid environment:", parsed.error.flatten().fieldErrors);
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment variables");
    }
    // Return best-effort in dev
    cachedEnv = parsed.data as unknown as Env;
    return cachedEnv;
  }
  cachedEnv = parsed.data;
  return cachedEnv;
}

export function requireEnv<K extends keyof Env>(key: K): NonNullable<Env[K]> {
  const env = getEnv();
  const val = env[key];
  if (!val) throw new Error(`Missing required env: ${String(key)}`);
  return val as NonNullable<Env[K]>;
}
