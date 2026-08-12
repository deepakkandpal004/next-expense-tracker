"use client";

import { Alert, AlertDialog } from "@/components/ui";

export function BulkDeleteDialog({
  open,
  count,
  pending,
  error,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  count: number;
  pending: boolean;
  error?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const { action, cancel, description, title } = (() => {
    const label = `${count} transaction${count === 1 ? "" : "s"}`;
    return {
      action: { label: `Delete ${label}`, loading: pending, onSelect: () => void onConfirm() },
      cancel: { label: "Cancel", disabled: pending, onSelect: () => onOpenChange(false) },
      description: `This will permanently remove ${label} from every report and dashboard. This action cannot be undone.`,
      title: `Delete ${count === 1 ? "transaction" : label}?`,
    };
  })();

  return (
    <AlertDialog
      action={action}
      cancel={cancel}
      description={description}
      onOpenChange={onOpenChange}
      open={open}
      title={title}
    >
      {error ? (
        <Alert description={error} title="Delete failed" tone="danger" />
      ) : (
        <p className="text-interface-sm text-foreground-secondary">
          The selected transactions will be removed from your history, dashboard, and reports.
        </p>
      )}
    </AlertDialog>
  );
}
