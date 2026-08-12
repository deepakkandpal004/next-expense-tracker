import { motion } from "motion/react";
import { Edit3, Layers, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatters/locale";
import { Button } from "@/components/ui";
import { listItemVariants } from "@/lib/ui/motion";
import type { CategoryWithSpending } from "./types";

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
  return (
    <motion.div variants={listItemVariants} className="rounded-xl border border-border/50 bg-surface p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Layers size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{category.label}</h3>
            <p className="text-xs text-muted-foreground">{category.categoryId}{category.isCustom ? " (custom)" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button icon={<Edit3 size={14} />} intent="ghost" label="Edit" onClick={() => onEdit(category)} />
          {category.isCustom && (
            <Button icon={<Trash2 size={14} />} intent="ghost" label="Delete" onClick={() => onDelete(category)} />
          )}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-muted-foreground">Spent</p>
          <p className="mt-0.5 font-semibold text-foreground">
            {formatCurrency({ minorValue: category.spendingMinor, currency })}
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-muted-foreground">Transactions</p>
          <p className="mt-0.5 font-semibold text-foreground">{category.transactionCount}</p>
        </div>
      </div>
    </motion.div>
  );
}
