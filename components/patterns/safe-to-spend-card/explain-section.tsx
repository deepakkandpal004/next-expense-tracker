import { Loader2, Sparkles } from "lucide-react";

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
    <div className="mt-5">
      {!showExplanation ? (
        <button
          type="button"
          onClick={onExplain}
          disabled={isExplaining}
          className="inline-flex items-center gap-2 rounded-xl bg-[#A855F7]/15 px-4 py-2 text-xs font-semibold text-[#A855F7] transition-colors hover:bg-[#A855F7]/25 disabled:opacity-50"
        >
          {isExplaining ? (
            <Loader2 size={14} strokeWidth={2.5} className="animate-spin" />
          ) : (
            <Sparkles size={14} strokeWidth={2.5} />
          )}
          Explain with AI
        </button>
      ) : (
        <div className="rounded-xl bg-white/5 px-4 py-3">
          {isExplaining ? (
            <p className="flex items-center gap-2 text-xs text-on-surface-variant/70">
              <Loader2 size={13} strokeWidth={2.5} className="animate-spin" />
              Explaining the safe-to-spend calculation…
            </p>
          ) : explanation ? (
            <>
              <p className="text-xs leading-relaxed text-on-surface/90">{explanation}</p>
              <p className="mt-2 text-[10px] text-on-surface-variant/50">
                AI-narrated explanation of the calculated figure. It never changes the number.
              </p>
            </>
          ) : (
            <p className="text-xs leading-relaxed text-on-surface-variant/70">
              {explanationUnavailable
                ? "AI narration is unavailable right now."
                : "Safe to spend was calculated from your records; no narration is available."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
