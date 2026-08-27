"use client";

import { useEffect, useState, useCallback } from "react";
import { Database, WifiOff, RefreshCw } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

type Health = {
  redis: { configured: boolean; connected: boolean; latencyMs?: number; error?: string; host?: string };
  cache: { ok: boolean; latencyMs?: number; error?: string };
};

export function RedisHealthBadge() {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health/redis", { cache: "no-store" });
      const json = (await res.json()) as Health;
      setHealth(json);
    } catch {
      setHealth({ redis: { configured: false, connected: false, error: "fetch failed" }, cache: { ok: false, error: "fetch failed" } });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const id = setInterval(fetchHealth, 30_000);
    return () => clearInterval(id);
  }, [fetchHealth]);

  if (loading && !health) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/50">
        <RefreshCw className="size-3 animate-spin" /> Cache…
      </span>
    );
  }

  const connected = health?.redis.connected && health?.cache.ok;
  const configured = health?.redis.configured;

  if (!configured) {
    return (
      <Tooltip>
        <TooltipTrigger
          onClick={fetchHealth}
          className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-[11px] font-semibold text-warning transition hover:bg-warning/15"
        >
          <WifiOff className="size-3" /> Cache off
        </TooltipTrigger>
        <TooltipContent>REDIS_URL not set — caching disabled. Set in .env.local</TooltipContent>
      </Tooltip>
    );
  }

  if (!connected) {
    return (
      <Tooltip>
        <TooltipTrigger
          onClick={fetchHealth}
          className="inline-flex items-center gap-1.5 rounded-full border border-danger/30 bg-danger/10 px-2.5 py-1 text-[11px] font-semibold text-danger transition hover:bg-danger/15"
        >
          <span className="size-2 rounded-full bg-danger shadow-[0_0_6px_var(--danger)]" />
          Redis error
        </TooltipTrigger>
        <TooltipContent>{health?.redis.error || health?.cache.error || "Redis not reachable"}</TooltipContent>
      </Tooltip>
    );
  }

  const latency = health?.cache.latencyMs ?? health?.redis.latencyMs;
  return (
    <Tooltip>
      <TooltipTrigger
        onClick={fetchHealth}
        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 transition hover:bg-emerald-500/15"
        aria-label={`Redis connected, cache probe ${latency}ms, host ${health?.redis.host}`}
      >
        <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
        <Database className="size-3 opacity-70" />
        {latency ? `${latency}ms` : "Cache on"}
      </TooltipTrigger>
      <TooltipContent>
        Redis {health?.redis.host} · PING {health?.redis.latencyMs}ms · Cache {health?.cache.latencyMs}ms · click to recheck
      </TooltipContent>
    </Tooltip>
  );
}
