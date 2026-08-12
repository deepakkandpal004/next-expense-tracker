"use client";

import { useState } from "react";
import { CheckCircle2, Upload } from "lucide-react";
import { Button, Dialog, useToast } from "@/components/ui";

interface ImportResult {
  imported: number;
  skipped: number;
  duplicates: number;
  errors: string[];
}

export function ImportTransactionsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const runImport = async () => {
    if (!file) return;
    setPending(true);
    const fd = new FormData();
    fd.set("file", file);
    try {
      const { importTransactionsFromCsv } = await import("@/app/actions/importTransactions");
      const res = await importTransactionsFromCsv(fd);
      if (res.status === "success") {
        setResult({ imported: res.data.imported, skipped: res.data.skipped, duplicates: res.data.duplicates, errors: res.data.errors });
        toast({ description: `Imported ${res.data.imported} transactions.`, tone: "success" });
      } else {
        toast({ description: res.message, tone: "error" });
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog
      closeLabel="Close import"
      description="Upload a CSV file to import transactions."
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setFile(null);
          setResult(null);
        }
      }}
      open={open}
      title="Import transactions"
    >
      <div className="grid gap-4">
        {!result ? (
          <>
            <div
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 p-8 text-center hover:border-primary/50 transition-colors"
              onClick={() => document.getElementById("csv-input")?.click()}
            >
              <Upload className="mb-2 size-8 text-muted-foreground" />
              <p className="text-sm font-medium">{file ? file.name : "Click to select a CSV file"}</p>
              <p className="text-xs text-muted-foreground mt-1">Auto-detects columns. Date, Description, Amount, Type, Category — or a CSV exported from this app.</p>
              <input id="csv-input" type="file" accept=".csv" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
            {file && (
              <dl className="grid gap-1 rounded-container border border-white/5 bg-white/5 p-3 text-interface-sm">
                <div className="flex justify-between"><dt className="text-on-surface-variant/60">File</dt><dd>{file.name}</dd></div>
                <div className="flex justify-between"><dt className="text-on-surface-variant/60">Size</dt><dd>{(file.size / 1024).toFixed(1)} KB</dd></div>
              </dl>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4">
            <CheckCircle2 className="size-10 text-success" />
            <p className="text-sm font-medium text-on-surface">Import complete</p>
            <p className="text-xs text-muted-foreground">{result.imported} imported, {result.duplicates} duplicate(s) skipped, {result.skipped} skipped</p>
            {result.errors.length > 0 && (
              <ul className="mt-2 max-h-40 w-full space-y-1 overflow-y-auto rounded-container border border-white/5 bg-white/5 p-3 text-left text-xs text-danger-foreground">
                {result.errors.map((error, index) => <li key={index}>{error}</li>)}
              </ul>
            )}
          </div>
        )}
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button disabled={pending || !!result} intent="secondary" label="Cancel" onClick={() => onOpenChange(false)} />
        <Button disabled={!file || pending || !!result} label="Import CSV" loading={pending} onClick={() => void runImport()} />
      </div>
    </Dialog>
  );
}
