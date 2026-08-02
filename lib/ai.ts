import OpenAI from "openai";

import type { AiProviderPayload } from "./domain/ai";
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
