import { NextResponse } from "next/server";
import { checkRedisHealth } from "@/lib/redis";
import { getCache, setCache } from "@/lib/cache";
import { withApiLogging } from "@/src/common/server/logger";

export const dynamic = "force-dynamic";

export const GET = withApiLogging(async () => {
  const health = await checkRedisHealth();

  let cacheProbe: { ok: boolean; latencyMs?: number; error?: string } | undefined;
  if (health.connected) {
    const probeKey = `app:health:probe:${Date.now()}`;
    const start = Date.now();
    try {
      await setCache(probeKey, { ok: 1 }, 10);
      const got = await getCache<{ ok: number }>(probeKey);
      cacheProbe = { ok: got?.ok === 1, latencyMs: Date.now() - start };
      if (!cacheProbe.ok) cacheProbe.error = "Write succeeded but read mismatch";
    } catch (e) {
      cacheProbe = { ok: false, latencyMs: Date.now() - start, error: e instanceof Error ? e.message : String(e) };
    }
  }

  const status = health.connected && (cacheProbe?.ok ?? true) ? 200 : 503;
  return NextResponse.json(
    {
      redis: health,
      cache: cacheProbe ?? { ok: false, error: health.error ?? "not connected" },
      hint: !health.configured
        ? "Set REDIS_URL in .env.local (local) or Vercel → Settings → Environment Variables (prod). Use Upstash ioredis URL rediss://..."
        : undefined,
    },
    { status },
  );
});
