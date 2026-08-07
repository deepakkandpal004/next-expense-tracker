"use client";

import { useEffect, useRef, useState } from "react";
import { suggestCategoryResult } from "@/app/actions/suggestCategory";
import { Button, Dialog, Field, Select, StatusRegion, useToast } from "@/components/ui";
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
  submitTransaction?: (submission: TransactionSubmission) => Promise<TransactionSubmissionResult>;
  requestCategorySuggestion?: typeof suggestCategoryResult;
  initialOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultType?: TransactionType;
  hideTrigger?: boolean;
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
  open: controlledOpen,
  onOpenChange,
  defaultType,
  hideTrigger = false,
}: AddNewRecordProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (nextOpen: boolean) => {
    if (!isControlled) setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };
  const [draft, setDraft] = useState<TransactionDraft>(() => ({
    ...createEmptyDraft(),
    type: defaultType ?? "expense",
  }));
  const [fieldErrors, setFieldErrors] = useState<TransactionCommandFieldErrors>({});
  const [pending, setPending] = useState(false);
  const [aiPending, setAiPending] = useState(false);
  const [submissionFailure, setSubmissionFailure] = useState<SubmissionFailure | null>(null);
  const [status, setStatus] = useState<{ message: string; politeness: "polite" | "assertive" } | null>(null);
  const requestIdRef = useRef<string | null>(null);
  const retrySubmissionRef = useRef<TransactionSubmission | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && defaultType !== undefined) {
      setDraft({ ...createEmptyDraft(), type: defaultType, category: defaultType === "income" ? "Income" : "" });
      setFieldErrors({});
      setSubmissionFailure(null);
      requestIdRef.current = null;
      retrySubmissionRef.current = null;
      setStatus(null);
    }
  }, [open, defaultType]);

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
      setOpen(false);
      toast({ description: result.message, tone: "success" });
      return;
    }

    if (result.status === "validation-error") {
      const errors = result.fieldErrors as TransactionCommandFieldErrors;
      setFieldErrors(errors);
      setSubmissionFailure(null);
      const firstInvalidField = (["type", "description", "date", "amount", "category"] as const)
        .find((field) => errors[field] !== undefined);
      if (firstInvalidField) focusField(firstInvalidField);
      return;
    }

    setSubmissionFailure({ message: result.message, retryable: result.retryable });
  };

  const submit = async (submission: TransactionSubmission) => {
    if (!submitTransaction || pending) return;
    setPending(true);
    setSubmissionFailure(null);
    try {
      applyResult(await submitTransaction(submission));
    } catch {
      setSubmissionFailure({ message: "Transaction could not be added. Retry.", retryable: true });
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
      setOpen(false);
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
        return;
      }

      if (result.status === "validation-error") {
        const descriptionError = result.fieldErrors?.description;
        if (descriptionError) setFieldErrors((current) => ({ ...current, description: descriptionError }));
        focusField("description");
      }
    } catch {
      // AI suggestion failed silently
    } finally {
      setAiPending(false);
    }
  };

  const categoryError = fieldErrors.category?.[0];

  return (
    <>
      <Dialog
        closeLabel="Close"
        onOpenChange={setOpen}
        open={open}
        title="Add transaction"
        trigger={hideTrigger ? undefined : <Button label="Add transaction" />}
        className="sm:max-w-xl"
        hideTitle
      >
        <div className="grid gap-5">
          {/* Header */}
          <div>
            <h2 className="text-lg font-semibold text-foreground">Add transaction</h2>
            <p className="mt-1 text-sm text-foreground-secondary">Record an income or expense entry.</p>
          </div>

          {/* Type toggle */}
          <div className="flex rounded-xl bg-surface-subtle p-1">
            <button
              type="button"
              disabled={pending}
              onClick={() => changeType("expense")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                draft.type === "expense"
                  ? "bg-[#F04438]/10 text-[#F04438] shadow-sm"
                  : "text-foreground-secondary hover:text-foreground"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => changeType("income")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                draft.type === "income"
                  ? "bg-[#22C55E]/10 text-[#22C55E] shadow-sm"
                  : "text-foreground-secondary hover:text-foreground"
              }`}
            >
              Income
            </button>
          </div>

          {/* Form */}
          <form className="grid gap-4" noValidate onSubmit={(event) => { event.preventDefault(); void validateAndSubmit(); }}>
            <Field
              disabled={pending}
              error={fieldErrors.description?.[0]}
              id="transaction-description"
              label="Description"
              onChange={(event) => { updateDraft({ description: event.target.value }); clearFieldError("description"); }}
              required
              value={draft.description}
            />

            <div className="grid grid-cols-2 gap-3">
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
            </div>

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
                  <div className="rounded-xl border border-[#2F578A]/20 bg-[#2F578A]/[0.04] p-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2F578A]/10">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2F578A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {CATEGORY_REGISTRY[draft.category as ExpenseCategoryId]?.label ?? draft.category}
                        </p>
                        <p className="mt-0.5 text-xs text-foreground-secondary">Suggested by AI</p>
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          checked={draft.categoryConfirmed}
                          disabled={pending}
                          onChange={(event) => { updateDraft({ categoryConfirmed: event.target.checked }); clearFieldError("category"); }}
                          type="checkbox"
                          className="h-4 w-4 rounded border-border accent-[#36ADA3]"
                        />
                        <span className="text-xs text-foreground-secondary">Confirm</span>
                      </label>
                    </div>
                  </div>
                ) : null}
                <button
                  type="button"
                  disabled={pending || aiPending}
                  onClick={() => void requestSuggestion()}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm text-foreground-secondary transition-colors hover:border-[#36ADA3]/30 hover:bg-[#36ADA3]/[0.04] hover:text-[#36ADA3] disabled:opacity-50"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  {aiPending ? "Getting suggestion..." : "Suggest category with AI"}
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/[0.04] p-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#22C55E]/10">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Income category</p>
                    <p className="text-xs text-foreground-secondary">Automatically assigned</p>
                  </div>
                </div>
              </div>
            )}

            {submissionFailure ? (
              <div className="rounded-xl border border-[#F04438]/20 bg-[#F04438]/[0.04] p-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F04438]/10">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F04438" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Error</p>
                    <p className="mt-0.5 text-xs text-foreground-secondary">{submissionFailure.message}</p>
                  </div>
                  {submissionFailure.retryable ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => void retry()}
                      className="text-xs font-medium text-[#36ADA3] hover:underline"
                    >
                      Retry
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button disabled={pending} intent="secondary" label="Cancel" onClick={() => setOpen(false)} type="button" />
              <Button
                label={draft.type === "income" ? "Add income" : "Add expense"}
                loading={pending}
                type="submit"
              />
            </div>
          </form>
        </div>
      </Dialog>
      <StatusRegion message={status?.message} politeness={status?.politeness} visible={Boolean(status)} />
    </>
  );
}
