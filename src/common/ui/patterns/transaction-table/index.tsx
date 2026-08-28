"use client";

import { motion } from "motion/react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/src/common/ui/cn";
import { CurrencyText, DateText } from "@/src/common/ui";
import { CATEGORY_REGISTRY } from "@/src/common/domain/categories";
import { listContainerVariants, listItemVariants } from "@/src/common/ui/motion";
import {
  getCategoryColor,
  getCategoryIcon,
  getMerchantColor,
  getMerchantInitials,
} from "./category-utils";
import { Checkbox } from "./checkbox";
import type { TransactionTableProps } from "./types";

export { type TransactionTableProps, type TransactionTableRow } from "./types";

export function TransactionTable({
  rows,
  onDelete,
  deletingId,
  anomalyIds,
  selectedIds,
  onSelectionChange,
}: TransactionTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const selectable = Boolean(onSelectionChange);

  if (rows.length === 0) {
    return null;
  }

  const pageIds = rows.map((row) => row.id);
  const pageSelectedCount = selectable
    ? pageIds.filter((id) => selectedIds?.has(id)).length
    : 0;
  const allPageSelected = pageIds.length > 0 && pageSelectedCount === pageIds.length;
  const somePageSelected = pageSelectedCount > 0 && !allPageSelected;

  const toggleAll = () => {
    if (!onSelectionChange) return;
    const next = new Set(selectedIds ?? []);
    if (allPageSelected) {
      pageIds.forEach((id) => next.delete(id));
    } else {
      pageIds.forEach((id) => next.add(id));
    }
    onSelectionChange(next);
  };

  const toggleRow = (id: string) => {
    if (!onSelectionChange) return;
    const next = new Set(selectedIds ?? []);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  return (
    <div className="relative overflow-hidden glass-vessel">
      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-left text-interface-sm">
          <thead>
            <tr className="sticky top-0 z-10 border-b border-white/5 bg-white/5/95 backdrop-blur-sm">
              {selectable ? (
                <th className="w-11 py-0 pl-4 pr-2 align-middle" scope="col">
                  <Checkbox
                    checked={allPageSelected}
                    indeterminate={somePageSelected}
                    label={allPageSelected ? "Deselect all on page" : "Select all on page"}
                    onToggle={toggleAll}
                  />
                </th>
              ) : null}
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant/60 align-middle" scope="col">
                Transaction
              </th>
              <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant/60 md:table-cell align-middle" scope="col">
                Category
              </th>
              <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant/60 sm:table-cell align-middle" scope="col">
                Date
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-on-surface-variant/60 align-middle" scope="col">
                Amount
              </th>
              <th className="w-10 px-4 py-3 align-middle" scope="col">
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
                  {selectable ? (
                    <td className="py-0 pl-4 pr-2 align-middle">
                      <Checkbox
                        checked={selectedIds?.has(row.id) ?? false}
                        label={`Select ${row.description}`}
                        onToggle={() => toggleRow(row.id)}
                      />
                    </td>
                  ) : null}
                  <td className="px-4 py-3 align-middle">
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
                          {anomalyIds?.has(row.id) && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-danger/20 bg-danger-surface px-1.5 py-0.5 text-[10px] font-medium text-danger">
                              <AlertTriangle size={10} />
                              Unusual
                            </span>
                          )}
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
                  <td className="hidden px-4 py-3 align-middle md:table-cell">
                    <span className="inline-flex items-center text-sm font-medium text-foreground">
                      {categoryDef?.label ?? row.categoryId}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 align-middle text-sm text-muted-foreground font-manrope sm:table-cell">
                    <DateText value={row.occurredOn} />
                  </td>
                  <td className="px-4 py-3 text-right align-middle">
                    <span
                      className={cn(
                        "text-sm font-bold tabular-nums font-manrope",
                        isIncome ? "text-success" : "text-danger",
                      )}
                    >
                      {isIncome ? (
                        <span className="mr-0.5 text-xs font-medium opacity-80">+</span>
                      ) : (
                        <span className="mr-0.5 text-xs font-medium opacity-80">−</span>
                      )}
                      <CurrencyText
                        currency={row.currency}
                        minorValue={row.amountMinor}
                      />
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle">
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
