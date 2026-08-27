'use client';

import { ShieldIcon } from './shared';

export function AiTransparencyPageContent() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-kpi-savings/[0.04] blur-[120px]" />
        </div>
        <div className="content-frame relative py-16 sm:py-24 lg:py-32">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-kpi-savings/20 bg-kpi-savings/[0.08] px-3 py-1 font-medium text-[11px] tracking-wider text-kpi-savings uppercase">
              AI Transparency
            </span>
            <h1 className="mt-6 text-[clamp(2.5rem,6vw,4rem)] font-semibold text-white tracking-tight leading-[1.1]">
              How AI uses your data.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
              AI features are optional. When enabled, we send only aggregated totals — never raw descriptions or IDs.
            </p>
          </div>
        </div>
      </section>

      {/* Key points */}
      <section className="content-frame py-16 sm:py-20">
        <div className="max-w-2xl mx-auto space-y-10">
          <AiItem
            icon={<BrainIcon />}
            title="What AI does"
            description="Generates category suggestions and spending interpretations for the reporting period you select."
          />
          <AiItem
            icon={<FilterIcon />}
            title="What we send"
            description="Period dates, currency, transaction count, income, spending, balance, and category totals."
          />
          <AiItem
            icon={<ShieldIcon />}
            title="What we never send"
            description="Raw transaction descriptions, account IDs, timestamps, or any personally identifiable information."
          />
        </div>
      </section>

      {/* Disclosure table */}
      <section className="content-frame border-t border-white/5 py-16 sm:py-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-white mb-8 text-center">Data disclosure</h2>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="grid grid-cols-2 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="px-5 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Field</div>
              <div className="px-5 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</div>
            </div>
            <DisclosureRow field="Period dates" included />
            <DisclosureRow field="Currency" included />
            <DisclosureRow field="Transaction count" included />
            <DisclosureRow field="Income & spending totals" included />
            <DisclosureRow field="Category breakdown" included />
            <DisclosureRow field="Transaction descriptions" included={false} />
            <DisclosureRow field="Account IDs" included={false} />
            <DisclosureRow field="Timestamps" included={false} />
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="content-frame border-t border-white/5 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            AI-generated insights are informational only and are not professional financial advice. Provider retention behavior has not been verified.
          </p>
        </div>
      </section>
    </main>
  );
}

function AiItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-kpi-savings border border-white/[0.06]">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function DisclosureRow({ field, included }: { field: string; included: boolean }) {
  return (
    <div className="grid grid-cols-2 border-b border-white/[0.06] last:border-b-0">
      <div className="px-5 py-3.5 text-sm text-white">{field}</div>
      <div className="px-5 py-3.5">
        {included ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Included
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2.5 py-1 text-[11px] font-medium text-danger">
            <span className="h-1.5 w-1.5 rounded-full bg-danger" />
            Excluded
          </span>
        )}
      </div>
    </div>
  );
}

function BrainIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A5.5 5.5 0 004 7.5c0 1.58.67 3 1.74 4.01L4 14l3-1c.78.82 1.87 1.34 3.07 1.37A5.5 5.5 0 0018 9.5 5.5 5.5 0 0012.5 4c-.52 0-1.02.08-1.5.23" />
      <path d="M12 2v20" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}
