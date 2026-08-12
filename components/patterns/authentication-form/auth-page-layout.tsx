import type { ReactNode } from 'react';

export function AuthPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-12">
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="rounded-3xl border border-white/[0.07] bg-[#0B0D10]/90 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.65),_inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-2xl sm:p-10">
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          {children}
        </div>
      </div>
    </div>
  );
}
