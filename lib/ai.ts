import OpenAI from "openai";

import type {
  AiProviderPayload,
  CanAffordProviderPayload,
  GoalPlanProviderPayload,
  SafeToSpendProviderPayload,
} from "./domain/ai";
import type { AiInsightKind } from "./domain/types";

interface RawInsight {
  type?: string;
  title?: string;
  message?: string;
  action?: string;
  confidence?: number;
  confidenceExplanation?: string;
}

export interface AiCompletionRequest {
  model: string;
  messages: Array<{ role: "system" | "user"; content: string }>;
  temperature: number;
  maxTokens: number;
}

/** Small adapter so routine verification supplies a local provider double, never a live service. */
export interface AiCompletionProvider {
  complete(request: AiCompletionRequest, signal: AbortSignal): Promise<string | null>;
}

export interface AiProviderRetryPolicy {
  timeoutMs: number;
  maxAttempts: number;
  retryDelayMs: number;
}

/** A bounded AI-only retry budget; core financial requests never share this budget. */
export const AI_PROVIDER_RETRY_POLICY: Readonly<AiProviderRetryPolicy> = Object.freeze({
  timeoutMs: 5_000,
  maxAttempts: 2,
  retryDelayMs: 100,
});

export class AiProviderUnavailableError extends Error {
  constructor(
    readonly reason: "timeout" | "unavailable",
    options?: { cause?: unknown },
  ) {
    super("The AI provider is temporarily unavailable.", options);
    this.name = "AiProviderUnavailableError";
  }
}

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  // A placeholder keeps DTO/prompt normalization importable in environments where the provider is intentionally not configured; requests still fail at the provider boundary.
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || "provider-not-configured",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "Expense AI",
  },
  // The server action never executes in a browser. Vitest uses jsdom, so test mode must permit importing the provider client without making a request.
  dangerouslyAllowBrowser: process.env.NODE_ENV === "test",
});

const liveAiCompletionProvider: AiCompletionProvider = {
  async complete(request, signal) {
    const completion = await openai.chat.completions.create({
      model: request.model,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
    }, { signal });
    return completion.choices[0]?.message.content ?? null;
  },
};

let aiCompletionProvider: AiCompletionProvider = liveAiCompletionProvider;

/**
 * Test-only provider injection keeps ordinary verification deterministic and offline.
 * The production provider remains private to this module.
 */
export function setAiCompletionProviderForTesting(provider: AiCompletionProvider): () => void {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("AI provider overrides are only available in tests.");
  }

  const previous = aiCompletionProvider;
  aiCompletionProvider = provider;
  return () => {
    aiCompletionProvider = previous;
  };
}

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function isRetryableProviderFailure(error: unknown): boolean {
  if (error instanceof AiProviderUnavailableError || error instanceof TypeError) return true;

  const candidate = error as { status?: unknown; code?: unknown } | undefined;
  const status = typeof candidate?.status === "number" ? candidate.status : undefined;
  if (status !== undefined) return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;

  const code = typeof candidate?.code === "string" ? candidate.code : undefined;
  if (code && ["ECONNABORTED", "ECONNREFUSED", "ECONNRESET", "EAI_AGAIN", "ENETUNREACH", "ENOTFOUND", "ETIMEDOUT"].includes(code)) return true;

  return error instanceof Error && [
    "AbortError",
    "APIConnectionError",
    "APIConnectionTimeoutError",
    "InternalServerError",
    "RateLimitError",
    "ServiceUnavailableError",
  ].includes(error.name);
}

