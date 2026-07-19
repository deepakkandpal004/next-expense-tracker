"use client";

import { Download, RefreshCw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createTransaction, type CreateTransactionRequest } from "@/app/actions/addExpenseRecord";
import { deleteTransactionRecord } from "@/app/actions/deleteRecord";
import AddNewRecord, { type TransactionSubmission } from "@/components/AddNewRecord";
import {
  Alert,
  Button,
  Dialog,
  StatusRegion,
} from "@/components/ui";
import {
  clearRecordFilters,
  createExportScope,
  selectRecords,
  serializeCsvExport,
} from "@/lib/domain/record-selection";
import { withReportingPeriodSearchParams } from "@/lib/domain/reporting-period";
import type { ReportingPeriod, ResolvedPeriod, SortDirection, SortKey, Transaction, TransactionQuery, TransactionType } from "@/lib/domain/types";
import { TransactionTable } from "./transaction-table";
import { TransactionFilters } from "./transaction-filters";
import { TransactionPagination } from "./transaction-pagination";
import { TransactionEmptyState } from "./transaction-states";

const ITEMS_PER_PAGE = 15;

function parseSort(value: string | null): { key: SortKey; direction: SortDirection } {
  if (value === "date-asc") return { key: "date", direction: "asc" };
  if (value === "amount-desc") return { key: "amount", direction: "desc" };
  if (value === "amount-asc") return { key: "amount", direction: "asc" };
  return { key: "date", direction: "desc" };
}

function sortValue(sort: { key: SortKey; direction: SortDirection }): string {
  return `${sort.key}-${sort.direction}`;
}

export interface RecordsViewProps {
  records: readonly Transaction[];
  period: ReportingPeriod;
  resolvedPeriod: ResolvedPeriod;
  currency: string;
  initialAddTransaction: boolean;
}

