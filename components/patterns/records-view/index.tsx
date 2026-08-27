"use client";

import { Download, RefreshCw, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { deleteTransactionRecord } from "@/app/actions/deleteRecord";
import { getForecastSnapshot } from "@/app/actions/getForecastSnapshot";
import {
  Alert,
  Button,
  useToast,
} from "@/components/ui";
import {
  clearRecordFilters,
  createExportScope,
  selectRecords,
  type RecordSelection,
} from "@/lib/domain/record-selection";
import { withReportingPeriodSearchParams } from "@/lib/domain/reporting-period";
import type { Transaction, TransactionQuery, TransactionType } from "@/lib/domain/types";
import { MonthSwitcher } from "@/components/patterns/month-switcher";
import { TransactionTable } from "../transaction-table";
import { TransactionFilters } from "../transaction-filters";
import { TransactionPagination } from "../transaction-pagination";
import { TransactionEmptyState } from "../transaction-states";
import { ExportRecordsDialog } from "./export-dialog";
import { ImportTransactionsDialog } from "./import-dialog";
import { BulkDeleteDialog } from "./bulk-delete-dialog";
import { parseSort, sortValue } from "./sort-utils";
import { ITEMS_PER_PAGE, type RecordsViewProps } from "./types";

export { type RecordsViewProps } from "./types";

export function RecordsView({ records, period, resolvedPeriod, pagination }: RecordsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [items, setItems] = useState(records);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteFailure, setDeleteFailure] = useState<{ message: string; record: Transaction; requestId: string } | undefined>();
  const [currentPage, setCurrentPage] = useState(pagination?.page ?? 1);
  const [anomalyIds, setAnomalyIds] = useState<ReadonlySet<string> | undefined>();
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkPending, setBulkPending] = useState(false);
  const [bulkError, setBulkError] = useState<string | undefined>();

  // Keep local rows in sync with the server-rendered payload: useState only
  // initializes once, so after router.refresh() delivers new records the table
  // would otherwise show stale data until a full page reload.
  useEffect(() => {
    setItems(records);
  }, [records]);

  // Drop selections whose records are no longer present (deleted or refreshed).
  useEffect(() => {
    setSelectedIds((current) => {
      if (current.size === 0) return current;
      const valid = new Set(items.map((item) => item.id));
      const next = new Set([...current].filter((id) => valid.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [items]);

  useEffect(() => {
    // Debounce forecast fetch — avoids firing on rapid period switches (300ms)
    // Server now caches for 5min, so repeated calls are cheap, but debouncing
    // still prevents main-thread jank on filter typing.
    const timer = setTimeout(() => {
      getForecastSnapshot(resolvedPeriod).then(r => {
        if (r.status === "success" && r.data.anomalies.length > 0) {
          setAnomalyIds(new Set(r.data.anomalies.map(a => a.transactionId)));
        } else {
          setAnomalyIds(undefined);
        }
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [resolvedPeriod]);

  const query: TransactionQuery = useMemo(() => ({
    period,
    search: searchParams.get("search") ?? "",
    types: (searchParams.get("type") ? [searchParams.get("type") as TransactionType] : []),
    categories: (searchParams.get("category") ? [searchParams.get("category") as string] : []),
    sort: parseSort(searchParams.get("sort")),
  }), [period, searchParams]);

  const isServerPaginated = !!pagination;

  const selection = useMemo(() => {
    if (isServerPaginated) {
      // Server already filtered + sorted + paginated; just expose for UI
      return {
        records: items,
        activeFilters: selectRecords(items, query).activeFilters,
        activeFilterCount: selectRecords(items, query).activeFilterCount,
      } as RecordSelection;
    }
    return selectRecords(items, query);
  }, [items, query, isServerPaginated]);

  const totalPages = isServerPaginated
    ? Math.ceil((pagination?.total ?? 0) / (pagination?.take ?? ITEMS_PER_PAGE))
    : Math.ceil(selection.records.length / ITEMS_PER_PAGE);

  const paginatedRecords = useMemo(() => {
    if (isServerPaginated) return selection.records;
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return selection.records.slice(start, start + ITEMS_PER_PAGE);
  }, [selection.records, currentPage, isServerPaginated]);

  const updateParams = useCallback((patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    // Reset to page 1 when filters change and server pagination is active
    if (isServerPaginated && (patch.search !== undefined || patch.type !== undefined || patch.category !== undefined || patch.sort !== undefined)) {
      params.set("page", "1");
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams, isServerPaginated]);

  const handlePageChange = useCallback((page: number) => {
    if (isServerPaginated) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      router.push(`${pathname}?${params.toString()}`);
    } else {
      setCurrentPage(page);
    }
  }, [isServerPaginated, pathname, router, searchParams]);

  // Keep currentPage in sync with server page
  useEffect(() => {
    if (isServerPaginated && pagination?.page && pagination.page !== currentPage) {
      setCurrentPage(pagination.page);
    }
  }, [pagination?.page, isServerPaginated, currentPage]);

  const clearFilters = () => {
    const cleared = clearRecordFilters(query);
    const params = withReportingPeriodSearchParams(new URLSearchParams(), period) ?? new URLSearchParams();
    params.set("sort", sortValue(cleared.sort));
    router.push(`${pathname}?${params.toString()}`);
    setCurrentPage(1);
  };

  const handleSearchChange = useCallback((value: string) => {
    updateParams({ search: value || null });
    setCurrentPage(1);
  }, [updateParams]);

  const handleTypeChange = useCallback((value: string) => {
    updateParams({ type: value || null });
    setCurrentPage(1);
  }, [updateParams]);

  const handleCategoryChange = useCallback((value: string) => {
    updateParams({ category: value || null });
    setCurrentPage(1);
  }, [updateParams]);

  const handleSortChange = useCallback((value: string) => {
    updateParams({ sort: value });
    setCurrentPage(1);
  }, [updateParams]);

  const handleRemoveFilter = useCallback((filter: { kind: string; value: string }) => {
    if (filter.kind === "search") updateParams({ search: null });
    else if (filter.kind === "type") updateParams({ type: null });
    else if (filter.kind === "category") updateParams({ category: null });
    setCurrentPage(1);
  }, [updateParams]);

  const requestDelete = async (record: Transaction, requestId = `${record.id}-delete-${Date.now()}`) => {
    setDeletingId(record.id);
    setDeleteFailure(undefined);
    try {
      const result = await deleteTransactionRecord({ recordId: record.id, requestId });
      if (result.status === "success") {
        toast({ description: result.message, tone: "success" });
        if (isServerPaginated) {
          router.refresh();
        } else {
          setItems((current) => current.filter((item) => item.id !== record.id));
          if (paginatedRecords.length === 1 && currentPage > 1) {
            handlePageChange(currentPage - 1);
          }
        }
      } else {
        setDeleteFailure({ message: result.message, record, requestId });
      }
    } catch {
      setDeleteFailure({ message: "The transaction could not be deleted. Please retry.", record, requestId });
    } finally {
      setDeletingId(null);
    }
  };

  const runBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkPending(true);
    setBulkError(undefined);
    const requestId = `bulk-delete-${Date.now()}`;
    try {
      const { deleteTransactionRecords } = await import("@/app/actions/deleteRecords");
      const res = await deleteTransactionRecords({ recordIds: [...selectedIds], requestId });
      if (res.status === "success") {
        toast({ description: res.message, tone: "success" });
        if (isServerPaginated) {
          router.refresh();
        } else {
          const removed = new Set(res.data.recordIds);
          const remaining = items.filter((item) => !removed.has(item.id));
          setItems(remaining);
          const maxPage = Math.max(1, Math.ceil(remaining.length / ITEMS_PER_PAGE));
          if (currentPage > maxPage) handlePageChange(maxPage);
        }
        setSelectedIds(new Set());
        setBulkDeleteOpen(false);
      } else {
        setBulkError(res.message);
        setBulkDeleteOpen(true);
      }
    } catch {
      setBulkError("The transactions could not be deleted. Please retry.");
      setBulkDeleteOpen(true);
    } finally {
      setBulkPending(false);
    }
  };

  const exportScope = useMemo(() => createExportScope({ period: resolvedPeriod, selection }), [resolvedPeriod, selection]);

  const handleDeleteFromTable = (row: Transaction) => {
    void requestDelete(row);
  };

  return (
    <div className="grid gap-6">
      <header className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="text-display-2xl font-bold tracking-tight text-on-surface">Transactions</h1>
          <MonthSwitcher period={resolvedPeriod} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button icon={<Upload size={16} />} intent="secondary" label="Import" onClick={() => setImportOpen(true)} />
          <Button icon={<Download size={16} />} intent="secondary" label="Export" onClick={() => setExportOpen(true)} />
          <Button label="Add" onClick={() => window.dispatchEvent(new CustomEvent("open-add-transaction", { detail: { type: "expense" } }))} />
        </div>
      </header>

      <section
        aria-label="Filter and sort records"
        className="relative z-10 glass-vessel p-4"
      >
        <TransactionFilters
          search={query.search}
          type={query.types[0] ?? ""}
          category={query.categories[0] ?? ""}
          sort={sortValue(query.sort)}
          recordCount={isServerPaginated ? (pagination?.total ?? 0) : selection.records.length}
          activeFilters={selection.activeFilters}
          onSearchChange={handleSearchChange}
          onTypeChange={handleTypeChange}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
          onClearFilters={clearFilters}
          onRemoveFilter={handleRemoveFilter}
        />
      </section>

      {selectedIds.size > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-container border border-border-strong bg-surface px-4 py-3">
          <p className="text-interface-sm font-medium text-foreground">
            {selectedIds.size} transaction{selectedIds.size === 1 ? "" : "s"} selected
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              intent="secondary"
              label="Clear selection"
              onClick={() => setSelectedIds(new Set())}
            />
            <Button
              icon={<Trash2 size={16} />}
              intent="danger"
              label={`Delete ${selectedIds.size === 1 ? "transaction" : `${selectedIds.size} transactions`}`}
              onClick={() => { setBulkError(undefined); setBulkDeleteOpen(true); }}
            />
          </div>
        </div>
      ) : null}

      {deleteFailure ? (
        <Alert
          action={(
            <div className="flex flex-wrap gap-2">
              <Button
                icon={<RefreshCw size={18} />}
                label="Retry delete"
                loading={deletingId === deleteFailure.record.id}
                onClick={() => void requestDelete(deleteFailure.record, deleteFailure.requestId)}
              />
              <Button intent="secondary" label="Dismiss" onClick={() => setDeleteFailure(undefined)} />
            </div>
          )}
          description={deleteFailure.message}
          title="Transaction could not be deleted"
          tone="danger"
        />
      ) : null}

      {(isServerPaginated ? (pagination?.total ?? 0) === 0 : selection.records.length === 0) ? (
        <TransactionEmptyState
          hasFilters={selection.activeFilterCount > 0}
          onClearFilters={clearFilters}
          onAddTransaction={() => window.dispatchEvent(new CustomEvent("open-add-transaction", { detail: { type: "expense" } }))}
        />
      ) : (
        <div className="space-y-4">
          <TransactionTable
            rows={paginatedRecords}
            onDelete={handleDeleteFromTable}
            deletingId={deletingId}
            anomalyIds={anomalyIds}
            onSelectionChange={setSelectedIds}
            selectedIds={selectedIds}
          />

          <TransactionPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={isServerPaginated ? (pagination?.total ?? 0) : selection.records.length}
            itemsPerPage={pagination?.take ?? ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <ExportRecordsDialog open={exportOpen} scope={exportScope} onOpenChange={setExportOpen} />

      <ImportTransactionsDialog open={importOpen} onOpenChange={setImportOpen} />

      <BulkDeleteDialog
        open={bulkDeleteOpen}
        count={selectedIds.size}
        pending={bulkPending}
        error={bulkError}
        onOpenChange={(open) => {
          setBulkDeleteOpen(open);
          if (!open && !bulkPending) setBulkError(undefined);
        }}
        onConfirm={runBulkDelete}
      />
    </div>
  );
}
