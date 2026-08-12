import { cn } from "@/lib/ui/cn";

export function Row({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "negative" | "positive";
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-foreground-secondary">{label}</span>
      <span
        className={cn(
          "font-medium tabular-nums",
          tone === "negative" && "text-[#F04438]",
          tone === "positive" && "text-[#22C55E]",
          tone === "default" && "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}
