export type ISODate = string;
export type ISODateTime = string;
export type CurrencyCode = string;
export type MinorUnitAmount = number;

export type AppearancePreference = "light" | "dark" | "system";
export type ResolvedAppearance = "light" | "dark";
export type ContentDensity = "comfortable" | "compact";

export type TransactionType = "income" | "expense";
export type TransactionDirection = "surplus" | "deficit";
export type SortKey = "date" | "amount";
export type SortDirection = "asc" | "desc";

export type ReportingPeriod =
  | { kind: "current-month" }
  | { kind: "previous-month" }
  | { kind: "custom"; start: string; end: string };

export interface ResolvedPeriod {
  kind: ReportingPeriod["kind"];
  start: ISODate;
  end: ISODate;
  label: string;
}

export interface Transaction {
  id: string;
  description: string;
  amountMinor: MinorUnitAmount;
  currency: CurrencyCode;
  type: TransactionType;
  categoryId: string;
  occurredOn: ISODateTime;
  createdAt: ISODateTime;
}

export interface Budget {
  id: string;
  userId: string;
  amountMinor: MinorUnitAmount;
  cadence: "monthly";
  effectiveFrom: ISODate;
  currency: CurrencyCode;
}

export type MetricValue =
  | {
      status: "available";
      minorValue: MinorUnitAmount;
      direction?: TransactionDirection;
    }
  | { status: "unavailable"; reason: string };

interface BudgetMetricBase {
  period: ResolvedPeriod;
  currency: CurrencyCode;
  spentMinor: MinorUnitAmount;
}

export type BudgetMetric =
  | { status: "not-configured"; period: ResolvedPeriod }
  | {
      status: "unavailable";
      period: ResolvedPeriod;
      currency: CurrencyCode;
      reason: string;
    }
  | (BudgetMetricBase & {
      status: "on-track" | "approaching";
      budgetMinor: MinorUnitAmount;
      remainingMinor: MinorUnitAmount;
      utilization: number;
    })
  | (BudgetMetricBase & {
      status: "exceeded";
      budgetMinor: MinorUnitAmount;
      excessMinor: MinorUnitAmount;
      utilization: number;
    });

export type ChartState = "ready" | "empty" | "error";
export type ChartUnit = "currency" | "percentage" | "count";

export interface ChartSeries {
  id: string;
  label: string;
  semanticToken: string;
  symbol: string;
}

export interface ChartRow {
  key: string;
  label: string;
  values: readonly number[];
  /** Locale-formatted values, kept alongside raw minor-unit values for tables and tooltips. */
  formattedValues: readonly string[];
  /** Optional proportional values for distribution charts. */
  percentages?: readonly number[];
  formattedPercentages?: readonly string[];
  /** Non-color category semantics for distribution chart slices. */
  semanticToken?: string;
  symbol?: string;
}

export interface ChartModel {
  state: ChartState;
  title: string;
  periodLabel: string;
  unit: ChartUnit;
  unitLabel: string;
  currency?: CurrencyCode;
  interpretation?: string;
  series: readonly ChartSeries[];
  rows: readonly ChartRow[];
  errorMessage?: string;
}

export type AiInsightKind = "warning" | "info" | "success" | "tip";

export interface AiFact {
  label: string;
  value: string;
  source: "recorded-data";
}

export interface AiInterpretation {
  id: string;
  title: string;
  kind: AiInsightKind;
  text: string;
  source: "ai-generated";
  confidence?: number;
  confidenceExplanation?: string;
}

export interface AiRecommendation {
  id: string;
  text: string;
  source: "ai-generated";
  relatedInterpretationId?: string;
  confidence?: number;
  confidenceExplanation?: string;
}

export interface AiProviderRetentionDisclosure {
  status: "owner-approved" | "unverified";
  statement: string;
}

export interface AiDataUseDisclosure {
  version: string;
  purpose: string;
  fields: readonly string[];
  providerRetention: AiProviderRetentionDisclosure;
}

export interface AiTrustMetadata {
  source: "ai-generated";
  period: ResolvedPeriod;
  generatedAt: ISODateTime;
  disclaimer: string;
  disclosure: AiDataUseDisclosure;
  stale: boolean;
}

export interface AiInsightSet extends AiTrustMetadata {
  facts: readonly AiFact[];
  interpretations: readonly AiInterpretation[];
  recommendations: readonly AiRecommendation[];
}

export interface AiConversationAnswer extends AiTrustMetadata {
  question: string;
  answer: string;
  facts: readonly AiFact[];
  confidence?: number;
  confidenceExplanation?: string;
}

export interface AiCategorySuggestion {
  categoryId: string;
  confidence?: number;
  explanation?: string;
  source: "ai-generated";
}

export interface TransactionQuery {
  period: ReportingPeriod;
  search: string;
  types: readonly TransactionType[];
  categories: readonly string[];
  sort: { key: SortKey; direction: SortDirection };
}

export interface DashboardMetrics {
  balance: MetricValue;
  income: MetricValue;
  spending: MetricValue;
  budget: BudgetMetric;
}

export type FieldErrors<TField extends string = string> = Partial<
  Record<TField, readonly string[]>
>;

export type ActionResult<
  TData,
  TField extends string = string,
> =
  | {
      status: "success";
      data: TData;
      message: string;
      retryable?: false;
    }
  | {
      status: "validation-error";
      data?: TData;
      fieldErrors: FieldErrors<TField>;
      message: string;
      retryable?: false;
    }
  | {
      status: "error";
      data?: TData;
      message: string;
      retryable: boolean;
    };
