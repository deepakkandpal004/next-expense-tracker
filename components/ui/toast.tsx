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

const TONE_SURFACE_CLASS: Record<ToastTone, string> = {
  success: "border-success-border/80 bg-gradient-to-br from-success-surface via-surface to-surface shadow-[0_20px_45px_-28px_rgba(34,197,94,0.85)]",
  error: "border-danger-border/80 bg-gradient-to-br from-danger-surface via-surface to-surface shadow-[0_20px_45px_-28px_rgba(240,68,56,0.85)]",
  info: "border-info-border/80 bg-gradient-to-br from-info-surface via-surface to-surface shadow-[0_20px_45px_-28px_rgba(0,220,229,0.85)]",
  warning: "border-warning-border/80 bg-gradient-to-br from-warning-surface via-surface to-surface shadow-[0_20px_45px_-28px_rgba(245,166,35,0.85)]",
};

const TONE_BADGE_CLASS: Record<ToastTone, string> = {
  success: "bg-success-surface text-success",
  error: "bg-danger-surface text-danger",
  info: "bg-info-surface text-info-foreground",
  warning: "bg-warning-surface text-warning-foreground",
};

const TONE_PROGRESS_CLASS: Record<ToastTone, string> = {
  success: "bg-success",
  error: "bg-danger",
  info: "bg-info",
  warning: "bg-warning",
};

const TONE_TITLE: Record<ToastTone, string> = {
  success: "Success",
  error: "Something went wrong",
  info: "Heads up",
  warning: "Attention needed",
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
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(400px,calc(100vw-2rem))] flex-col gap-3 sm:right-5 sm:top-5"
      >
        <AnimatePresence>
          {toasts.map((item) => {
            const Icon = TONE_ICON[item.tone];
            return (
              <motion.div
                key={item.id}
                data-toast="true"
                initial={{ opacity: 0, x: 28, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 28, scale: 0.96 }}
                transition={{ duration: MOTION_DURATION.standard, ease: MOTION_EASE.emphasized }}
                className={cn(
                  "pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-2xl border p-4 pr-3 backdrop-blur-xl",
                  TONE_SURFACE_CLASS[item.tone],
                )}
                role={item.tone === "error" ? "alert" : "status"}
              >
                <span
                  aria-hidden="true"
                  className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", TONE_BADGE_CLASS[item.tone])}
                >
                  <Icon size={19} strokeWidth={2.25} />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm font-semibold leading-5 text-foreground">
                    {item.title ?? TONE_TITLE[item.tone]}
                  </p>
                  <p className="mt-0.5 text-sm leading-5 text-foreground-secondary">
                    {item.description}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={() => dismiss(item.id)}
                  className="-mr-1 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-foreground-secondary/70 transition-colors hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info focus-visible:ring-offset-2 focus-visible:ring-offset-surface dark:hover:bg-white/10"
                >
                  <X size={16} />
                </button>
                <motion.span
                  aria-hidden="true"
                  className={cn("absolute inset-x-0 bottom-0 h-0.5 origin-left", TONE_PROGRESS_CLASS[item.tone])}
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: item.duration / 1000, ease: "linear" }}
                />
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
