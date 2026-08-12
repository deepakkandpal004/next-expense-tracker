"use client";

import { useState } from "react";
import { Alert, Button, Dialog, useToast } from "@/components/ui";
import { serializeCsvExport } from "@/lib/domain/record-selection";
import type { ExportScope } from "@/lib/domain/record-selection";

export function ExportRecordsDialog({
  open,
  scope,
  onOpenChange,
}: {
  open: boolean;
  scope: ExportScope;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const runExport = async () => {
    setPending(true);
    setError(undefined);
    try {
      const file = serializeCsvExport(scope);
      if (!file) {
        setError("The export could not be created. Please retry.");
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
      toast({ description: `Export created: ${file.filename}`, tone: "success" });
      onOpenChange(false);
    } catch {
      setError("The export could not be created. Please retry.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog
      closeLabel="Close export"
      description="Review the export scope before creating the file."
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setError(undefined);
      }}
      open={open}
      title="Export records"
    >
      <div className="grid gap-4">
        <dl className="grid gap-2 rounded-container border border-white/5 bg-white/5 p-4 text-interface-sm">
          <div className="flex justify-between gap-4"><dt className="text-on-surface-variant/60">Reporting period</dt><dd>{scope.summary.period.label}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-on-surface-variant/60">Active filters</dt><dd>{scope.summary.activeFilters.length || "None"}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-on-surface-variant/60">Format</dt><dd>{scope.summary.format.toUpperCase()}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-on-surface-variant/60">Records</dt><dd>{scope.summary.recordCount}</dd></div>
          <div className="grid gap-1 border-t border-white/5 pt-2">
            <dt className="text-on-surface-variant/60">Included columns</dt>
            <dd>{scope.summary.columns.join(", ")}</dd>
          </div>
        </dl>
        {scope.status !== "ready" ? <Alert description={scope.message} title="Nothing to export" tone="warning" /> : null}
        {error ? <Alert description={error} title="Export failed" tone="danger" /> : null}
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button disabled={pending} intent="secondary" label="Cancel" onClick={() => onOpenChange(false)} />
        <Button disabled={!scope.summary.canCreate} label="Download CSV" loading={pending} onClick={() => void runExport()} />
      </div>
    </Dialog>
  );
}
