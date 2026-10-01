'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';

export function AuthPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg-base px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px]"
      >
        <div className="rounded-2xl border border-white/[0.14] bg-black/40 p-8 sm:p-10">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
