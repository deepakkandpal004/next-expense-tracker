import { Loader2, HelpCircle } from "lucide-react";

export function ExplainSection({
  showExplanation,
  isExplaining,
  explanation,
  explanationUnavailable,
  onExplain,
}: {
  showExplanation: boolean;
  isExplaining: boolean;
  explanation: string | null | undefined;
  explanationUnavailable: boolean;
  onExplain: () => void;
}) {
  return (
    <div className="mt-4 border-t border-white/[0.06] pt-4">
      {!showExplanation ? (
        <button
          type="button"
          onClick={onExplain}
          disabled={isExplaining}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
        >
          {isExplaining ? (
            <Loader2 size={13} strokeWidth={2} className="animate-spin" />
          ) : (
            <HelpCircle size={13} strokeWidth={2} />
          )}
          How is this calculated?
        </button>
      ) : (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
          {isExplaining ? (
            <p className="flex items-center gap-2 text-xs text-text-secondary">
              <Loader2 size={13} strokeWidth={2} className="animate-spin" />
              Analyzing reserved commitments and cash runway…
            </p>
          ) : explanation ? (
            <>
              <p className="text-xs leading-relaxed text-text-primary">{explanation}</p>
              <p className="mt-2 text-[11px] text-text-tertiary">
                Automated analysis derived directly from current period balances and scheduled obligations.
              </p>
            </>
          ) : (
            <p className="text-xs leading-relaxed text-text-secondary">
              {explanationUnavailable
                ? "Detailed explanation is temporarily unavailable."
                : "Safe to spend calculated directly from your ledger entries."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
