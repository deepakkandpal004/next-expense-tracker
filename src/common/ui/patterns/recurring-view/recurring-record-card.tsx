import { Calendar, Clock, Pause, Play, Repeat, Tag, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/src/common/ui";
import { CATEGORY_DEFINITIONS } from "@/src/common/domain/categories";
import { formatCurrency } from "@/src/common/formatters/locale";
import type { RecurringRecordDTO } from "@/app/actions/getRecurringRecords";
import { FREQUENCY_LABELS } from "./constants";

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
  const nextDue = record.nextDue
    ? new Date(record.nextDue).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Ended";
  const getCategoryLabel = (id: string) => {
    const def = CATEGORY_DEFINITIONS.find(d => d.id === id);
    return def?.label || id;
  };
  const amountColor = record.type === "income" ? "text-success" : "text-danger";

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${record.active ? "bg-primary/10" : "bg-muted"}`}>
            <Repeat className={`size-4 ${record.active ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">{record.text}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${record.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {record.active ? "Active" : "Paused"}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="size-3" /> Every {record.interval} {FREQUENCY_LABELS[record.frequency]?.toLowerCase() || record.frequency}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" /> Next: {nextDue}
              </span>
              <span className="flex items-center gap-1">
                <Tag className="size-3" /> {getCategoryLabel(record.category)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-sm font-semibold ${amountColor}`}>
            {formatCurrency({ minorValue: Math.round(Number(record.amount) * 100), currency })}
          </span>
          <button
            type="button"
            onClick={() => onToggle(record.id, !record.active)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={record.active ? "Pause" : "Activate"}
          >
            {record.active ? <Pause className="size-4" /> : <Play className="size-4" />}
          </button>
          <button
            type="button"
            onClick={() => onDelete(record.id)}
            className="text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Delete"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
