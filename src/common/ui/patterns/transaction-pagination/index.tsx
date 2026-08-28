"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/common/ui/cn";
import { getPageNumbers, type TransactionPaginationProps } from "./pagination";
import { PaginationButton } from "./pagination-button";

export { type TransactionPaginationProps } from "./pagination";

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

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-xs text-on-surface-variant/60">
        Showing <span className="font-medium text-on-surface">{startItem}</span> to{" "}
        <span className="font-medium text-on-surface">{endItem}</span> of{" "}
        <span className="font-medium text-on-surface">{totalItems}</span> transactions
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
          {getPageNumbers(currentPage, totalPages).map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-8 w-8 items-center justify-center text-xs text-on-surface-variant/60"
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
                    : "text-on-surface-variant/60 hover:bg-white/5 hover:text-on-surface",
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