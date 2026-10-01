import { DollarSign } from "lucide-react";
import { Select } from "@/src/common/ui";
import { CURRENCIES } from "./constants";

export function CurrencyField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-muted text-primary">
          <DollarSign size={18} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Currency</h2>
          <p className="text-xs text-muted-foreground">Preferred currency for amounts</p>
        </div>
      </div>
      <Select
        id="settings-currency"
        label="Currency"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={CURRENCIES.map((c) => ({ value: c.code, label: c.label }))}
      />
    </div>
  );
}
