"use client";

import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { setBudgetResult } from "@/app/actions/setBudget";
import { Button, Dialog, Field, useToast } from "@/components/ui";
import type { SetBudgetDialogProps } from "./types";

export { type SetBudgetDialogProps } from "./types";

export function SetBudgetDialog({
  currency,
  label = "Set budget",
  onSaved,
}: SetBudgetDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const today = new Date().toISOString().slice(0, 10);
  const { toast } = useToast();

  const submit = async () => {
    setPending(true);
    setError(undefined);
    try {
      const result = await setBudgetResult({ amount, effectiveFrom: today, currency });
      if (result.status === "success") {
        setOpen(false);
        setAmount("");
        await onSaved?.();
        toast({ description: result.message, tone: "success" });
        return;
      }
      setError(result.message);
    } catch {
      setError("The budget could not be saved. Please retry.");
    } finally {
      setPending(false);
    }
  };

  const isUpdate = label.toLowerCase().includes("update");

  return (
    <Dialog
      closeLabel="Close set budget"
      description="Set the monthly budget used to evaluate spending against your target."
      onOpenChange={setOpen}
      open={open}
      title={isUpdate ? "Update budget" : "Set budget"}
      trigger={
        <Button
          icon={isUpdate ? <Pencil size={14} /> : <Plus size={14} />}
          intent="secondary"
          label={label}
        />
      }
    >
      <form
        className="grid gap-5"
        noValidate
        onSubmit={(e) => { e.preventDefault(); void submit(); }}
      >
        <Field
          disabled={pending}
          error={error}
          id="budget-amount-dialog"
          label={`Monthly budget amount (${currency})`}
          min="0.01"
          onChange={(e) => setAmount(e.target.value)}
          required
          step="0.01"
          type="number"
          value={amount}
        />
        <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
          <Button disabled={pending} intent="secondary" label="Cancel" onClick={() => setOpen(false)} />
          <Button label={isUpdate ? "Save changes" : "Save budget"} loading={pending} type="submit" />
        </div>
      </form>
    </Dialog>
  );
}