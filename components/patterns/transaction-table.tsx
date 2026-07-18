"use client";

import { motion } from "motion/react";
import {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Receipt,
  HeartPulse,
  CircleDollarSign,
  Shapes,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/ui/cn";
import { CurrencyText, DateText, Badge } from "@/components/ui";
import { CATEGORY_REGISTRY } from "@/lib/domain/categories";
import { listContainerVariants, listItemVariants } from "@/lib/ui/motion";
import type { CurrencyCode } from "@/lib/domain/types";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Receipt,
  HeartPulse,
  CircleDollarSign,
  Shapes,
};

function getCategoryIcon(categoryId: string) {
  const def = CATEGORY_REGISTRY[categoryId as keyof typeof CATEGORY_REGISTRY];
  if (!def) return Shapes;
  return ICON_MAP[def.lucideIcon] ?? Shapes;
}

function getCategoryColor(categoryId: string): string {
  const def = CATEGORY_REGISTRY[categoryId as keyof typeof CATEGORY_REGISTRY];
  if (!def) return "var(--color-category-other)";
  return `var(--color-${def.semanticToken})`;
}

function getMerchantInitials(description: string): string {
  const words = description.trim().split(/\s+/);
  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function getMerchantColor(description: string): string {
  let hash = 0;
  for (let i = 0; i < description.length; i++) {
    hash = description.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 65%, 50%)`;
}

export interface TransactionTableRow {
  id: string;
  description: string;
  amountMinor: number;
  currency: CurrencyCode;
  type: "income" | "expense";
  categoryId: string;
  occurredOn: string;
  createdAt: string;
}

export interface TransactionTableProps {
  rows: readonly TransactionTableRow[];
  onDelete?: (row: TransactionTableRow) => void;
  deletingId?: string | null;
}

export function TransactionTable({
  rows,
  onDelete,
  deletingId,
}: TransactionTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden glass-vessel">
      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-left text-interface-sm">
          <thead>
            <tr className="sticky top-0 z-10 border-b border-white/5 bg-white/5/95 backdrop-blur-sm">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant/60" scope="col">
                Transaction
              </th>
              <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant/60 md:table-cell" scope="col">
                Category
              </th>
              <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant/60 sm:table-cell" scope="col">
                Date
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-on-surface-variant/60" scope="col">
                Amount
              </th>
              <th className="w-10 px-4 py-3" scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <motion.tbody
            animate="visible"
            initial="hidden"
            variants={listContainerVariants}
          >
            {rows.map((row) => {
              const isIncome = row.type === "income";
              const CategoryIcon = getCategoryIcon(row.categoryId);
              const categoryColor = getCategoryColor(row.categoryId);
              const categoryDef = CATEGORY_REGISTRY[row.categoryId as keyof typeof CATEGORY_REGISTRY];
              const isHovered = hoveredRow === row.id;
              const isDeleting = deletingId === row.id;

              return (
                <motion.tr
                  key={row.id}
                  variants={listItemVariants}
                  onMouseEnter={() => setHoveredRow(row.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={cn(
                    "group border-b border-white/5 last:border-0 transition-colors duration-150",
                    isHovered && "bg-white/5/50",
                    isDeleting && "opacity-50 pointer-events-none",
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${categoryColor} 12%, transparent)`,
                        }}
                      >
                        <CategoryIcon
                          size={18}
                          className="transition-colors duration-200"
                          style={{ color: categoryColor }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-on-surface">
                            {row.description}
                          </span>
                          <div
                            className="hidden h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white sm:flex"
                            style={{ backgroundColor: getMerchantColor(row.description) }}
                            title={row.description}
                          >
                            {getMerchantInitials(row.description)}
                          </div>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-on-surface-variant/60 md:hidden">
                          <span>{categoryDef?.label ?? row.categoryId}</span>
                          <span className="h-0.5 w-0.5 rounded-full bg-on-surface-variant/60/40" />
                          <DateText value={row.occurredOn} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <Badge
                      tone="neutral"
                      className="inline-flex items-center gap-1.5"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: categoryColor }}
                      />
                      {categoryDef?.label ?? row.categoryId}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-on-surface-variant/60 sm:table-cell">
                    <DateText value={row.occurredOn} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-sm font-bold tabular-nums financial-value",
                        isIncome ? "text-kpi-income" : "text-kpi-expense",
                      )}
                    >
                      {isIncome ? (
                        <span className="text-xs font-medium text-kpi-income/70">+</span>
                      ) : (
                        <span className="text-xs font-medium text-kpi-expense/70">−</span>
                      )}
                      <CurrencyText
                        currency={row.currency}
                        minorValue={row.amountMinor}
                      />
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className={cn(
                        "flex items-center justify-end gap-1 transition-opacity duration-150",
                        isHovered ? "opacity-100" : "opacity-0 sm:opacity-0",
                        "opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
                      )}
                    >
                      {onDelete && (
                        <button
                          aria-label={`Delete transaction: ${row.description}`}
                          onClick={() => onDelete(row)}
                          disabled={isDeleting}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant/60 transition-colors hover:bg-danger-surface hover:text-danger"
                          type="button"
                        >
                          <Trash2 size={14} strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
