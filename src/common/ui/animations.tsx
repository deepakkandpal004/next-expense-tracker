"use client";

import { motion, useInView, type Variants } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/* ────────────────────────────────────────────────────────────
   ANIMATION TOKENS
   ──────────────────────────────────────────────────────────── */

export const ANIM = {
  duration: {
    instant: 0.08,
    fast: 0.15,
    standard: 0.22,
    slow: 0.32,
    emphasized: 0.5,
    drawn: 0.8,
  },
  ease: {
    standard: [0.2, 0, 0, 1] as const,
    emphasized: [0.16, 1, 0.3, 1] as const,
    decelerate: [0, 0, 0, 1] as const,
  },
  spring: {
    default: { type: "spring" as const, stiffness: 300, damping: 30 },
    soft: { type: "spring" as const, stiffness: 200, damping: 20 },
  },
} as const;

/* ────────────────────────────────────────────────────────────
   FADE ANIMATION
   ──────────────────────────────────────────────────────────── */

export interface FadeProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  className?: string;
}

export function Fade({
  children,
  delay = 0,
  duration = ANIM.duration.slow,
  direction = "up",
  distance = 12,
  className,
}: FadeProps) {
  const offsets = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...offsets[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: ANIM.ease.emphasized }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   SLIDE ANIMATION
   ──────────────────────────────────────────────────────────── */

export interface SlideProps {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}

export function Slide({
  children,
  direction = "left",
  delay = 0,
  duration = ANIM.duration.slow,
  distance = 20,
  className,
}: SlideProps) {
  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: direction === "left" ? -distance : direction === "right" ? distance : 0,
      y: direction === "up" ? distance : direction === "down" ? -distance : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration, delay, ease: ANIM.ease.emphasized }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   SCALE ANIMATION
   ──────────────────────────────────────────────────────────── */

export interface ScaleProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  from?: number;
  className?: string;
}

export function Scale({
  children,
  delay = 0,
  duration = ANIM.duration.standard,
  from = 0.95,
  className,
}: ScaleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: from }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay, ease: ANIM.ease.emphasized }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   COUNT UP ANIMATION
   ──────────────────────────────────────────────────────────── */

export interface CountUpProps {
  value: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function CountUp({
  value,
  duration = 1.5,
  delay = 0.3,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const start = 0;
    const end = value;
    const startTime = Date.now();
    const durationMs = duration * 1000;

    const timer = setTimeout(() => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / durationMs, 1);

        const eased = 1 - Math.pow(1 - progress, 3);
        const current = start + (end - start) * eased;

        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [value, duration, delay, isInView]);

  const formatted = displayValue.toFixed(decimals);
  const parts = formatted.split(".");
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const decPart = parts[1] ? `.${parts[1]}` : "";

  return (
    <span ref={ref} className={className}>
      {prefix}{intPart}{decPart}{suffix}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
   CARD HOVER WRAPPER
   ──────────────────────────────────────────────────────────── */

export interface CardHoverProps {
  children: ReactNode;
  className?: string;
  lift?: boolean;
  glow?: boolean;
  scale?: boolean;
}

export function CardHover({
  children,
  className,
  lift = true,
  glow = false,
  scale = true,
}: CardHoverProps) {
  return (
    <motion.div
      whileHover={{
        y: lift ? -4 : 0,
        scale: scale ? 1.01 : 1,
        transition: { duration: 0.2, ease: ANIM.ease.standard },
      }}
      whileTap={{ scale: 0.99 }}
      className={className}
      style={glow ? { boxShadow: "0 0 0 0 transparent" } : undefined}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   CHART DRAW ANIMATION
   ──────────────────────────────────────────────────────────── */

export interface ChartDrawProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function ChartDraw({
  children,
  delay = 0.2,
  duration = ANIM.duration.drawn,
  className,
}: ChartDrawProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
      animate={isInView ? { opacity: 1, clipPath: "inset(0 0% 0 0)" } : {}}
      transition={{ duration, delay, ease: ANIM.ease.emphasized }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   STAGGER CONTAINER
   ──────────────────────────────────────────────────────────── */

export interface StaggerProps {
  children: ReactNode;
  delay?: number;
  stagger?: number;
  className?: string;
}

export function Stagger({
  children,
  delay = 0,
  stagger = 0.05,
  className,
}: StaggerProps) {
  const variants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   STAGGER ITEM
   ──────────────────────────────────────────────────────────── */

export interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const variants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: ANIM.duration.standard, ease: ANIM.ease.emphasized },
    },
  };

  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   SKELETON LOADING
   ──────────────────────────────────────────────────────────── */

export interface SkeletonLoaderProps {
  className?: string;
  count?: number;
}

export function SkeletonLoader({ className = "", count = 1 }: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-shimmer rounded-lg bg-surface-subtle ${className}`}
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   LOADING SPINNER
   ──────────────────────────────────────────────────────────── */

export interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export function LoadingSpinner({ size = 24, className = "" }: LoadingSpinnerProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={className}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="opacity-20"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   PULSE GLOW
   ──────────────────────────────────────────────────────────── */

export interface PulseGlowProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

export function PulseGlow({
  children,
  color = "var(--color-accent)",
  className,
}: PulseGlowProps) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 0 0 ${color}00`,
          `0 0 20px 4px ${color}30`,
          `0 0 0 0 ${color}00`,
        ],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   PAGE TRANSITION WRAPPER
   ──────────────────────────────────────────────────────────── */

export interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: ANIM.duration.slow, ease: ANIM.ease.emphasized }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   THEME TRANSITION
   ──────────────────────────────────────────────────────────── */

export interface ThemeTransitionProps {
  children: ReactNode;
  className?: string;
}

export function ThemeTransition({ children, className }: ThemeTransitionProps) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   INVIEW WRAPPER
   ──────────────────────────────────────────────────────────── */

export interface InViewProps {
  children: ReactNode;
  delay?: number;
  once?: boolean;
  className?: string;
}

export function InView({
  children,
  delay = 0,
  once = true,
  className,
}: InViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: ANIM.duration.slow, delay, ease: ANIM.ease.emphasized }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   MOTION BUTTON
   ──────────────────────────────────────────────────────────── */

export interface MotionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function MotionButton({
  children,
  onClick,
  className,
  disabled,
}: MotionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}
