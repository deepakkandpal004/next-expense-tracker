import { describe, it, expect } from "vitest";
import {
  AI_DISCLOSURE_VERSION,
  AI_INFORMATIONAL_DISCLAIMER,
  createAiDataUseDisclosure,
  getAiCategoryDisclosure,
  getAiInsightsDisclosure,
  getAiAnswerDisclosure,
  buildPeriodScopedAiGenerationContext,
  markAiInsightSetStale,
} from "@/lib/domain/ai";
import type { DashboardAiFactInputs } from "@/lib/domain/dashboard";

describe("AI disclosure", () => {
  it("has a valid version string", () => {
    expect(AI_DISCLOSURE_VERSION).toBe("2025-02-01");
  });

  it("has a disclaimer", () => {
    expect(AI_INFORMATIONAL_DISCLAIMER).toContain("informational");
  });

  it("creates a disclosure with correct purpose", () => {
    const disclosure = createAiDataUseDisclosure("Test purpose");
    expect(disclosure.purpose).toBe("Test purpose");
    expect(disclosure.version).toBe(AI_DISCLOSURE_VERSION);
  });

  it("includes question field when requested", () => {
    const disclosure = createAiDataUseDisclosure("Test", { includeQuestion: true });
    expect(disclosure.fields).toContain("submitted question");
  });
});

describe("getAiCategoryDisclosure", () => {
  it("returns a valid disclosure", () => {
    const disclosure = getAiCategoryDisclosure();
    expect(disclosure.version).toBe(AI_DISCLOSURE_VERSION);
    expect(disclosure.fields).toContain("transaction description");
  });
});

describe("getAiInsightsDisclosure", () => {
  it("returns a valid disclosure", () => {
    const disclosure = getAiInsightsDisclosure();
    expect(disclosure.version).toBe(AI_DISCLOSURE_VERSION);
    expect(disclosure.fields).toContain("recorded transaction count");
  });
});

describe("getAiAnswerDisclosure", () => {
  it("returns a disclosure with question field", () => {
    const disclosure = getAiAnswerDisclosure();
    expect(disclosure.fields).toContain("submitted question");
  });
});

describe("buildPeriodScopedAiGenerationContext", () => {
  it("returns null for unavailable inputs", () => {
    const input: DashboardAiFactInputs = { status: "unavailable", period: { kind: "current-month", start: "2026-07-01", end: "2026-07-31", label: "July" }, currency: "INR", reason: "No data" };
    expect(buildPeriodScopedAiGenerationContext(input)).toBeNull();
  });

  it("builds context for available inputs", () => {
    const input: DashboardAiFactInputs = {
      status: "available",
      period: { kind: "current-month", start: "2026-07-01", end: "2026-07-31", label: "July" },
      currency: "INR",
      transactionIds: ["1", "2"],
      transactionCount: 2,
      incomeMinor: 50000,
      spendingMinor: 30000,
      balanceMinor: 20000,
      categorySpending: [{ categoryId: "Food", amountMinor: 10000 }],
    };
    const context = buildPeriodScopedAiGenerationContext(input);
    expect(context).not.toBeNull();
    expect(context!.facts.length).toBeGreaterThanOrEqual(4);
    expect(context!.providerPayload.transactionCount).toBe(2);
  });
});

describe("markAiInsightSetStale", () => {
  it("marks an insight set as stale", () => {
    const insightSet = {
      source: "ai-generated" as const,
      period: { kind: "current-month" as const, start: "2026-07-01", end: "2026-07-31", label: "July" },
      generatedAt: "2026-07-15T00:00:00.000Z",
      disclaimer: AI_INFORMATIONAL_DISCLAIMER,
      disclosure: getAiInsightsDisclosure(),
      stale: false,
      facts: [],
      interpretations: [],
      recommendations: [],
    };
    const stale = markAiInsightSetStale(insightSet);
    expect(stale.stale).toBe(true);
  });
});
