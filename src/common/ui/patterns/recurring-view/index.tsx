"use client";

import { motion, AnimatePresence } from "motion/react";
import { Plus, RefreshCw, Repeat } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { createRecurringRecord, type RecurringRequest } from "@/app/actions/createRecurringRecord";
import { deleteRecurringRecord } from "@/app/actions/deleteRecurringRecord";
import { toggleRecurringRecord } from "@/app/actions/toggleRecurringRecord";
import { getRecurringRecords, type RecurringRecordDTO } from "@/app/actions/getRecurringRecords";
import { processRecurringRecords } from "@/app/actions/processRecurringRecords";
import { Button, useToast } from "@/src/common/ui";
import { EmptyState } from "@/src/common/ui/empty-state";
import { listContainerVariants, listItemVariants } from "@/src/common/ui/motion";
import { RecurringForm } from "./recurring-form";
import { RecurringRecordCard } from "./recurring-record-card";

export function RecurringView({ currency = "INR" }: { currency?: string }) {
  const { toast } = useToast();
  const [records, setRecords] = useState<RecurringRecordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleCreate = async (input: RecurringRequest) => {
    setSubmitting(true);
    setError(null);

    const result = await createRecurringRecord(input);
    if (result.status === "success") {
      setShowForm(false);
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
            <RecurringForm
              submitting={submitting}
              error={error}
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
            />
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
          {records.map(record => (
            <motion.div key={record.id} variants={listItemVariants}>
              <RecurringRecordCard
                record={record}
                currency={currency}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
