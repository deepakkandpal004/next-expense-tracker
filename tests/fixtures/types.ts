export type TestAppearance = "light" | "dark" | "system";
export type TestDensity = "comfortable" | "compact";

export interface TestUser {
  id: string;
  email: string;
  name: string;
}

export interface TestRecord {
  id: string;
  userId: string;
  text: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  createdAt: string;
}

export interface TestBudget {
  id: string;
  userId: string;
  amount: number;
  cadence: "monthly";
  currency: "INR";
  effectiveFrom: string;
}

export interface TestAiResponse {
  generatedAt: string;
  facts: ReadonlyArray<{ label: string; value: string }>;
  recommendations: ReadonlyArray<{ id: string; text: string; confidence: number }>;
}

export interface TestFailure {
  code: string;
  message: string;
  retryable: boolean;
}

export interface TestScenario {
  now: string;
  users: TestUser[];
  records: TestRecord[];
  budgets: TestBudget[];
  ai: TestAiResponse;
  failures: Record<string, TestFailure>;
  locales: string[];
  appearances: TestAppearance[];
  densities: TestDensity[];
}
