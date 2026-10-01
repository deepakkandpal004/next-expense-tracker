import { motion } from "motion/react";
import {
  Car,
  CircleDollarSign,
  Edit3,
  Film,
  HeartPulse,
  Receipt,
  Shapes,
  ShoppingBag,
  Trash2,
  Utensils,
} from "lucide-react";
import { getCategoryDefinition } from "@/src/common/domain/categories";
import { Button, CurrencyText } from "@/src/common/ui";
import { listItemVariants } from "@/src/common/ui/motion";
import type { CategoryWithSpending } from "./types";

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

export function CategoryCard({
  category,
  currency,
  onEdit,
  onDelete,
}: {
  category: CategoryWithSpending;
  currency: string;
  onEdit: (cat: CategoryWithSpending) => void;
  onDelete: (cat: CategoryWithSpending) => void;
}) {
  const definition = getCategoryDefinition(category.categoryId);
  const Icon =
    ICONS[category.iconName as keyof typeof ICONS] ??
    ICONS[definition.lucideIcon as keyof typeof ICONS] ??
    Shapes;
  const color = category.color || `var(--color-${definition.semanticToken})`;

  return (
    <motion.div variants={listItemVariants} className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
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
            <h3 className="truncate text-[15px] font-semibold text-foreground">{category.label}</h3>
            {category.isCustom ? (
              <p className="mt-0.5 text-xs text-muted-foreground">Custom</p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button icon={<Edit3 size={14} />} intent="ghost" label="Edit" onClick={() => onEdit(category)} />
          {category.isCustom && (
            <Button icon={<Trash2 size={14} />} intent="ghost" label="Delete" onClick={() => onDelete(category)} />
          )}
        </div>
      </div>
      <div className="mt-5">
        <p className="text-xs text-muted-foreground">Total spent</p>
        <p className="mt-1 text-xl font-semibold text-foreground">
          <CurrencyText currency={currency} minorValue={category.spendingMinor} />
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {category.transactionCount} transaction{category.transactionCount === 1 ? "" : "s"}
        </p>
      </div>
    </motion.div>
  );
}
