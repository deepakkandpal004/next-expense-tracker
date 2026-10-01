import {
  Car,
  CircleDollarSign,
  Film,
  HeartPulse,
  Pause,
  Play,
  Receipt,
  Shapes,
  ShoppingBag,
  Trash2,
  Utensils,
} from "lucide-react";
import { getCategoryDefinition } from "@/src/common/domain/categories";
import { CurrencyText, DateText } from "@/src/common/ui";
import type { RecurringRecordDTO } from "@/app/actions/getRecurringRecords";
import { FREQUENCY_LABELS } from "./constants";

const ICONS = {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Receipt,
  HeartPulse,
  CircleDollarSign,
  Shapes,
} as const;

const FREQUENCY_NOUNS: Record<string, string> = {
  daily: "day",
  weekly: "week",
  monthly: "month",
  yearly: "year",
};

function formatFrequency(interval: number, frequency: string): string {
  if (interval <= 1) return FREQUENCY_LABELS[frequency] ?? frequency;
  const noun = FREQUENCY_NOUNS[frequency];
  return noun ? `Every ${interval} ${noun}s` : `Every ${interval} ${frequency}`;
}

export function RecurringRecordCard({
  record,
  currency,
  onToggle,
  onDelete,
}: {
  record: RecurringRecordDTO;
  currency: string;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const definition = getCategoryDefinition(record.category);
  const Icon = ICONS[definition.lucideIcon as keyof typeof ICONS] ?? Shapes;
  const color = `var(--color-${definition.semanticToken})`;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
              color,
            }}
          >
            <Icon size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[15px] font-semibold text-foreground">{record.text}</h3>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  record.active ? "bg-primary-muted text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {record.active ? "Active" : "Paused"}
              </span>
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {formatFrequency(record.interval, record.frequency)}
              <span aria-hidden="true" className="mx-1.5">·</span>
              {record.nextDue ? (
                <>
                  Next <DateText value={record.nextDue} />
                </>
              ) : (
                "Ended"
              )}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className={`mr-1 text-[15px] font-semibold ${record.type === "income" ? "text-success" : "text-danger"}`}>
            <CurrencyText currency={currency} minorValue={Math.round(Number(record.amount) * 100)} />
          </span>
          <button
            type="button"
            onClick={() => onToggle(record.id, !record.active)}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-subtle hover:text-foreground"
            title={record.active ? "Pause" : "Resume"}
            aria-label={record.active ? "Pause recurring transaction" : "Resume recurring transaction"}
          >
            {record.active ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            type="button"
            onClick={() => onDelete(record.id)}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-subtle hover:text-danger"
            title="Delete"
            aria-label="Delete recurring transaction"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
