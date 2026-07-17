"use client";

import { motion } from "motion/react";
import { Download, RefreshCw, Trash2, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { listContainerVariants, listItemVariants } from "@/lib/ui/motion";
import { createTransaction, type CreateTransactionRequest } from "@/app/actions/addExpenseRecord";
import { deleteTransactionRecord } from "@/app/actions/deleteRecord";
import AddNewRecord, { type TransactionSubmission } from "@/components/AddNewRecord";
import {
  Alert,
  Badge,
  Button,
  Card,
  ConfirmDestructiveAction,
  CurrencyText,
  DataTable,
  DateText,
  Dialog,
  Field,
  Select,
  StatusRegion,
} from "@/components/ui";
import { CATEGORY_REGISTRY, EXPENSE_CATEGORY_IDS } from "@/lib/domain/categories";
import {
  clearRecordFilters,
  createExportScope,
  selectRecords,
  serializeCsvExport,
  type ActiveRecordFilter,
} from "@/lib/domain/record-selection";
import { withReportingPeriodSearchParams } from "@/lib/domain/reporting-period";
import type { ReportingPeriod, ResolvedPeriod, SortDirection, SortKey, Transaction, TransactionQuery, TransactionType } from "@/lib/domain/types";

export interface RecordsViewProps {
  records: readonly Transaction[];
  period: ReportingPeriod;
  resolvedPeriod: ResolvedPeriod;
  currency: string;
  initialAddTransaction: boolean;
}

const categoryOptions = [
  { value: "", label: "All categories" },
  { value: "Income", label: "Income" },
  ...EXPENSE_CATEGORY_IDS.map((id) => ({ value: id, label: CATEGORY_REGISTRY[id].label })),
];

const typeOptions = [
  { value: "", label: "All types" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
];

const sortOptions = [
  { value: "date-desc", label: "Date (newest first)" },
  { value: "date-asc", label: "Date (oldest first)" },
  { value: "amount-desc", label: "Amount (highest first)" },
  { value: "amount-asc", label: "Amount (lowest first)" },
];

function parseSort(value: string | null): { key: SortKey; direction: SortDirection } {
  if (value === "date-asc") return { key: "date", direction: "asc" };
  if (value === "amount-desc") return { key: "amount", direction: "desc" };
  if (value === "amount-asc") return { key: "amount", direction: "asc" };
  return { key: "date", direction: "desc" };
}

function sortValue(sort: { key: SortKey; direction: SortDirection }): string {
  return `${sort.key}-${sort.direction}`;
}

function filterLabel(filter: ActiveRecordFilter): string {
  if (filter.kind === "search") return `Search: ${filter.value}`;
  if (filter.kind === "type") return filter.value === "income" ? "Type: Income" : "Type: Expense";
  return `Category: ${CATEGORY_REGISTRY[filter.value as keyof typeof CATEGORY_REGISTRY]?.label ?? filter.value}`;
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

  const query: TransactionQuery = useMemo(() => ({
    period,
    search: searchParams.get("search") ?? "",
    types: (searchParams.get("type") ? [searchParams.get("type") as TransactionType] : []),
    categories: (searchParams.get("category") ? [searchParams.get("category") as string] : []),
    sort: parseSort(searchParams.get("sort")),
  }), [period, searchParams]);

  const selection = useMemo(() => selectRecords(items, query), [items, query]);

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
  };

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

  const deleteAction = (row: Transaction) => (
    <ConfirmDestructiveAction
      consequence="This transaction will be permanently removed from your records."
      confirmLabel="Delete transaction"
      onConfirm={() => void requestDelete(row)}
      processing={deletingId === row.id}
      record={{
        amount: <CurrencyText currency={row.currency} minorValue={row.amountMinor} />,
        date: <DateText value={row.occurredOn} />,
        description: row.description,
      }}
      trigger={(
        <Button
          aria-label={`Delete transaction: ${row.description}`}
          icon={<Trash2 size={16} />}
          intent="danger"
          label="Delete transaction"
          loading={deletingId === row.id}
        />
      )}
    />
  );

  return (
    <div className="grid gap-8">
      <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-display-md font-semibold text-foreground">Records</h1>
          <p className="mt-1 text-interface-sm text-foreground-secondary">Reporting period: {resolvedPeriod.label}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button icon={<Download size={18} />} intent="secondary" label="Export CSV" onClick={() => setExportOpen(true)} />
          <AddNewRecord initialOpen={addTransactionOpen} onOpenChange={closeAddTransaction} submitTransaction={submitTransaction} />
        </div>
      </header>

      <StatusRegion message={status} visible={Boolean(status)} />

      <Card as="section" aria-label="Filter and sort records" elevation="raised">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            id="records-search"
            label="Search"
            onChange={(event) => updateParams({ search: event.target.value })}
            placeholder="Search descriptions"
            value={query.search}
          />
          <Select
            id="records-type"
            label="Type"
            onChange={(event) => updateParams({ type: event.target.value || null })}
            options={typeOptions}
            value={query.types[0] ?? ""}
          />
          <Select
            id="records-category"
            label="Category"
            onChange={(event) => updateParams({ category: event.target.value || null })}
            options={categoryOptions}
            value={query.categories[0] ?? ""}
          />
          <Select
            id="records-sort"
            label="Sort"
            onChange={(event) => updateParams({ sort: event.target.value })}
            options={sortOptions}
            value={sortValue(query.sort)}
          />
        </div>
        <div aria-live="polite" className="mt-4 flex flex-wrap items-center gap-2 text-interface-sm text-foreground-secondary">
          <span>{selection.records.length} record{selection.records.length === 1 ? "" : "s"} shown</span>
          {selection.activeFilters.map((filter, index) => (
            <Badge key={`${filter.kind}-${index}`} tone="info">{filterLabel(filter)}</Badge>
          ))}
          {selection.activeFilterCount > 0 ? (
            <Button icon={<X size={16} />} intent="ghost" label="Clear filters" onClick={clearFilters} />
          ) : null}
        </div>
      </Card>

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
        <Card as="section" className="p-8 text-center" elevation="raised">
          <p className="text-interface-md font-semibold text-foreground">
            {selection.activeFilterCount > 0 ? "No records match the current filters." : "No records for this reporting period yet."}
          </p>
          <p className="mt-2 text-interface-sm text-foreground-secondary">
            {selection.activeFilterCount > 0 ? "Clear filters or choose another reporting period." : "Add your first transaction to see it here."}
          </p>
          {selection.activeFilterCount > 0 ? (
            <div className="mt-4"><Button icon={<X size={16} />} intent="secondary" label="Clear filters" onClick={clearFilters} /></div>
          ) : null}
        </Card>
      ) : (
        <div>
          <DataTable
            caption={`Records for ${resolvedPeriod.label}`}
            className="hidden md:block"
            columns={[
              { id: "description", header: "Description", rowHeader: true, render: (row: Transaction) => row.description },
              { id: "category", header: "Category", render: (row: Transaction) => CATEGORY_REGISTRY[row.categoryId as keyof typeof CATEGORY_REGISTRY]?.label ?? row.categoryId },
              { id: "type", header: "Type", render: (row: Transaction) => row.type === "income" ? "Income" : "Expense" },
              { id: "date", header: "Date", render: (row: Transaction) => <DateText value={row.occurredOn} /> },
              { id: "amount", header: "Amount", align: "end", render: (row: Transaction) => <CurrencyText currency={row.currency} minorValue={row.type === "expense" ? -row.amountMinor : row.amountMinor} /> },
              { id: "actions", header: "Actions", align: "end", render: deleteAction },
            ]}
            rowKey={(row) => row.id}
            rows={selection.records}
          />

          <motion.ul
            animate="visible"
            aria-label={`Records for ${resolvedPeriod.label}`}
            className="grid gap-3 md:hidden"
            data-record-view="cards"
            initial="hidden"
            variants={listContainerVariants}
          >
            {selection.records.map((row) => (
              <motion.li key={row.id} layout variants={listItemVariants}>
                <Card as="article" className="grid gap-4" elevation="raised">
                  <h2 className="break-words text-interface-md font-semibold text-foreground">{row.description}</h2>
                  <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 text-interface-sm">
                    <dt className="text-foreground-secondary">Category</dt>
                    <dd className="break-words text-right text-foreground">{CATEGORY_REGISTRY[row.categoryId as keyof typeof CATEGORY_REGISTRY]?.label ?? row.categoryId}</dd>
                    <dt className="text-foreground-secondary">Type</dt>
                    <dd className="text-right text-foreground">{row.type === "income" ? "Income" : "Expense"}</dd>
                    <dt className="text-foreground-secondary">Date</dt>
                    <dd className="text-right text-foreground"><DateText value={row.occurredOn} /></dd>
                    <dt className="text-foreground-secondary">Amount</dt>
                    <dd className="financial-value text-right font-semibold text-foreground"><CurrencyText currency={row.currency} minorValue={row.type === "expense" ? -row.amountMinor : row.amountMinor} /></dd>
                  </dl>
                  <div className="flex justify-end">{deleteAction(row)}</div>
                </Card>
              </motion.li>
            ))}
          </motion.ul>
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
          <dl className="grid gap-2 rounded-container border border-border bg-surface-subtle p-4 text-interface-sm">
            <div className="flex justify-between gap-4"><dt className="text-foreground-secondary">Reporting period</dt><dd>{exportScope.summary.period.label}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-foreground-secondary">Active filters</dt><dd>{exportScope.summary.activeFilters.length || "None"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-foreground-secondary">Format</dt><dd>{exportScope.summary.format.toUpperCase()}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-foreground-secondary">Records</dt><dd>{exportScope.summary.recordCount}</dd></div>
            <div className="grid gap-1 border-t border-border pt-2">
              <dt className="text-foreground-secondary">Included columns</dt>
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
