"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ReactElement } from "react";
import { enforceSentenceCase } from "@/lib/ui/primitive-registry";

export interface TooltipProps {
  content: string;
  children: ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  delayDuration?: number;
}

export function Tooltip({ content, children, side = "top", delayDuration = 300 }: TooltipProps) {
  enforceSentenceCase(content, "Tooltip content");
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className="z-50 max-w-xs rounded-control bg-foreground px-3 py-2 text-interface-xs text-canvas shadow-overlay data-[state=delayed-open]:animate-fade-in"
            side={side}
            sideOffset={6}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-foreground" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
