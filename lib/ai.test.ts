import { afterEach, describe, expect, it, vi } from "vitest";

import {
  executeAiProviderRequest,
  generateAIAnswer,
  setAiCompletionProviderForTesting,
  toAIInsight,
  type AiCompletionProvider,
} from "./ai";
import type { AiProviderPayload } from "./domain/ai";

const providerPayload: AiProviderPayload = {
  period: { start: "2025-01-01", end: "2025-01-31", label: "January 2025" },
  currency: "INR",
  transactionCount: 2,
  incomeMinor: 100_00,
  spendingMinor: 25_00,
  balanceMinor: 75_00,
  categorySpending: [{ categoryId: "food", amountMinor: 25_00 }],
};

let restoreProvider: (() => void) | undefined;

afterEach(() => {
  restoreProvider?.();
  restoreProvider = undefined;
});

describe("AI provider response normalization", () => {
  it("labels generated output and preserves confidence only when supplied as a valid value", () => {
    expect(toAIInsight({
      type: "warning",
      title: "Higher spending",
      message: "Recorded spending increased.",
      action: "Review this category.",
      confidence: 0.72,
    }, "insight-1")).toEqual({
      id: "insight-1",
      type: "warning",
      title: "Higher spending",
      message: "Recorded spending increased.",
      action: "Review this category.",
      confidence: 0.72,
      confidenceExplanation: "Confidence is the model's estimate based on the disclosed recorded-data summary; it is not a guarantee.",
      source: "ai-generated",
    });
  });

  it("does not invent confidence when the provider does not return a valid value", () => {
    expect(toAIInsight({ type: "unknown", confidence: 4 }, "insight-2")).toMatchObject({
      id: "insight-2",
      type: "info",
      title: "AI insight",
      message: "Analysis complete.",
      source: "ai-generated",
    });
    expect(toAIInsight({ type: "unknown", confidence: 4 }, "insight-2")).not.toHaveProperty("confidence");
  });
});

describe("AI provider resilience", () => {
  it("uses a local provider double for routine AI verification", async () => {
    const provider: AiCompletionProvider = {
      complete: vi.fn().mockResolvedValue("Recorded spending was INR 25.00."),
    };
    restoreProvider = setAiCompletionProviderForTesting(provider);

    await expect(generateAIAnswer("What did I spend?", providerPayload))
      .resolves.toBe("Recorded spending was INR 25.00.");
    expect(provider.complete).toHaveBeenCalledOnce();
  });

  it("retries only a transient provider failure within the AI retry budget", async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new TypeError("network unavailable"))
      .mockResolvedValueOnce("recovered");

    await expect(executeAiProviderRequest(operation, {
      timeoutMs: 25,
      maxAttempts: 2,
      retryDelayMs: 0,
    })).resolves.toBe("recovered");
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("aborts timed-out attempts and returns a bounded provider failure after retries", async () => {
    const operation = vi.fn((signal: AbortSignal) => new Promise<never>((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    }));

    await expect(executeAiProviderRequest(operation, {
      timeoutMs: 10,
      maxAttempts: 2,
      retryDelayMs: 0,
    })).rejects.toMatchObject({
      name: "AiProviderUnavailableError",
      reason: "timeout",
    });
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("does not retry a non-transient provider response failure", async () => {
    const invalidRequest = Object.assign(new Error("invalid provider request"), { status: 400 });
    const operation = vi.fn().mockRejectedValue(invalidRequest);

    await expect(executeAiProviderRequest(operation, {
      timeoutMs: 25,
      maxAttempts: 2,
      retryDelayMs: 0,
    })).rejects.toBe(invalidRequest);
    expect(operation).toHaveBeenCalledOnce();
  });
});