async function runProviderAttempt<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const request = Promise.resolve().then(() => operation(controller.signal));
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new AiProviderUnavailableError("timeout"));
    }, timeoutMs);
  });

  try {
    return await Promise.race([request, timeout]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

/** Retries only transient AI-provider failures; callers retain their own non-AI state. */
export async function executeAiProviderRequest<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  policy: Readonly<AiProviderRetryPolicy> = AI_PROVIDER_RETRY_POLICY,
): Promise<T> {
  for (let attempt = 1; attempt <= policy.maxAttempts; attempt += 1) {
    try {
      return await runProviderAttempt(operation, policy.timeoutMs);
    } catch (error) {
      if (!isRetryableProviderFailure(error)) throw error;
      if (attempt === policy.maxAttempts) {
        throw error instanceof AiProviderUnavailableError
          ? error
          : new AiProviderUnavailableError("unavailable", { cause: error });
      }
      if (policy.retryDelayMs > 0) await wait(policy.retryDelayMs);
    }
  }

  throw new AiProviderUnavailableError("unavailable");
}

async function requestAiCompletion(request: AiCompletionRequest): Promise<string> {
  return executeAiProviderRequest(async (signal) => {
    const response = await aiCompletionProvider.complete(request, signal);
    if (!response?.trim()) throw new AiProviderUnavailableError("unavailable");
    return response;
  });
}

export interface AIInsight {
  id: string;
  type: AiInsightKind;
  title: string;
  message: string;
  action?: string;
  confidence?: number;
  confidenceExplanation?: string;
  source: "ai-generated";
}

const CONFIDENCE_EXPLANATION =
  "Confidence is the model's estimate based on the disclosed recorded-data summary; it is not a guarantee.";

function asInsightKind(value: string | undefined): AiInsightKind {
  return value === "warning" || value === "success" || value === "tip" ? value : "info";
}

function asConfidence(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1
    ? value
    : undefined;
}

export function toAIInsight(raw: RawInsight, id: string): AIInsight {
  const confidence = asConfidence(raw.confidence);
  return {
    id,
    type: asInsightKind(raw.type),
    title: raw.title?.trim() || "AI insight",
    message: raw.message?.trim() || "Analysis complete.",
    action: raw.action?.trim() || undefined,
    ...(confidence === undefined ? {} : {
      confidence,
      confidenceExplanation: raw.confidenceExplanation?.trim() || CONFIDENCE_EXPLANATION,
    }),
    source: "ai-generated",
  };
}

function cleanJsonResponse(response: string): string {
  const trimmed = response.trim();
  if (trimmed.startsWith("```json")) return trimmed.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  if (trimmed.startsWith("```")) return trimmed.replace(/^```\s*/, "").replace(/\s*```$/, "");
  return trimmed;
}

/** Calls the provider with only the aggregate fields declared in AiDataUseDisclosure. */
export async function generateExpenseInsights(
  payload: AiProviderPayload,
): Promise<AIInsight[]> {
  // Without a configured provider key, skip the network round-trip entirely
  // and fall back to rule-based insights.
  if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
    return [];
  }

  const prompt = `Generate 3-4 concise informational spending interpretations and optional recommendations from this disclosed recorded-data summary. Do not present professional financial advice.
Return a JSON array with type, title, message, optional action, optional confidence (0 to 1), and optional confidenceExplanation.
Disclosed period-scoped data:\n${JSON.stringify(payload, null, 2)}\nReturn only valid JSON.`;
  const response = await requestAiCompletion({
    model: "openai/gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You generate clearly labeled informational spending analysis, not financial advice. Respond with valid JSON only.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    maxTokens: 1000,
  });

  const insights: unknown = JSON.parse(cleanJsonResponse(response));
  if (!Array.isArray(insights)) throw new Error("AI insights response must be an array");
  return insights.map((insight, index) => toAIInsight(
    typeof insight === "object" && insight !== null ? insight as RawInsight : {},
    `ai-${Date.now()}-${index}`,
  ));
}

export async function categorizeExpense(description: string): Promise<string> {
  const response = await requestAiCompletion({
    model: "openai/gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are an expense categorization AI. Categorize expenses into one of these categories: Food, Transportation, Entertainment, Shopping, Bills, Healthcare, Other. Respond with only the category name.",
      },
      { role: "user", content: `Categorize this expense: "${description}"` },
    ],
    temperature: 0.1,
    maxTokens: 20,
  });

  const validCategories = ["Food", "Transportation", "Entertainment", "Shopping", "Bills", "Healthcare", "Other"];
  return validCategories.includes(response.trim()) ? response.trim() : "Other";
}

/**
 * Generates a plain-language narration of an app-computed goal plan. The prompt
 * receives only the disclosed numeric summary; it can explain the required
 * monthly amount, the gap, and the selected levers, but never alter them.
 * Returns the narration text, or null when no provider key is configured.
 */
