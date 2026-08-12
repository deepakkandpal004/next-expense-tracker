"use client";
import { motion } from "motion/react";

export function AnimateInView({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rainbow relative isolate inline-flex overflow-hidden rounded-full p-px shadow-[0_0_24px_rgba(34,211,238,0.18)]">
      <span className="relative z-10 inline-flex items-center gap-3 rounded-full bg-black/70 px-5 py-2 font-semibold text-sm tracking-wider backdrop-blur-md">
        <span className="text-white">{children}</span>
      </span>
    </span>
  );
}

export function FloatingShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Simple solid base wash */}
      <div className="absolute inset-0 bg-black" />
    </div>
  );
}
