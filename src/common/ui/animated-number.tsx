"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export interface AnimatedNumberProps {
  /** Final displayed value. */
  value: number;
  /** How to render the number (currency, integer, percentage). */
  format: (value: number) => ReactNode;
  /** Animation duration in seconds. Uses standard motion token by default. */
  duration?: number;
  /** Content rendered when the value should not animate (server, reduced motion). */
  fallback?: ReactNode;
  className?: string;
}

/**
 * Smoothly counts up (or down) to `value`. Renders `fallback` on the server and
 * for users with `prefers-reduced-motion` so no animation runs. The formatter
 * decides currency/locale display; this primitive only owns the tween.
 */
export function AnimatedNumber({
  value,
  format,
  duration = 0.9,
  fallback,
  className,
}: AnimatedNumberProps) {
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState<number | null>(null);
  const [displayText, setDisplayText] = useState<string | null>(null);
  const previous = useRef<number>(value);
  const formatRef = useRef(format);
  formatRef.current = format;

  useEffect(() => {
    const render = (latest: number) => {
      const formatted = formatRef.current(latest);
      if (typeof formatted === "string") {
        setDisplayText(formatted);
      } else {
        setDisplay(latest);
      }
    };

    if (reducedMotion) {
      render(value);
      previous.current = value;
      return;
    }

    const from = previous.current;
    const controls = animate(from, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: render,
      onComplete: () => {
        previous.current = value;
      },
    });

    return () => controls.stop();
  }, [duration, reducedMotion, value]);

  if (display !== null) {
    return <span className={className}>{format(display)}</span>;
  }

  if (displayText !== null) {
    return <span className={className}>{displayText}</span>;
  }

  return <span className={className}>{fallback ?? format(value)}</span>;
}
