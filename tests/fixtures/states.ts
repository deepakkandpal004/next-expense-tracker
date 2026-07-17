import type {
  TestAiResponse,
  TestAppearance,
  TestBudget,
  TestDensity,
  TestFailure,
} from "./types";

export const BUDGETS = [
  {
    id: "budget-primary-2025-03",
    userId: "user-primary-0001",
    amount: 30000,
    cadence: "monthly",
    currency: "INR",
    effectiveFrom: "2025-03-01",
  },
] as const satisfies readonly TestBudget[];

export const AI_RESPONSE = {
  generatedAt: "2025-03-08T12:00:00.000Z",
  facts: [{ label: "Recorded spending", value: "₹2,450.75" }],
  recommendations: [
    {
      id: "recommendation-0001",
      text: "Review grocery spending against the monthly budget.",
      confidence: 0.8,
    },
  ],
} as const satisfies TestAiResponse;

export const FAILURES = {
  network: { code: "NETWORK_UNAVAILABLE", message: "Try again.", retryable: true },
  ai: { code: "AI_UNAVAILABLE", message: "AI is unavailable.", retryable: true },
  export: { code: "EXPORT_FAILED", message: "Export failed.", retryable: true },
  deletion: { code: "DELETE_FAILED", message: "Delete failed.", retryable: true },
} as const satisfies Record<string, TestFailure>;

export const LOCALES = ["en-IN", "en-US", "de-DE"] as const;
export const APPEARANCES = ["light", "dark", "system"] as const satisfies readonly TestAppearance[];
export const DENSITIES = ["comfortable", "compact"] as const satisfies readonly TestDensity[];
