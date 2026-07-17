"use client";

import { useRef, useState } from "react";
import { suggestCategoryResult } from "@/app/actions/suggestCategory";
import { Button, Alert, Dialog, Field, Select, StatusRegion } from "@/components/ui";
import { AI_DISCLOSURE_VERSION } from "@/lib/domain/ai";
import { CATEGORY_REGISTRY, EXPENSE_CATEGORY_IDS, type ExpenseCategoryId } from "@/lib/domain/categories";
import {
  type ExpenseCategorySource,
  type TransactionCommand,
  type TransactionCommandField,
  type TransactionCommandFieldErrors,
  type TransactionCommandInput,
  validateTransactionCommand,
} from "@/lib/domain/transaction-command";
import type { ActionResult, TransactionType } from "@/lib/domain/types";

type TransactionSubmissionResult = ActionResult<unknown, TransactionCommandField | "requestId">;

export interface TransactionSubmission {
  requestId: string;
  command: TransactionCommand;
}

export interface AddNewRecordProps {
  /** Persistence is deliberately supplied by task 8.2 rather than owned by this form. */
  submitTransaction?: (submission: TransactionSubmission) => Promise<TransactionSubmissionResult>;
  requestCategorySuggestion?: typeof suggestCategoryResult;
  /** Opens the dialog on mount, e.g. when a route signal like ?addTransaction=1 is present. */
  initialOpen?: boolean;
  /** Notified whenever the dialog opens or closes so callers can clear route signals. */
  onOpenChange?: (open: boolean) => void;
}

interface TransactionDraft {
  type: TransactionType;
  description: string;
  date: string;
  amount: string;
  category: string;
  categorySource: ExpenseCategorySource;
  categoryConfirmed: boolean;
}

interface SubmissionFailure {
  message: string;
  retryable: boolean;
}

const createEmptyDraft = (): TransactionDraft => ({
  type: "expense",
  description: "",
  date: "",
  amount: "",
  category: "",
  categorySource: "manual",
  categoryConfirmed: false,
});

const categoryOptions = EXPENSE_CATEGORY_IDS.map((id) => ({ value: id, label: CATEGORY_REGISTRY[id].label }));

function createRequestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `transaction-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function AddNewRecord({
  submitTransaction,
  requestCategorySuggestion = suggestCategoryResult,
  initialOpen = false,
  onOpenChange,
}: AddNewRecordProps) {
  const [open, setOpenState] = useState(initialOpen);
  const setOpen = (nextOpen: boolean) => {
    setOpenState(nextOpen);
    onOpenChange?.(nextOpen);
  };
  const [draft, setDraft] = useState<TransactionDraft>(createEmptyDraft);
  const [fieldErrors, setFieldErrors] = useState<TransactionCommandFieldErrors>({});
  const [pending, setPending] = useState(false);
  const [aiPending, setAiPending] = useState(false);
  const [submissionFailure, setSubmissionFailure] = useState<SubmissionFailure | null>(null);
  const [status, setStatus] = useState<{ message: string; politeness: "polite" | "assertive" } | null>(null);
  const requestIdRef = useRef<string | null>(null);
  const retrySubmissionRef = useRef<TransactionSubmission | null>(null);

  const focusField = (field: TransactionCommandField) => {
    requestAnimationFrame(() => document.getElementById(`transaction-${field}`)?.focus());
  };

  const updateDraft = (patch: Partial<TransactionDraft>) => {
    requestIdRef.current = null;
    retrySubmissionRef.current = null;
    setSubmissionFailure(null);
    setDraft((current) => ({ ...current, ...patch }));
  };

  const clearFieldError = (field: TransactionCommandField) => {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const changeType = (type: TransactionType) => {
    updateDraft({
      type,
      category: type === "income" ? "Income" : draft.category === "Income" ? "" : draft.category,
      categorySource: "manual",
      categoryConfirmed: false,
    });
    setFieldErrors((current) => ({ ...current, type: undefined, category: undefined }));
  };

  const changeCategory = (category: string) => {
    const replacesSuggestion = draft.categorySource === "ai-suggested" && category !== draft.category;
    updateDraft({
      category,
      categorySource: replacesSuggestion ? "ai-replaced" : "manual",
      categoryConfirmed: false,
    });
    clearFieldError("category");
  };

  const applyResult = (result: TransactionSubmissionResult) => {
    if (result.status === "success") {
      requestIdRef.current = null;
      retrySubmissionRef.current = null;
      setDraft(createEmptyDraft());
      setFieldErrors({});
      setSubmissionFailure(null);
      setStatus({ message: result.message, politeness: "polite" });
      setOpen(false);
      return;
    }

    if (result.status === "validation-error") {
      const errors = result.fieldErrors as TransactionCommandFieldErrors;
      setFieldErrors(errors);
      setSubmissionFailure(null);
      const firstInvalidField = (["type", "description", "date", "amount", "category"] as const)
        .find((field) => errors[field] !== undefined);
      if (firstInvalidField) focusField(firstInvalidField);
      setStatus({ message: result.message, politeness: "assertive" });
      return;
    }

    setSubmissionFailure({ message: result.message, retryable: result.retryable });
    setStatus({ message: result.message, politeness: "assertive" });
  };

  const submit = async (submission: TransactionSubmission) => {
    if (!submitTransaction || pending) return;
    setPending(true);
    setSubmissionFailure(null);
    setStatus({ message: "Adding transaction...", politeness: "polite" });
    try {
      applyResult(await submitTransaction(submission));
    } catch {
      const message = "Transaction could not be added. Retry the transaction.";
      setSubmissionFailure({ message, retryable: true });
      setStatus({ message, politeness: "assertive" });
    } finally {
      setPending(false);
    }
  };

  const validateAndSubmit = async () => {
    const input: TransactionCommandInput = {
      type: draft.type,
      description: draft.description,
      date: draft.date,
      amount: draft.amount,
      category: draft.category,
      categorySource: draft.categorySource,
      categoryConfirmed: draft.categoryConfirmed,
    };
    const validation = validateTransactionCommand(input);
    if (!validation.success) {
      setFieldErrors(validation.fieldErrors);
      setSubmissionFailure(null);
      focusField(validation.firstInvalidField);
      setStatus({ message: "Correct the highlighted transaction fields.", politeness: "assertive" });
      return;
    }

    setFieldErrors({});
    const submission = {
      requestId: requestIdRef.current ?? createRequestId(),
      command: validation.data,
    };
    requestIdRef.current = submission.requestId;
    retrySubmissionRef.current = submission;

    if (!submitTransaction) {
      setStatus({ message: "Transaction details are valid and ready to save.", politeness: "polite" });
      return;
    }
    await submit(submission);
  };

  const retry = async () => {
    if (retrySubmissionRef.current) await submit(retrySubmissionRef.current);
  };

  const requestSuggestion = async () => {
    if (aiPending || pending || draft.type !== "expense") return;

    setAiPending(true);
    setStatus({ message: "AI-generated category suggestion is being prepared.", politeness: "polite" });
    try {
      const result = await requestCategorySuggestion({
        description: draft.description,
        disclosureVersion: AI_DISCLOSURE_VERSION,
      });

      if (result.status === "success" && result.data.state === "ready") {
        const suggestedCategory = result.data.suggestion.categoryId;
        if (!EXPENSE_CATEGORY_IDS.includes(suggestedCategory as ExpenseCategoryId)) {
          setFieldErrors((current) => ({
            ...current,
            category: ["The AI suggestion is not a supported expense category. Choose a category manually."],
          }));
          focusField("category");
          setStatus({ message: "AI-generated category suggestion needs a manual category selection.", politeness: "assertive" });
          return;
        }

        requestIdRef.current = null;
        retrySubmissionRef.current = null;
        setSubmissionFailure(null);
        setDraft((current) => ({
          ...current,
          category: suggestedCategory,
          categorySource: "ai-suggested",
          categoryConfirmed: false,
        }));
        clearFieldError("category");
        setStatus({ message: "AI-generated category suggestion is ready for your confirmation or replacement.", politeness: "polite" });
        return;
      }

      if (result.status === "validation-error") {
        const descriptionError = result.fieldErrors?.description;
        if (descriptionError) setFieldErrors((current) => ({ ...current, description: descriptionError }));
        focusField("description");
      }
      setStatus({ message: result.message, politeness: "assertive" });
    } catch {
      setStatus({ message: "AI-generated category suggestion could not be requested. You can choose a category manually.", politeness: "assertive" });
    } finally {
      setAiPending(false);
    }
  };

  const categoryError = fieldErrors.category?.[0];

  return (
    <>
      <Dialog
        closeLabel="Close Add transaction"
        description="Enter one income or expense transaction. Required fields are marked with an asterisk."
        onOpenChange={setOpen}
        open={open}
        title="Add transaction"
        trigger={<Button label="Add transaction" />}
        className="sm:max-w-xl"
      >
        <form className="grid gap-5" noValidate onSubmit={(event) => { event.preventDefault(); void validateAndSubmit(); }}>
          <Select
            disabled={pending}
            error={fieldErrors.type?.[0]}
            id="transaction-type"
            label="Type"
            onChange={(event) => changeType(event.target.value as TransactionType)}
            options={[{ value: "expense", label: "Expense" }, { value: "income", label: "Income" }]}
            required
            value={draft.type}
          />
          <Field
            disabled={pending}
            error={fieldErrors.description?.[0]}
            id="transaction-description"
            label="Description"
            onChange={(event) => { updateDraft({ description: event.target.value }); clearFieldError("description"); }}
            required
            value={draft.description}
          />
          <div className="grid gap-2">
            <Button disabled={draft.type !== "expense" || pending} label="Get AI category suggestion" loading={aiPending} onClick={() => void requestSuggestion()} type="button" />
            <p className="text-interface-xs text-foreground-secondary">AI-generated suggestions use the transaction description you enter and always require confirmation or replacement.</p>
          </div>
          <Field
            disabled={pending}
            error={fieldErrors.date?.[0]}
            id="transaction-date"
            label="Date"
            onChange={(event) => { updateDraft({ date: event.target.value }); clearFieldError("date"); }}
            required
            type="date"
            value={draft.date}
          />
          <Field
            disabled={pending}
            error={fieldErrors.amount?.[0]}
            id="transaction-amount"
            label="Amount"
            min="0.01"
            onChange={(event) => { updateDraft({ amount: event.target.value }); clearFieldError("amount"); }}
            required
            step="0.01"
            type="number"
            value={draft.amount}
          />
          {draft.type === "expense" ? (
            <div className="grid gap-3">
              <Select
                disabled={pending}
                error={categoryError}
                id="transaction-category"
                label="Category"
                onChange={(event) => changeCategory(event.target.value)}
                options={categoryOptions}
                placeholder="Choose a category"
                required
                value={draft.category}
              />
              {draft.categorySource === "ai-suggested" ? (
                <Alert
                  actionRequired
                  description={<div className="grid gap-3"><p>Suggested category: <strong>{CATEGORY_REGISTRY[draft.category as ExpenseCategoryId]?.label ?? draft.category}</strong>.</p><label className="flex min-h-11 items-center gap-2"><input checked={draft.categoryConfirmed} disabled={pending} onChange={(event) => { updateDraft({ categoryConfirmed: event.target.checked }); clearFieldError("category"); }} type="checkbox" />Confirm this AI-generated category</label></div>}
                  title="AI-generated category suggestion"
                  tone="info"
                />
              ) : null}
            </div>
          ) : (
            <div aria-label="Category" className="grid gap-1 rounded-container border border-border bg-surface-subtle p-4">
              <p className="text-interface-sm font-medium text-foreground">Category</p>
              <p className="text-interface-sm text-foreground-secondary">Income is assigned automatically.</p>
            </div>
          )}
          {submissionFailure ? <Alert action={<Button disabled={!submissionFailure.retryable || pending} label="Retry transaction" loading={pending} onClick={() => void retry()} />} actionRequired description={submissionFailure.message} title="Transaction could not be added" tone="danger" /> : null}
          <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
            <Button disabled={pending} intent="secondary" label="Cancel" onClick={() => setOpen(false)} />
            <Button label="Add transaction" loading={pending} type="submit" />
          </div>
        </form>
      </Dialog>
      <StatusRegion message={status?.message} politeness={status?.politeness} visible={Boolean(status)} />
    </>
  );
}
