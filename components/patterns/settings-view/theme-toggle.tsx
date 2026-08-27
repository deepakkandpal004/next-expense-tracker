"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { useTheme } from "@/contexts/ThemeContext";

type Preference = "dark" | "light" | "system";

const OPTIONS: { value: Preference; label: string; icon: typeof Sun }[] = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
];

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const { setTheme } = useTheme();
  const [preference, setPreference] = useState<Preference>("system");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (preference === "system") {
        setTheme(getSystemTheme());
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preference, setTheme]);

  const select = (value: Preference) => {
    setPreference(value);
    setTheme(value === "system" ? getSystemTheme() : value);
  };

  return (
    <div className="rounded-xl border border-border/50 bg-surface p-4">
      <p className="text-xs text-muted-foreground">Appearance</p>
      <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-bg-surface-2 p-1">
        {OPTIONS.map(({ value, label, icon: Icon }) => {
          const active = preference === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => select(value)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all duration-200",
                active
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon size={14} strokeWidth={2} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
