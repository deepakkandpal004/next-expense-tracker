import { getCategoryDefinition } from "./categories";
import type { DashboardAiFactInputs } from "./dashboard";
import type {
  AiDataUseDisclosure,
  AiFact,
  AiInsightSet,
  AiProviderRetentionDisclosure,
  ResolvedPeriod,
} from "./types";

export const AI_DISCLOSURE_VERSION = "2025-02-01";
export const AI_INFORMATIONAL_DISCLAIMER =
  "AI-generated interpretations and recommendations are informational only and are not professional financial advice.";

export const AI_PROVIDER_RETENTION: AiProviderRetentionDisclosure = {
  status: "unverified",
  statement: "Provider retention behavior has not been verified by the product owner.",
};

const INSIGHT_FIELDS = [
  "reporting period dates and label",
  "currency",
  "recorded transaction count",
  "recorded income, spending, and balance totals",
  "recorded spending totals by category",
] as const;

export interface AiProviderPayload {
  period: Pick<ResolvedPeriod, "start" | "end" | "label">;
  currency: string;
  transactionCount: number;
  incomeMinor: number;
  spendingMinor: number;
  balanceMinor: number;
  categorySpending: readonly { categoryId: string; amountMinor: number }[];
}

export interface AiGenerationContext {
  period: ResolvedPeriod;
  facts: readonly AiFact[];
  providerPayload: AiProviderPayload;
}

export function createAiDataUseDisclosure(
  purpose: string,
  options: { includeQuestion?: boolean; fields?: readonly string[] } = {},
): AiDataUseDisclosure {
  const fields = options.fields ?? INSIGHT_FIELDS;
  return {
    version: AI_DISCLOSURE_VERSION,
    purpose,
    fields: options.includeQuestion ? [...fields, "submitted question"] : [...fields],
    providerRetention: AI_PROVIDER_RETENTION,
  };
}

const CATEGORY_PURPOSE = "Suggest a transaction category from the description you provide.";
const CATEGORY_FIELDS = ["transaction description"] as const;
const INSIGHTS_PURPOSE = "Generate informational spending interpretations and recommendations from the selected reporting period.";
const ANSWER_PURPOSE = "Answer the submitted question with informational spending analysis from the selected reporting period.";

/**
 * These disclosure getters live outside the `'use server'` action modules so
 * server/client route composition (which only needs the disclosure content,
 * not a server action) can import them without every export of the action
 * module being required to be an async server action.
 */
export function getAiCategoryDisclosure(): AiDataUseDisclosure {
  return createAiDataUseDisclosure(CATEGORY_PURPOSE, { fields: CATEGORY_FIELDS });
}

export function getAiInsightsDisclosure(): AiDataUseDisclosure {
  return createAiDataUseDisclosure(INSIGHTS_PURPOSE);
}

export function getAiAnswerDisclosure(): AiDataUseDisclosure {
  return createAiDataUseDisclosure(ANSWER_PURPOSE, { includeQuestion: true });
}

function formatMinorAmount(amountMinor: number, currency: string): string {
  return `${currency} ${(amountMinor / 100).toFixed(2)}`;
}

/**
 * Converts the already-authorized dashboard aggregate into the complete payload
 * permitted by the data-use disclosure. Raw descriptions, IDs, and timestamps
 * are intentionally excluded.
 */
export function buildPeriodScopedAiGenerationContext(
  input: DashboardAiFactInputs,
): AiGenerationContext | null {
  if (input.status === "unavailable") return null;

  const facts: AiFact[] = [
    { label: "Recorded transactions", value: String(input.transactionCount), source: "recorded-data" },
    { label: "Recorded income", value: formatMinorAmount(input.incomeMinor, input.currency), source: "recorded-data" },
    { label: "Recorded spending", value: formatMinorAmount(input.spendingMinor, input.currency), source: "recorded-data" },
    { label: "Recorded balance", value: formatMinorAmount(input.balanceMinor, input.currency), source: "recorded-data" },
    ...input.categorySpending.map(({ categoryId, amountMinor }) => ({
      label: `Recorded spending: ${getCategoryDefinition(categoryId).label}`,
      value: formatMinorAmount(amountMinor, input.currency),
      source: "recorded-data" as const,
    })),
  ];

  return {
    period: input.period,
    facts,
    providerPayload: {
      period: { start: input.period.start, end: input.period.end, label: input.period.label },
      currency: input.currency,
      transactionCount: input.transactionCount,
      incomeMinor: input.incomeMinor,
      spendingMinor: input.spendingMinor,
      balanceMinor: input.balanceMinor,
      categorySpending: input.categorySpending.map(({ categoryId, amountMinor }) => ({
        categoryId,
        amountMinor,
      })),
    },
  };
}

/** Returns a new retained result for a failed refresh without mutating the last success. */
export function markAiInsightSetStale(insightSet: AiInsightSet): AiInsightSet {
  return { ...insightSet, stale: true };
}
