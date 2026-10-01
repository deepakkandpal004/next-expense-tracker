import { useState } from "react";
import { Alert, Button, Field, Select } from "@/src/common/ui";
import { CATEGORY_DEFINITIONS } from "@/src/common/domain/categories";
import type { RecurringRequest } from "@/app/actions/createRecurringRecord";

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
] as const;

const CATEGORY_OPTIONS = CATEGORY_DEFINITIONS.map((definition) => ({
  value: definition.id,
  label: definition.label,
}));

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

  const handleTypeChange = (next: "income" | "expense") => {
    setType(next);
    setCategory(next === "income" ? "Income" : "Food");
  };

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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-foreground">New recurring transaction</h2>

      {error && <Alert title="Recurring transaction could not be created" description={error} tone="danger" />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          id="recurring-text"
          label="Description"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          placeholder="e.g. Netflix subscription"
        />
        <Field
          id="recurring-amount"
          label="Amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          placeholder="9.99"
        />
        <div className="grid gap-1.5">
          <span id="recurring-type-label" className="text-interface-sm font-medium text-foreground">
            Type
          </span>
          <div
            role="radiogroup"
            aria-labelledby="recurring-type-label"
            className="grid min-h-11 grid-cols-2 gap-1 rounded-xl border border-border bg-surface-subtle p-1"
          >
            {(["expense", "income"] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={type === option}
                onClick={() => handleTypeChange(option)}
                className={`rounded-lg px-3 py-2 text-interface-sm font-medium transition-colors ${
                  type === option
                    ? "bg-surface text-foreground shadow-flat"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option === "expense" ? "Expense" : "Income"}
              </button>
            ))}
          </div>
        </div>
        <Select
          id="recurring-category"
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={CATEGORY_OPTIONS}
        />
        <Select
          id="recurring-frequency"
          label="Frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          options={FREQUENCY_OPTIONS}
        />
        <Field
          id="recurring-interval"
          label="Repeat every"
          type="number"
          min="1"
          max="365"
          value={interval}
          onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
        />
        <Field
          id="recurring-start"
          label="Start date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <Field
          id="recurring-end"
          label="End date (optional)"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button intent="ghost" label="Cancel" onClick={onCancel} />
        <Button label="Create" type="submit" loading={submitting} />
      </div>
    </form>
  );
}
