"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, Receipt, CheckCircle2 } from "lucide-react";
import { scanReceipt, type ScannedReceipt } from "@/app/actions/scanReceipt";
import { createTransaction, type CreateTransactionRequest } from "@/app/actions/addExpenseRecord";
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Alert } from "@/components/ui";
import { CATEGORY_DEFINITIONS } from "@/lib/domain/categories";
import { formatCurrency } from "@/lib/formatters/locale";

interface ReceiptScannerProps {
  onTransactionCreated?: () => void;
}

export function ReceiptScanner({ onTransactionCreated }: ReceiptScannerProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScannedReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(f.type)) {
      setError("Please upload a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB.");
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
    setSuccess(false);
  };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    setError(null);

    const formData = new FormData();
    formData.set("receipt", file);

    const res = await scanReceipt(formData);
    if (res.status === "success") {
      setResult(res.data.receipt);
    } else {
      setError(res.message);
    }
    setScanning(false);
  };

  const handleCreateTransaction = async () => {
    if (!result) return;
    setCreating(true);

    const requestId = crypto.randomUUID();
    const command: CreateTransactionRequest = {
      requestId,
      command: {
        type: "expense",
        description: `${result.merchant}${result.items.length > 0 ? ` - ${result.items.slice(0, 2).map(i => i.description).join(", ")}${result.items.length > 2 ? "..." : ""}` : ""}`,
        date: result.date || new Date().toISOString().slice(0, 10),
        amount: result.total,
        category: result.category,
        categorySource: "ai-suggested",
        categoryConfirmed: true,
      },
    };

    const res = await createTransaction(command);
    if (res.status === "success") {
      setSuccess(true);
      onTransactionCreated?.();
      setTimeout(() => {
        setOpen(false);
        reset();
      }, 1500);
    } else {
      setError(res.message || "Could not create transaction.");
    }
    setCreating(false);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setSuccess(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <Button icon={<Camera className="size-4" />} intent="secondary" label="Scan receipt" onClick={() => setOpen(true)} />

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="mx-auto w-full max-w-lg">
            <Card>
              <CardHeader>
                <CardTitle>Scan a receipt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!preview && (
                  <div
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 p-8 text-center hover:border-primary/50 transition-colors"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload className="mb-2 size-8 text-muted-foreground" />
                    <p className="text-sm font-medium">Upload a receipt image</p>
                    <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP, or GIF — max 10MB</p>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileSelect} />
                  </div>
                )}

                {preview && !result && !success && (
                  <div className="space-y-4">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt="Receipt preview" className="max-h-64 w-full rounded-xl object-contain bg-black/20" />
                      <button type="button" onClick={reset} className="absolute top-2 right-2 rounded-full bg-background/80 p-1 text-foreground">
                        <X className="size-4" />
                      </button>
                    </div>
                    <Button icon={scanning ? <Loader2 className="size-4 animate-spin" /> : <Receipt className="size-4" />} label="Scan receipt" width="full" loading={scanning} onClick={handleScan} disabled={scanning} />
                  </div>
                )}

                {scanning && (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <Loader2 className="size-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">AI is analyzing the receipt...</p>
                  </div>
                )}

                {result && !success && (
                  <div className="space-y-3">
                    <div className="rounded-lg bg-primary/5 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{result.merchant}</span>
                        <span className="text-xs text-muted-foreground">{result.date}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/5 pt-2">
                        <span className="text-xs text-muted-foreground">Category</span>
                        <span className="text-xs font-medium">{CATEGORY_DEFINITIONS.find(d => d.id === result.category)?.label || result.category}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Total</span>
                        <span className="text-sm font-bold text-[#22C55E]">
                          {formatCurrency({ minorValue: Math.round(result.total * 100), currency: "INR" })}
                        </span>
                      </div>
                    </div>

                    {result.items.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Items</p>
                        {result.items.slice(0, 5).map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="truncate">{item.description}</span>
                            <span className="font-medium">{item.amount.toFixed(2)}</span>
                          </div>
                        ))}
                        {result.items.length > 5 && (
                          <p className="text-xs text-muted-foreground">+{result.items.length - 5} more items</p>
                        )}
                      </div>
                    )}

                    <Button icon={creating ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} label="Add expense" width="full" loading={creating} onClick={handleCreateTransaction} disabled={creating} />
                  </div>
                )}

                {success && (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <CheckCircle2 className="size-10 text-[#22C55E]" />
                    <p className="text-sm font-medium">Transaction added!</p>
                  </div>
                )}

                {error && <Alert title="Error" description={error} tone="danger" />}
              </CardContent>
              <CardFooter className="justify-end">
                <Button intent="ghost" label="Close" onClick={() => { reset(); setOpen(false); }} />
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
