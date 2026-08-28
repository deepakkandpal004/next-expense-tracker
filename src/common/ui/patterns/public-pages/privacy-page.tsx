'use client';

import { ShieldIcon } from './shared';

export function PrivacyPageContent() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/[0.04] blur-[120px]" />
        </div>
        <div className="content-frame relative py-16 sm:py-24 lg:py-32">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.08] px-3 py-1 font-medium text-[11px] tracking-wider text-primary uppercase">
              Privacy
            </span>
            <h1 className="mt-6 text-[clamp(2.5rem,6vw,4rem)] font-semibold text-white tracking-tight leading-[1.1]">
              Your data stays yours.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
              We collect only what&apos;s needed to power your expense tracking. Nothing more.
            </p>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="content-frame py-16 sm:py-20">
        <div className="max-w-2xl mx-auto space-y-10">
          <PrivacyItem
            icon={<ShieldIcon />}
            title="Minimal collection"
            description="We store only your account credentials and transaction records required to run the app."
          />
          <PrivacyItem
            icon={<LockIcon />}
            title="Encrypted at rest"
            description="All data is encrypted in our database. Authentication is handled by a trusted third-party provider."
          />
          <PrivacyItem
            icon={<EyeOffIcon />}
            title="No third-party sharing"
            description="Your financial data is never shared, sold, or used for advertising."
          />
          <PrivacyItem
            icon={<TrashIcon />}
            title="Delete anytime"
            description="Remove your account and all data is permanently deleted. No hidden retention."
          />
        </div>
      </section>

      {/* What we store */}
      <section className="content-frame border-t border-white/5 py-16 sm:py-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-white mb-8 text-center">What we store</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <DataCard label="Account" items={["Email address", "Display name", "Password hash"]} />
            <DataCard label="Transactions" items={["Amount & currency", "Category & date", "Description"]} />
            <DataCard label="Preferences" items={["Theme setting", "Currency preference", "Budget limits"]} />
            <DataCard label="AI requests" items={["Aggregated totals only", "No raw descriptions", "Period-scoped"]} />
          </div>
        </div>
      </section>

      {/* Footer note */}
      <section className="content-frame border-t border-white/5 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Questions? Contact us at{' '}
            <span className="text-primary">privacy@expenseai.app</span>
          </p>
        </div>
      </section>
    </main>
  );
}

function PrivacyItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-primary border border-white/[0.06]">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function DataCard({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <p className="text-[11px] font-medium text-primary uppercase tracking-wider mb-3">{label}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