export function RecordsView({ records, period, resolvedPeriod, currency, initialAddTransaction }: RecordsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [items, setItems] = useState(records);
  const [status, setStatus] = useState<string | undefined>();
  const [exportOpen, setExportOpen] = useState(false);
  const [exportPending, setExportPending] = useState(false);
  const [exportError, setExportError] = useState<string | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteFailure, setDeleteFailure] = useState<{ message: string; record: Transaction; requestId: string } | undefined>();
  const [addTransactionOpen, setAddTransactionOpen] = useState(initialAddTransaction);
  const [currentPage, setCurrentPage] = useState(1);

  const query: TransactionQuery = useMemo(() => ({
    period,
    search: searchParams.get("search") ?? "",
    types: (searchParams.get("type") ? [searchParams.get("type") as TransactionType] : []),
    categories: (searchParams.get("category") ? [searchParams.get("category") as string] : []),
    sort: parseSort(searchParams.get("sort")),
  }), [period, searchParams]);

  const selection = useMemo(() => selectRecords(items, query), [items, query]);

  const totalPages = Math.ceil(selection.records.length / ITEMS_PER_PAGE);
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return selection.records.slice(start, start + ITEMS_PER_PAGE);
  }, [selection.records, currentPage]);

  const updateParams = useCallback((patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

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

  const submitTransaction = async (submission: TransactionSubmission) => {
    const result = await createTransaction(submission as CreateTransactionRequest);
    if (result.status === "success" && result.data.transaction) {
      const created = result.data.transaction;
      setItems((current) => [{
        id: created.id,
        description: created.text,
        amountMinor: Math.round(created.amount * 100),
        currency,
        type: created.type,
        categoryId: created.category,
        occurredOn: created.date,
        createdAt: new Date().toISOString(),
      }, ...current]);
      setStatus(result.message);
      setCurrentPage(1);
    }
    return result;
  };

  const closeAddTransaction = (open: boolean) => {
    setAddTransactionOpen(open);
    if (!open && searchParams.get("addTransaction")) {
      updateParams({ addTransaction: null });
    }
  };

  const requestDelete = async (record: Transaction, requestId = `${record.id}-delete-${Date.now()}`) => {
    setDeletingId(record.id);
    setDeleteFailure(undefined);
    try {
      const result = await deleteTransactionRecord({ recordId: record.id, requestId });
      if (result.status === "success") {
        setItems((current) => current.filter((item) => item.id !== record.id));
        setStatus(result.message);
        if (paginatedRecords.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
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

  const exportScope = useMemo(() => createExportScope({ period: resolvedPeriod, selection }), [resolvedPeriod, selection]);

  const runExport = async () => {
    setExportPending(true);
    setExportError(undefined);
    try {
      const file = serializeCsvExport(exportScope);
      if (!file) {
        setExportError("The export could not be created. Please retry.");
        return;
      }
      const blob = new Blob([file.content], { type: file.mediaType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus(`Export created: ${file.filename}`);
      setExportOpen(false);
    } catch {
      setExportError("The export could not be created. Please retry.");
    } finally {
      setExportPending(false);
    }
  };

  const handleDeleteFromTable = (row: Transaction) => {
    void requestDelete(row);
  };

  return (
    <div className="grid gap-6">
      <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-display-xl font-bold text-on-surface">Transactions</h1>
          <p className="mt-1 text-body text-on-surface-variant/60">{resolvedPeriod.label}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button icon={<Download size={16} />} intent="secondary" label="Export" onClick={() => setExportOpen(true)} />
          <AddNewRecord initialOpen={addTransactionOpen} onOpenChange={closeAddTransaction} submitTransaction={submitTransaction} />
        </div>
      </header>

      <StatusRegion message={status} visible={Boolean(status)} />

      <section
        aria-label="Filter and sort records"
        className="glass-vessel p-4"
      >
        <TransactionFilters
          search={query.search}
          type={query.types[0] ?? ""}
          category={query.categories[0] ?? ""}
          sort={sortValue(query.sort)}
          recordCount={selection.records.length}
          activeFilters={selection.activeFilters}
          onSearchChange={handleSearchChange}
          onTypeChange={handleTypeChange}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
          onClearFilters={clearFilters}
          onRemoveFilter={handleRemoveFilter}
        />
      </section>

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

      {selection.records.length === 0 ? (
        <TransactionEmptyState
          hasFilters={selection.activeFilterCount > 0}
          onClearFilters={clearFilters}
          onAddTransaction={() => setAddTransactionOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          <TransactionTable
            rows={paginatedRecords}
            onDelete={handleDeleteFromTable}
            deletingId={deletingId}
          />

          <TransactionPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={selection.records.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <Dialog
        closeLabel="Close export"
        description="Review the export scope before creating the file."
        onOpenChange={setExportOpen}
        open={exportOpen}
        title="Export records"
      >
        <div className="grid gap-4">
          <dl className="grid gap-2 rounded-container border border-white/5 bg-white/5 p-4 text-interface-sm">
            <div className="flex justify-between gap-4"><dt className="text-on-surface-variant/60">Reporting period</dt><dd>{exportScope.summary.period.label}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-on-surface-variant/60">Active filters</dt><dd>{exportScope.summary.activeFilters.length || "None"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-on-surface-variant/60">Format</dt><dd>{exportScope.summary.format.toUpperCase()}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-on-surface-variant/60">Records</dt><dd>{exportScope.summary.recordCount}</dd></div>
            <div className="grid gap-1 border-t border-white/5 pt-2">
              <dt className="text-on-surface-variant/60">Included columns</dt>
              <dd>{exportScope.summary.columns.join(", ")}</dd>
            </div>
          </dl>
          {exportScope.status !== "ready" ? <Alert description={exportScope.message} title="Nothing to export" tone="warning" /> : null}
          {exportError ? <Alert description={exportError} title="Export failed" tone="danger" /> : null}
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button disabled={exportPending} intent="secondary" label="Cancel" onClick={() => setExportOpen(false)} />
          <Button disabled={!exportScope.summary.canCreate} label="Download CSV" loading={exportPending} onClick={() => void runExport()} />
        </div>
      </Dialog>
    </div>
  );
}
