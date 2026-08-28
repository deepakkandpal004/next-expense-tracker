import { motion } from "motion/react";
import { DollarSign } from "lucide-react";
import { listItemVariants } from "@/src/common/ui/motion";
import { CURRENCIES } from "./constants";

export function CurrencyField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <motion.div variants={listItemVariants} className="rounded-xl border border-border/50 bg-surface p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <DollarSign size={18} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Currency</h2>
          <p className="text-xs text-muted-foreground">Preferred currency for amounts</p>
        </div>
      </div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg border border-border/50 bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
      >
        {CURRENCIES.map(c => (
          <option key={c.code} value={c.code}>{c.label}</option>
        ))}
      </select>
    </motion.div>
  );
}