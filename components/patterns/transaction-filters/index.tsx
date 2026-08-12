"use client";

import { Search, X, SlidersHorizontal } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui";
import { CATEGORY_REGISTRY } from "@/lib/domain/categories";
import { FilterDropdown } from "./filter-dropdown";
import { FilterChip } from "./filter-chip";
import { categoryOptions, sortOptions, typeOptions } from "./options";
import type { TransactionFiltersProps } from "./types";

export { type TransactionFiltersProps } from "./types";

export function TransactionFilters({
  search,
  type,
  category,
  sort,
  recordCount,
  activeFilters,
  onSearchChange,
  onTypeChange,
  onCategoryChange,
  onSortChange,
  onClearFilters,
  onRemoveFilter,
}: TransactionFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearch(value);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onSearchChange(value);
      }, 300);
    },
    [onSearchChange],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const filterLabel = (filter: { kind: string; value: string }) => {
    if (filter.kind === "search") return `Search: ${filter.value}`;
    if (filter.kind === "type") return filter.value === "income" ? "Type: Income" : "Type: Expense";
    return `Category: ${CATEGORY_REGISTRY[filter.value as keyof typeof CATEGORY_REGISTRY]?.label ?? filter.value}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60"
          />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search transactions..."
            className="h-9 w-full rounded-xl border border-white/5 bg-white/[0.02] pl-9 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 transition-colors focus:border-primary-fixed/50 focus:outline-none focus:ring-2 focus:ring-primary-fixed/20"
          />
          {localSearch && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface"
              type="button"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <FilterDropdown
          label="Type"
          options={typeOptions}
          value={type}
          onChange={onTypeChange}
        />

        <FilterDropdown
          label="Category"
          options={categoryOptions}
          value={category}
          onChange={onCategoryChange}
        />

        <FilterDropdown
          label="Sort"
          options={sortOptions}
          value={sort}
          onChange={onSortChange}
          icon={<SlidersHorizontal size={14} />}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2" aria-live="polite">
        <span className="text-xs text-on-surface-variant/60">
          {recordCount} transaction{recordCount === 1 ? "" : "s"}
        </span>

        <AnimatePresence mode="popLayout">
          {activeFilters.map((filter, index) => (
            <FilterChip
              key={`${filter.kind}-${index}`}
              label={filterLabel(filter)}
              onRemove={() => onRemoveFilter(filter)}
            />
          ))}
        </AnimatePresence>

        {activeFilters.length > 0 && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              intent="ghost"
              label="Clear all"
              onClick={onClearFilters}
              className="h-6 text-xs"
            />
          </motion.span>
        )}
      </div>
    </div>
  );
}
