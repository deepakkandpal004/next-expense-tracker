import { describe, expect, it, vi } from "vitest";

import { generateAIAnswer } from "./ai";
import type { AiProviderPayload } from "./domain/ai";

const enabled = process.env.RUN_LIVE_AI_PROVIDER_CONTRACT === "true"
  && process.env.AI_PROVIDER_CONTRACT_APPROVED === "true"
  && Boolean(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY);
const liveDescribe = enabled ? describe : describe.skip;

const payload: AiProviderPayload = {
  period: { start: "2025-01-01", end: "2025-01-31", label: "January 2025" },
  currency: "INR",
  transactionCount: 1,
  incomeMinor: 100_00,
  spendingMinor: 25_00,
  balanceMinor: 75_00,
  categorySpending: [{ categoryId: "food", amountMinor: 25_00 }],
};

liveDescribe("approved live AI provider contract", () => {
  it("returns a non-empty answer for a disclosed aggregate payload", async () => {
    vi.unstubAllGlobals();
    const answer = await generateAIAnswer("What was the recorded spending?", payload);
    expect(answer.trim()).not.toBe("");
  }, 15_000);
});
