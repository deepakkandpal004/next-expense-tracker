"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  Repeat,
  Plus,
  Pause,
  Play,
  Trash2,
  Calendar,
  Clock,
  Tag,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { createRecurringRecord, type RecurringRequest } from "@/app/actions/createRecurringRecord";
import { deleteRecurringRecord } from "@/app/actions/deleteRecurringRecord";
import { toggleRecurringRecord } from "@/app/actions/toggleRecurringRecord";
import { getRecurringRecords, type RecurringRecordDTO } from "@/app/actions/getRecurringRecords";
import { processRecurringRecords } from "@/app/actions/processRecurringRecords";
import { Button, Alert, Card, CardContent, Input, useToast } from "@/components/ui";
import { EmptyState } from "@/components/ui/empty-state";
import { CATEGORY_DEFINITIONS } from "@/lib/domain/categories";
import { formatCurrency } from "@/lib/formatters/locale";
import { listContainerVariants, listItemVariants } from "@/lib/ui/motion";

const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

export function RecurringView({ currency = "INR" }: { currency?: string }) {
  const { toast } = useToast();
  const [records, setRecords] = useState<RecurringRecordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("Food");
  const [frequency, setFrequency] = useState<string>("monthly");
  const [interval, setInterval] = useState(1);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    const result = await getRecurringRecords();
    if (result.status === "success") {
      setRecords(result.data.records);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const input: RecurringRequest = {
      text: text.trim(),
      amount: parseFloat(amount),
      type,
      category,
      frequency: frequency as RecurringRequest["frequency"],
      interval,
      startDate,
      endDate: endDate || null,
    };

    const result = await createRecurringRecord(input);
    if (result.status === "success") {
      setShowForm(false);
      resetForm();
      loadRecords();
      toast({ description: result.message, tone: "success" });
    } else {
      setError(result.message);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteRecurringRecord(id);
    loadRecords();
    toast({ description: result.message, tone: result.status === "success" ? "success" : "error" });
  };

  const handleToggle = async (id: string, active: boolean) => {
    const result = await toggleRecurringRecord(id, active);
    loadRecords();
    toast({ description: result.message, tone: result.status === "success" ? "success" : "error" });
  };

  const handleProcessNow = async () => {
    setProcessing(true);
    const result = await processRecurringRecords();
    if (result.status === "success") {
      if (result.data.created > 0) {
        loadRecords();
      }
      toast({ description: result.message, tone: "success" });
    } else {
      toast({ description: result.message, tone: "error" });
    }
    setProcessing(false);
  };

  const resetForm = () => {
    setText("");
    setAmount("");
    setType("expense");
    setCategory("Food");
    setFrequency("monthly");
    setInterval(1);
    setStartDate(new Date().toISOString().slice(0, 10));
    setEndDate("");
  };

  const getCategoryLabel = (id: string) => {
    const def = CATEGORY_DEFINITIONS.find(d => d.id === id);
    return def?.label || id;
  };

  const getAmountColor = (t: string) =>
    t === "income" ? "text-[#22C55E]" : "text-[#F04438]";

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recurring Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Automate your regular income and expenses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button icon={<RefreshCw className={`size-4 ${processing ? "animate-spin" : ""}`} />} intent="secondary" label="Process now" loading={processing} onClick={handleProcessNow} disabled={processing} />
          <Button icon={<Plus className="size-4" />} label="Add recurring" onClick={() => setShowForm(true)} />
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <form onSubmit={handleCreate} className="rounded-xl border border-primary/20 bg-card p-4 space-y-4">
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
                <Button intent="ghost" label="Cancel" onClick={() => { setShowForm(false); resetForm(); }} />
                <Button label="Create" type="submit" loading={submitting} />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-card/50" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={<Repeat className="size-6" />}
          title="No recurring transactions"
          description="Set up recurring income or expenses like salary, rent, or subscriptions."
          actionLabel="Add recurring"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <motion.div variants={listContainerVariants} initial="hidden" animate="visible" className="space-y-3">
          {records.map(record => {
            const nextDue = record.nextDue
              ? new Date(record.nextDue).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "Ended";

            return (
              <motion.div key={record.id} variants={listItemVariants}>
                <Card>
                  <CardContent className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${record.active ? "bg-primary/10" : "bg-muted"}`}>
                        <Repeat className={`size-4 ${record.active ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{record.text}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${record.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {record.active ? "Active" : "Paused"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" /> Every {record.interval} {FREQUENCY_LABELS[record.frequency]?.toLowerCase() || record.frequency}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" /> Next: {nextDue}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="size-3" /> {getCategoryLabel(record.category)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-sm font-semibold ${getAmountColor(record.type)}`}>
                        {formatCurrency({ minorValue: Math.round(record.amount * 100), currency })}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggle(record.id, !record.active)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={record.active ? "Pause" : "Activate"}
                      >
                        {record.active ? <Pause className="size-4" /> : <Play className="size-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(record.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
