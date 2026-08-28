import { useState } from "react";
import { Alert, Button, Input } from "@/src/common/ui";
import { CATEGORY_DEFINITIONS } from "@/src/common/domain/categories";
import type { RecurringRequest } from "@/app/actions/createRecurringRecord";

export function RecurringForm({
  submitting,
  error,
  onSubmit,
  onCancel,
}: {
  submitting: boolean;
  error: string | null;
  onSubmit: (input: RecurringRequest) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("Food");
  const [frequency, setFrequency] = useState<string>("monthly");
  const [interval, setInterval] = useState(1);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      text: text.trim(),
      amount: parseFloat(amount),
      type,
      category,
      frequency: frequency as RecurringRequest["frequency"],
      interval,
      startDate,
      endDate: endDate || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-primary/20 bg-card p-4 space-y-4">
      <h2 className="font-semibold text-sm">New recurring transaction</h2>

      {error && <Alert title="Error" description={error} tone="danger" />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <Input value={text} onChange={e => setText(e.target.value)} required placeholder="e.g. Netflix subscription" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Amount</label>
          <Input type="number" step="0.01" min="0.01" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="9.99" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Type</label>
          <select value={type} onChange={e => setType(e.target.value as "income" | "expense")} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm">
            {CATEGORY_DEFINITIONS.map(def => (
              <option key={def.id} value={def.id}>{def.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Frequency</label>
          <select value={frequency} onChange={e => setFrequency(e.target.value)} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Every (interval)</label>
          <Input type="number" min="1" max="365" value={interval} onChange={e => setInterval(parseInt(e.target.value) || 1)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Start date</label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">End date (optional)</label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button intent="ghost" label="Cancel" onClick={onCancel} />
        <Button label="Create" type="submit" loading={submitting} />
      </div>
    </form>
  );
}