export async function generateGoalPlanNarration(
  payload: GoalPlanProviderPayload,
): Promise<string | null> {
  if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
    return null;
  }

  const prompt = `Given this disclosed savings-goal plan summary, write one short paragraph (maximum 4 sentences). Use the exact values provided. If the goal is already funded or on track, say so plainly. Otherwise explain the required monthly contribution, the gap versus the current monthly contribution, and list the selected levers (for example Reduce Food, Reduce Shopping, Cancel unused plans) with their amounts. If the levers do not fully cover the gap, note the remaining shortfall. Never present professional financial advice, never invent figures, and do not name merchants or transaction details.
Goal plan summary data:
${JSON.stringify(payload, null, 2)}
Return only the narration text.`;

  const text = await requestAiCompletion({
    model: "openai/gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You narrate an already-computed savings goal plan in plain language. You only describe the supplied numbers; you never compute or recommend investments, and you never alter the plan.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    maxTokens: 200,
  });

  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Answers a question from the same disclosed, period-scoped aggregate payload. */
export async function generateAIAnswer(
  question: string,
  payload: AiProviderPayload,
): Promise<string> {
  const prompt = `Answer this question using only the disclosed recorded-data summary for the selected reporting period. Be concise, identify uncertainty when relevant, and do not give professional financial advice.
Question: ${question}
Disclosed period-scoped data:\n${JSON.stringify(payload, null, 2)}\nReturn only answer text.`;
  return requestAiCompletion({
    model: "openai/gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You provide informational spending analysis from supplied data, not professional financial advice.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    maxTokens: 200,
  });
}

/**
 * Generates a plain-language explanation of an already-computed Safe-to-Spend
 * figure. The prompt receives only the disclosed, post-calculation summary; it
 * can describe the number and its context but never alter it. Returns the
 * explanation text matched by a "Safe to spend" disclosure flow, or null when
 * no provider key is configured.
 */
export async function generateSafeToSpendExplanation(
  payload: SafeToSpendProviderPayload,
): Promise<string | null> {
  if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
    return null;
  }

  if (payload.isDeficit) {
    return null;
  }

  const prompt = `Given this disclosed Safe-to-Spend summary, write one short paragraph (maximum 3 sentences) that explains the number in plain, encouraging, non-professional language. Never present financial advice. Explain it as a running cash guideline based on recorded balance less upcoming bills, goal contributions and an estimated allowance for remaining expenses. Do not invent figures; use the exact values provided.
Safety summary data:
${JSON.stringify(payload, null, 2)}
Return only the explanation text.`;

  const text = await requestAiCompletion({
    model: "openai/gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You explain a calculated financial figure in everyday language. Never compute or recommend; you only narrate what was passed in.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    maxTokens: 200,
  });

  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Generates a plain-language verdict on a single planned purchase from the
 * already-computed affordability breakdown. The prompt receives only the
 * disclosed, post-calculation summary; it can explain the numbers and give an
 * opinion but never alter them. Returns the verdict text, or null when no
 * provider key is configured.
 */
export async function generateCanAffordVerdict(
  payload: CanAffordProviderPayload,
): Promise<string | null> {
  if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
    return null;
  }

  const prompt = `Given this disclosed affordability summary for a planned purchase, write one short paragraph (maximum 3 sentences) that gives a plain-language verdict on the purchase. Use the exact values provided (price, safe to spend, after-purchase balance, months of goal savings displaced, emergency buffer status). If the after-purchase balance is negative, recommend reconsidering or delaying the purchase. If it is positive and the emergency buffer is on track, you may say the purchase fits, while noting the goal impact in months when present. Never use figures not provided, never present professional financial advice, and do not invent transaction detail.
Affordability summary data:
${JSON.stringify(payload, null, 2)}
Return only the verdict text.`;

  const text = await requestAiCompletion({
    model: "openai/gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You give a friendly, honest verdict on a purchase using only the supplied summary figures. You never compute or recommend investments, and you only narrate what was passed in.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    maxTokens: 200,
  });

  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
}
