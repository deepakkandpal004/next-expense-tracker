"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/src/common/ui/cn";
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
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-muted text-primary">
          <Sun size={18} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
          <p className="text-xs text-muted-foreground">Light, dark, or system</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-surface-subtle p-1">
        {OPTIONS.map(({ value, label, icon: Icon }) => {
          const active = preference === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => select(value)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                active
                  ? "bg-surface text-foreground shadow-flat"
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
