"use client";

import { Calculator } from "lucide-react";
import { useState } from "react";
import { getCanAfford } from "@/app/actions/getCanAfford";
import { getCanAffordVerdict } from "@/app/actions/getCanAffordVerdict";
import { Button, Dialog, Field, useToast } from "@/src/common/ui";
import type { CanAffordBreakdown } from "@/src/common/domain/can-i-afford";
import { BreakdownView } from "./breakdown-view";
import type { CanIAffordDialogProps } from "./types";
import { priceToMinor } from "./utils";

export { type CanIAffordDialogProps } from "./types";

export function CanIAffordDialog({
  period,
  currency,
  triggerLabel = "Ask affordability check",
}: CanIAffordDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [priceError, setPriceError] = useState<string | undefined>();
  const [checking, setChecking] = useState(false);
  const [breakdown, setBreakdown] = useState<CanAffordBreakdown | null>(null);
  const [verdict, setVerdict] = useState<string | null | undefined>(undefined);
  const [verdictUnavailable, setVerdictUnavailable] = useState(false);
  const [askingVerdict, setAskingVerdict] = useState(false);

  const check = async () => {
    const priceMinor = priceToMinor(priceInput);
    if (priceMinor === null) {
      setPriceError("Enter a purchase price above 0.");
      return;
    }
    setPriceError(undefined);
    setChecking(true);
    try {
      const result = await getCanAfford(priceMinor, period);
      if (result.status === "success") {
        setBreakdown(result.data.breakdown);
        setVerdict(undefined);
        setVerdictUnavailable(false);
        return;
      }
      if (result.status === "validation-error") {
        setPriceError(result.fieldErrors.price?.[0] ?? result.message);
        return;
      }
      toast({ description: result.message, tone: "error" });
    } catch {
      toast({ description: "Could not check affordability. Please retry.", tone: "error" });
    } finally {
      setChecking(false);
    }
  };

  const askVerdict = async () => {
    if (!breakdown || askingVerdict) return;
    setAskingVerdict(true);
    setVerdict(undefined);
    setVerdictUnavailable(false);
    try {
      const result = await getCanAffordVerdict(breakdown);
      if (result.status === "success") {
        setVerdict(result.data.verdict);
        setVerdictUnavailable(!result.data.verdict);
        return;
      }
      setVerdictUnavailable(true);
    } catch {
      setVerdictUnavailable(true);
    } finally {
      setAskingVerdict(false);
    }
  };

  const close = () => {
    setOpen(false);
    setPriceInput("");
    setPriceError(undefined);
    setBreakdown(null);
    setVerdict(undefined);
    setVerdictUnavailable(false);
  };

  return (
    <Dialog
      closeLabel="Close can I afford dialog"
      description="Check a planned purchase against your current Safe-to-Spend space before buying."
      onOpenChange={setOpen}
      open={open}
      title={breakdown ? "Affordability check" : "Can I afford this?"}
      trigger={
        <Button
          icon={<Calculator size={14} />}
          intent="secondary"
          label={triggerLabel}
        />
      }
    >
      {!breakdown ? (
        <form
          className="grid gap-5"
          noValidate
          onSubmit={(e) => { e.preventDefault(); void check(); }}
        >
          <Field
            autoFocus
            disabled={checking}
            error={priceError}
            id="can-i-afford-price"
            label={`Purchase price (${currency})`}
            min="0.01"
            onChange={(e) => setPriceInput(e.target.value)}
            placeholder="e.g. 85000"
            required
            step="0.01"
            type="number"
            value={priceInput}
          />
          <div className="flex flex-wrap justify-end gap-3 border-t border-white/10 pt-5">
            <Button disabled={checking} intent="secondary" label="Cancel" onClick={close} />
            <Button label="Submit" loading={checking} type="submit" />
          </div>
        </form>
      ) : (
        <BreakdownView
          askingVerdict={askingVerdict}
          breakdown={breakdown}
          currency={currency}
          onAskVerdict={() => void askVerdict()}
          onClose={close}
          period={period}
          verdict={verdict}
          verdictUnavailable={verdictUnavailable}
        />
      )}
    </Dialog>
  );
}
