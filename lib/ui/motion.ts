import type { Transition, Variants } from "motion/react";

/**
 * Motion design tokens for the app. Values are kept in sync with the CSS
 * motion tokens defined in globals.css so shell CSS and JS-driven motion
 * feel like a single coordinated system.
 */
export const MOTION_DURATION = {
  instant: 0.08,
  fast: 0.15,
  standard: 0.22,
  slow: 0.32,
  emphasized: 0.5,
} as const;

export const MOTION_EASE = {
  standard: [0.2, 0, 0, 1] as const,
  emphasized: [0.16, 1, 0.3, 1] as const,
  decelerate: [0, 0, 0, 1] as const,
} as const;

export const MOTION_SPRING = {
  soft: { type: "spring", stiffness: 260, damping: 28, mass: 0.9 } satisfies Transition,
  snappy: { type: "spring", stiffness: 380, damping: 32, mass: 0.85 } satisfies Transition,
  gentle: { type: "spring", stiffness: 180, damping: 24, mass: 1 } satisfies Transition,
} as const;

export const overlayBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: MOTION_DURATION.fast, ease: MOTION_EASE.standard } },
  exit: { opacity: 0, transition: { duration: MOTION_DURATION.fast, ease: MOTION_EASE.standard } },
};

export const dialogSurfaceVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: MOTION_SPRING.snappy },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.98,
    transition: { duration: MOTION_DURATION.fast, ease: MOTION_EASE.standard },
  },
};

export const sheetRightVariants: Variants = {
  hidden: { opacity: 0, x: "8%" },
  visible: { opacity: 1, x: 0, transition: MOTION_SPRING.snappy },
  exit: {
    opacity: 0,
    x: "8%",
    transition: { duration: MOTION_DURATION.fast, ease: MOTION_EASE.standard },
  },
};

export const sheetLeftVariants: Variants = {
  hidden: { opacity: 0, x: "-8%" },
  visible: { opacity: 1, x: 0, transition: MOTION_SPRING.snappy },
  exit: {
    opacity: 0,
    x: "-8%",
    transition: { duration: MOTION_DURATION.fast, ease: MOTION_EASE.standard },
  },
};

export const menuSurfaceVariants: Variants = {
  hidden: { opacity: 0, y: -4, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: MOTION_DURATION.fast, ease: MOTION_EASE.emphasized },
  },
  exit: {
    opacity: 0,
    y: -2,
    scale: 0.98,
    transition: { duration: MOTION_DURATION.instant, ease: MOTION_EASE.standard },
  },
};

/**
 * Stagger container for lists (records, KPI cards). Children opt in via
 * listItemVariants and inherit the delay chain from the parent.
 */
export const listContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.02 } },
};

export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: MOTION_SPRING.snappy },
};

/** Predefined button-press micro-interaction. */
export const pressVariants = {
  whileTap: { scale: 0.97 },
  transition: { duration: MOTION_DURATION.instant, ease: MOTION_EASE.standard },
} as const;
