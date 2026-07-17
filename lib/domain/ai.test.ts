import { describe, expect, it } from "vitest";

import {
  AI_DISCLOSURE_VERSION,
  AI_INFORMATIONAL_DISCLAIMER,
  buildPeriodScopedAiGenerationContext,
  createAiDataUseDisclosure,
  markAiInsightSetStale,
} from "./ai";
import type { DashboardAiFactInputs } from "./dashboard";
import type { AiInsightSet, ResolvedPeriod } from "./types";

const period: ResolvedPeriod = {
  kind: "custom",
  start: "2025-03-01",
  end: "2025-03-31",
  label: "Mar 1, 2025 – Mar 31, 2025",
};

const factInputs: DashboardAiFactInputs = {
  status: "available",
  period,
  currency: "INR",
  transactionIds: ["private-record-id"],
  transactionCount: 2,
  incomeMinor: 50_000,
  spendingMinor: 12_500,
  balanceMinor: 37_500,
  categorySpending: [{ categoryId: "Food", amountMinor: 12_500 }],
};

describe("AI trust contracts", () => {
  it("declares the purpose, exactly disclosed fields, and unverified retention before generation", () => {
    const disclosure = createAiDataUseDisclosure("Answer a question", { includeQuestion: true });

    expect(disclosure).toMatchObject({
      version: AI_DISCLOSURE_VERSION,
      purpose: "Answer a question",
      providerRetention: {
        status: "unverified",
        statement: expect.stringContaining("has not been verified"),
      },
    });
    expect(disclosure.fields).toEqual([
      "reporting period dates and label",
      "currency",
      "recorded transaction count",
      "recorded income, spending, and balance totals",
      "recorded spending totals by category",
      "submitted question",
    ]);
  });

  it("maps only disclosed aggregate fields from the active reporting period into provider input", () => {
    const context = buildPeriodScopedAiGenerationContext(factInputs);

    expect(context).toMatchObject({
      period,
      providerPayload: {
        period: { start: "2025-03-01", end: "2025-03-31", label: period.label },
        currency: "INR",
        transactionCount: 2,
        incomeMinor: 50_000,
        spendingMinor: 12_500,
        balanceMinor: 37_500,
        categorySpending: [{ categoryId: "Food", amountMinor: 12_500 }],
      },
    });
    expect(context?.facts).toEqual(expect.arrayContaining([
      { label: "Recorded transactions", value: "2", source: "recorded-data" },
      { label: "Recorded income", value: "INR 500.00", source: "recorded-data" },
      { label: "Recorded spending: Food & dining", value: "INR 125.00", source: "recorded-data" },
    ]));
    expect(JSON.stringify(context?.providerPayload)).not.toContain("private-record-id");
    expect(JSON.stringify(context?.providerPayload)).not.toContain("transactionIds");
  });

  it("does not create provider input when the selected-period records are unavailable", () => {
    expect(buildPeriodScopedAiGenerationContext({
      status: "unavailable",
      period,
      currency: "INR",
      reason: "Records unavailable",
    })).toBeNull();
  });

  it("retains the last successful insight set as explicitly stale without mutating it", () => {
    const insightSet: AiInsightSet = {
      source: "ai-generated",
      period,
      generatedAt: "2025-03-31T12:00:00.000Z",
      facts: [],
      interpretations: [],
      recommendations: [],
      disclaimer: AI_INFORMATIONAL_DISCLAIMER,
      disclosure: createAiDataUseDisclosure("Generate insights"),
      stale: false,
    };

    const stale = markAiInsightSetStale(insightSet);
    expect(stale).toEqual({ ...insightSet, stale: true });
    expect(insightSet.stale).toBe(false);
  });
});
