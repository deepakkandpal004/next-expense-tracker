"use client";

import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/ui/cn";
import { Button } from "@/components/ui";
import { CATEGORY_REGISTRY, EXPENSE_CATEGORY_IDS } from "@/lib/domain/categories";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/ui/motion";

const typeOptions = [
  { value: "", label: "All types" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
];

const categoryOptions = [
  { value: "", label: "All categories" },
  { value: "Income", label: "Income" },
  ...EXPENSE_CATEGORY_IDS.map((id) => ({ value: id, label: CATEGORY_REGISTRY[id].label })),
];

const sortOptions = [
  { value: "date-desc", label: "Newest first" },
  { value: "date-asc", label: "Oldest first" },
  { value: "amount-desc", label: "Highest amount" },
  { value: "amount-asc", label: "Lowest amount" },
];

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: MOTION_DURATION.fast, ease: MOTION_EASE.standard }}
      className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent"
    >
      {label}
      <button
        onClick={onRemove}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-accent/20"
        type="button"
        aria-label={`Remove filter: ${label}`}
      >
        <X size={10} strokeWidth={2.5} />
      </button>
    </motion.span>
  );
}

interface FilterDropdownProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}

function FilterDropdown({ label, options, value, onChange, icon }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? label;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.97]",
          value
            ? "border-accent/30 bg-accent/5 text-accent"
            : "border-border bg-surface text-foreground-secondary hover:border-border hover:bg-surface-subtle",
        )}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {icon}
        <span className="truncate max-w-[120px]">{selectedLabel}</span>
        <ChevronDown
          size={14}
          className={cn("transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: MOTION_DURATION.fast, ease: MOTION_EASE.standard }}
            className="absolute left-0 top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
            role="listbox"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center px-3 py-2 text-left text-sm transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent",
                  option.value === value
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-foreground hover:bg-surface-subtle",
                )}
                role="option"
                aria-selected={option.value === value}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export interface TransactionFiltersProps {
  search: string;
  type: string;
  category: string;
  sort: string;
  recordCount: number;
  activeFilters: readonly { kind: string; value: string }[];
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  onRemoveFilter: (filter: { kind: string; value: string }) => void;
}

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
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary"
          />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search transactions..."
            className="h-9 w-full rounded-xl border border-border bg-surface pl-9 pr-4 text-sm text-foreground placeholder:text-foreground-secondary/50 transition-colors focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          {localSearch && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground"
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
        <span className="text-xs text-foreground-secondary">
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
