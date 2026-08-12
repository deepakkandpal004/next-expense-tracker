export function EmptyState() {
  return (
    <div className="px-5 pb-5">
      <div className="flex h-48 flex-col items-center justify-center text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-on-surface-variant/40">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path d="M9 12a3 3 0 106 0 3 3 0 00-6 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-on-surface">No expense data yet</p>
        <p className="mt-1 text-xs text-on-surface-variant/50 max-w-[200px]">
          Add expenses to see your spending breakdown by category
        </p>
      </div>
    </div>
  );
}
