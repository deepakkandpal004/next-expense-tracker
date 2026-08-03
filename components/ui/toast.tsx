"use client";

import { AnimatePresence, motion } from "motion/react";
import { AlertOctagon, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/ui/cn";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/ui/motion";

export type ToastTone = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  description: string;
  title?: string;
  tone?: ToastTone;
  duration?: number;
}

interface ToastItem extends Required<Pick<ToastOptions, "description" | "tone">> {
  id: number;
  title?: string;
  duration: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

const DEFAULT_DURATION: Record<ToastTone, number> = {
  success: 4000,
  info: 4000,
  warning: 5000,
  error: 6000,
};

const TONE_ICON: Record<ToastTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
  warning: AlertOctagon,
};

const TONE_ICON_CLASS: Record<ToastTone, string> = {
  success: "text-success",
  error: "text-danger",
  info: "text-info-foreground",
  warning: "text-warning-foreground",
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const tone = options.tone ?? "info";
      const id = ++nextId.current;
      const item: ToastItem = {
        id,
        description: options.description,
        title: options.title,
        tone,
        duration: options.duration ?? DEFAULT_DURATION[tone],
      };
      setToasts((current) => [...current, item]);

      const timer = setTimeout(() => dismiss(id), item.duration);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2"
      >
        <AnimatePresence>
          {toasts.map((item) => {
            const Icon = TONE_ICON[item.tone];
            return (
              <motion.div
                key={item.id}
                data-toast="true"
                initial={{ opacity: 0, x: 24, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.97 }}
                transition={{ duration: MOTION_DURATION.standard, ease: MOTION_EASE.emphasized }}
                className={cn(
                  "pointer-events-auto flex items-start gap-3 rounded-xl border border-border/60 bg-surface p-3.5 shadow-lg shadow-black/20",
                  item.tone === "error" && "border-danger-border/60",
                )}
                role={item.tone === "error" ? "alert" : "status"}
              >
                <span aria-hidden="true" className={cn("mt-0.5 shrink-0", TONE_ICON_CLASS[item.tone])}>
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  {item.title ? (
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  ) : null}
                  <p className={cn("text-sm text-foreground-secondary", item.title && "mt-0.5")}>
                    {item.description}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={() => dismiss(item.id)}
                  className="shrink-0 rounded-md p-1 text-foreground-secondary/60 transition-colors hover:bg-surface-subtle hover:text-foreground"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
