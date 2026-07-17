"use client";

import { useState, useRef, useEffect, type ReactElement } from "react";
import { enforceSentenceCase } from "@/lib/ui/primitive-registry";

export interface TooltipProps {
  content: string;
  children: ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  delayDuration?: number;
}

const sideStyles: Record<string, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
};

const arrowStyles: Record<string, string> = {
  top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-foreground",
  right: "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-foreground",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-foreground",
  left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-foreground",
};

export function Tooltip({ content, children, side = "top", delayDuration = 300 }: TooltipProps) {
  enforceSentenceCase(content, "Tooltip content");
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(true), delayDuration);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const triggerWithHandlers = (
    <span
      onBlur={hide}
      onFocus={show}
      onMouseEnter={show}
      onMouseLeave={hide}
      title={content}
    >
      {children}
    </span>
  );

  return (
    <span className="relative inline-flex">
      {triggerWithHandlers}
      {visible ? (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute z-50 ${sideStyles[side]}`}
          role="tooltip"
        >
          <span className="block max-w-xs rounded-control bg-foreground px-3 py-2 text-interface-xs text-canvas shadow-overlay">
            {content}
          </span>
          <span className={`absolute h-0 w-0 border-4 ${arrowStyles[side]}`} />
        </span>
      ) : null}
    </span>
  );
}
