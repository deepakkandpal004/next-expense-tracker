import { beforeEach, describe, expect, it, vi } from "vitest";
import { AUTHENTICATED_USERS } from "@/tests/fixtures";

/**
 * Characterization tests for the existing AI server action contracts
 * (category suggestion, proactive insights, conversational answers).
 *
 * These lock down current authentication authorization and AI-isolation
 * behavior (AI failures never block core financial actions such as record
 * retrieval) before route/component migration changes their composition.
 *
 * Validates: Requirements 5.12, 7.14, 17.10
 */

const { getAuthUser } = vi.hoisted(() => ({ getAuthUser: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getAuthUser }));

const { categorizeExpense, generateExpenseInsights, generateAIAnswer } = vi.hoisted(() => ({
  categorizeExpense: vi.fn(),
  generateExpenseInsights: vi.fn(),
  generateAIAnswer: vi.fn(),
}));
vi.mock("@/lib/ai", () => ({ categorizeExpense, generateExpenseInsights, generateAIAnswer }));

const { getDashboardData } = vi.hoisted(() => ({ getDashboardData: vi.fn() }));
vi.mock("@/lib/data/dashboard", () => ({ getDashboardData }));

import { suggestCategory, suggestCategoryResult } from "@/app/actions/suggestCategory";
import { getAIInsights, getAIInsightsResult } from "@/app/actions/getAIInsights";
import { generateInsightAnswer, generateInsightAnswerResult } from "@/app/actions/generateInsightAnswer";
import { AI_DISCLOSURE_VERSION, getAiCategoryDisclosure } from "@/lib/domain/ai";
import getAllRecords from "@/app/actions/getAllRecords";

const [userA] = AUTHENTICATED_USERS;

function signInAs(user: { id: string } | null) {
  getAuthUser.mockResolvedValue(user);
}

const emptyAiFactInputs = {
  status: "unavailable" as const,
  period: { kind: "current-month" as const, start: "2025-03-01", end: "2025-03-31", label: "March 2025" },
  currency: "INR",
  reason: "No recorded transactions in the selected period.",
};

beforeEach(() => {
  getAuthUser.mockReset();
  categorizeExpense.mockReset();
  generateExpenseInsights.mockReset();
  generateAIAnswer.mockReset();
  getDashboardData.mockReset();
  getDashboardData.mockResolvedValue({ aiFactInputs: emptyAiFactInputs });
});

describe("existing AI action authentication contract", () => {
  it("denies an unauthenticated category suggestion without calling the AI provider", async () => {
    signInAs(null);

    const result = await suggestCategoryResult({ description: "Coffee shop" });

    expect(result).toMatchObject({ status: "error", message: "Sign in to continue.", retryable: false });
    expect(categorizeExpense).not.toHaveBeenCalled();
  });

  it("denies unauthenticated AI insights and answer requests without calling the AI provider", async () => {
    signInAs(null);

    const insights = await getAIInsightsResult({ disclosureVersion: AI_DISCLOSURE_VERSION });
    const answer = await generateInsightAnswerResult({ question: "How much did I spend?", disclosureVersion: AI_DISCLOSURE_VERSION });

    expect(insights).toMatchObject({ status: "error", message: "Sign in to continue." });
    expect(answer).toMatchObject({ status: "error", message: "Sign in to continue." });
    expect(generateExpenseInsights).not.toHaveBeenCalled();
    expect(generateAIAnswer).not.toHaveBeenCalled();
  });
});

describe("existing AI data-use disclosure gating", () => {
  it("requires the current disclosure version before suggesting a category", async () => {
    signInAs({ id: userA.id });

    const withoutDisclosure = await suggestCategoryResult({ description: "Coffee shop" });
    expect(withoutDisclosure).toMatchObject({
      status: "success",
      data: { state: "disclosure-required" },
    });
    expect(categorizeExpense).not.toHaveBeenCalled();

    categorizeExpense.mockResolvedValue("Food");
    const withDisclosure = await suggestCategoryResult({
      description: "Coffee shop",
      disclosureVersion: AI_DISCLOSURE_VERSION,
    });
    expect(withDisclosure).toMatchObject({
      status: "success",
      data: { state: "ready", suggestion: { categoryId: "Food", source: "ai-generated" } },
    });
  });

  it("exposes the same disclosure purpose and version through the disclosure getter", () => {
    expect(getAiCategoryDisclosure()).toMatchObject({
      version: AI_DISCLOSURE_VERSION,
      purpose: "Suggest a transaction category from the description you provide.",
    });
  });
});

describe("existing AI provider failure isolation", () => {
  it("does not block record retrieval when the AI provider is unavailable", async () => {
    signInAs({ id: userA.id });
    categorizeExpense.mockRejectedValue(new Error("provider unavailable"));

    const category = await suggestCategory("Coffee shop");
    const records = await getAllRecords();

    expect(category).toBe("Other");
    expect(records.status).toBe("success");
  });

  it("falls back to a safe default answer when the AI provider fails, without surfacing the raw error", async () => {
    signInAs({ id: userA.id });
    getDashboardData.mockResolvedValue({
      aiFactInputs: {
        status: "available",
        period: emptyAiFactInputs.period,
        currency: "INR",
        transactionIds: ["record-1"],
        transactionCount: 1,
        incomeMinor: 0,
        spendingMinor: 500,
        balanceMinor: -500,
        categorySpending: [],
      },
    });
    generateAIAnswer.mockRejectedValue(new Error("provider unavailable"));

    const answer = await generateInsightAnswer("Where did I spend the most?");

    expect(answer).toBe("I'm unable to provide a detailed answer at the moment. Please retry your question.");
  });

  it("returns an empty insight list through the legacy adapter when generation fails", async () => {
    signInAs({ id: userA.id });
    generateExpenseInsights.mockRejectedValue(new Error("provider unavailable"));

    const insights = await getAIInsights();

    expect(insights).toEqual([]);
  });
});
