"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/ui/cn";

export interface TransactionPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function TransactionPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: TransactionPaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-xs text-foreground-secondary">
        Showing <span className="font-medium text-foreground">{startItem}</span> to{" "}
        <span className="font-medium text-foreground">{endItem}</span> of{" "}
        <span className="font-medium text-foreground">{totalItems}</span> transactions
      </p>

      <div className="flex items-center gap-1">
        <PaginationButton
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
        >
          <ChevronsLeft size={14} />
        </PaginationButton>

        <PaginationButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </PaginationButton>

        <div className="flex items-center gap-1 px-2">
          {getPageNumbers().map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-8 w-8 items-center justify-center text-xs text-foreground-secondary"
                >
                  ···
                </span>
              );
            }

            return (
              <motion.button
                key={page}
                onClick={() => onPageChange(page)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-sm font-medium transition-all duration-150",
                  page === currentPage
                    ? "bg-foreground text-background shadow-sm"
                    : "text-foreground-secondary hover:bg-surface-subtle hover:text-foreground",
                )}
                type="button"
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </motion.button>
            );
          })}
        </div>

        <PaginationButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </PaginationButton>

        <PaginationButton
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
        >
          <ChevronsRight size={14} />
        </PaginationButton>
      </div>
    </div>
  );
}

interface PaginationButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  "aria-label"?: string;
}

function PaginationButton({
  children,
  onClick,
  disabled,
  "aria-label": ariaLabel,
}: PaginationButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150",
        disabled
          ? "cursor-not-allowed text-foreground-secondary/30"
          : "text-foreground-secondary hover:bg-surface-subtle hover:text-foreground",
      )}
      type="button"
      aria-label={ariaLabel}
      aria-disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
