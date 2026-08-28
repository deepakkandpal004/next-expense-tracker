'use server';

import { getAuthUser } from '@/src/modules/auth';
import {
  AI_DISCLOSURE_VERSION,
  getAiCategoryDisclosure,
  buildCanAffordProviderPayload,
  buildSafeToSpendProviderPayload,
} from '@/src/common/domain/ai';
import type {
  ActionResult,
  AiCategorySuggestion,
  AiDataUseDisclosure,
  FieldErrors,
} from '@/src/common/domain/types';
import { createActionBoundary, invalid, parsed, type ParseResult } from '@/src/common/server/action-boundary';
import { rateLimitAiUser } from '@/src/common/rate-limit';
import { categorizeExpense } from '@/src/integrations/openai';
import { getCanAffordData } from '@/src/modules/dashboard/infrastructure/can-i-afford.repository';
import { getSafeToSpendData } from '@/src/modules/dashboard/infrastructure/safe-to-spend.repository';
import type { CanAffordBreakdown } from '@/src/common/domain/can-i-afford';
import type { SafeToSpendBreakdown } from '@/src/common/domain/safe-to-spend';
import { normalizeReportingPeriod } from '@/src/common/domain/reporting-period';
import type { ReportingPeriod } from '@/src/common/domain/types';
import { generateCanAffordVerdict, generateSafeToSpendExplanation } from '@/src/integrations/openai';
import { getCanAffordDisclosure, getSafeToSpendDisclosure } from '@/src/common/domain/ai';

const run = createActionBoundary({
  authenticate: getAuthUser,
  revalidate: () => undefined,
  reportError: (scope, error) => console.error(`${scope} action failed`, error),
});

// ── Category Suggestion ──────────────────────────────────────────────────────

export interface CategoryRequest {
  description: string;
  disclosureVersion?: string;
}

export type CategoryData =
  | { state: 'disclosure-required'; description: string; disclosure: AiDataUseDisclosure }
  | { state: 'ready'; description: string; suggestion: AiCategorySuggestion };

type CategoryResult = ActionResult<CategoryData, 'description' | 'disclosure'>;

function parseDescription(
  input: CategoryRequest,
): ParseResult<CategoryRequest & { description: string }, 'description' | 'disclosure'> {
  const description = input.description?.trim();
  if (!description || description.length < 2) {
    return invalid({ description: ['Enter at least two characters for an AI category suggestion.'] } satisfies FieldErrors<'description'>, 'Enter a longer description for an AI category suggestion.');
  }
  return parsed({ ...input, description });
}

export async function suggestCategoryResult(input: CategoryRequest): Promise<CategoryResult> {
  return run({
    scope: 'ai',
    input,
    parse: parseDescription,
    execute: async (actor, request): Promise<CategoryData> => {
        if (request.disclosureVersion !== AI_DISCLOSURE_VERSION) {
          return { state: 'disclosure-required', description: request.description, disclosure: getAiCategoryDisclosure() };
        }
        const limit = await rateLimitAiUser(actor.userId);
        if (!limit.allowed) {
          return {
            state: 'ready',
            description: request.description,
            suggestion: {
              categoryId: 'Other',
              explanation: 'AI category suggestion is temporarily rate-limited.',
              source: 'ai-generated',
            },
          };
        }
        return {
          state: 'ready',
          description: request.description,
          suggestion: {
            categoryId: await categorizeExpense(request.description),
            explanation: 'This category suggestion is AI-generated from the disclosed transaction description.',
            source: 'ai-generated',
          },
        };
      },
    message: (data) => data.state === 'disclosure-required' ? 'Review the AI data-use disclosure before requesting a category suggestion.' : 'AI category suggestion generated.',
    preserve: (request) => ({
      state: 'disclosure-required',
      description: request.description,
      disclosure: getAiCategoryDisclosure(),
    }),
  });
}

/** Compatibility adapter for the legacy transaction form; it never bypasses disclosure. */
export async function suggestCategory(description: string): Promise<string> {
  const result = await suggestCategoryResult({ description });
  return result.status === 'success' && result.data.state === 'ready'
    ? result.data.suggestion.categoryId
    : 'Other';
}

// ── Can I Afford ─────────────────────────────────────────────────────────────

export interface CanAffordActionResult {
  breakdown: CanAffordBreakdown;
}

export async function getCanAfford(
  priceMinor: number,
  period: ReportingPeriod,
): Promise<ActionResult<CanAffordActionResult, 'price' | 'period'>> {
  const user = await getAuthUser();
  if (!user) {
    return { status: 'error', message: 'Sign in to continue.', retryable: false };
  }

  if (!Number.isInteger(priceMinor) || priceMinor <= 0) {
    return {
      status: 'validation-error',
      fieldErrors: { price: ['Enter a purchase amount greater than 0.'] },
      message: 'Enter a purchase amount greater than 0.',
    };
  }

  const normalized = normalizeReportingPeriod(period);
  if (!normalized.valid) {
    return {
      status: 'validation-error',
      fieldErrors: { period: ['Choose a valid reporting period.'] },
      message: 'Choose a valid reporting period.',
    };
  }

  try {
    const breakdown = await getCanAffordData(user.id, normalized.period, priceMinor, user.currency);
    return {
      status: 'success',
      data: { breakdown },
      message: 'Affordability calculated.',
    };
  } catch (error) {
    console.error('Can I afford calculation failed', error);
    return {
      status: 'error',
      message: 'Could not calculate affordability.',
      retryable: true,
    };
  }
}

// ── Safe to Spend ────────────────────────────────────────────────────────────

export interface SafeToSpendActionResult {
  breakdown: SafeToSpendBreakdown;
}

export async function getSafeToSpend(
  period: ReportingPeriod,
): Promise<ActionResult<SafeToSpendActionResult, 'period'>> {
  const user = await getAuthUser();
  if (!user) {
    return { status: 'error', message: 'Sign in to continue.', retryable: false };
  }

  const normalized = normalizeReportingPeriod(period);
  if (!normalized.valid) {
    return {
      status: 'validation-error',
      fieldErrors: { period: ['Choose a valid reporting period.'] },
      message: 'Choose a valid reporting period.',
    };
  }

  try {
    const breakdown = await getSafeToSpendData(user.id, normalized.period, user.currency);
    return {
      status: 'success',
      data: { breakdown },
      message: 'Safe to spend calculated.',
    };
  } catch (error) {
    console.error('Safe to spend calculation failed', error);
    return {
      status: 'error',
      message: 'Could not calculate Safe to spend.',
      retryable: true,
    };
  }
}

// ── AI Verdict / Explanation ─────────────────────────────────────────────────

export interface CanAffordVerdictResult {
  verdict: string | null;
  purpose: string;
  fields: readonly string[];
}

export async function getCanAffordVerdict(
  breakdown: CanAffordBreakdown,
): Promise<ActionResult<CanAffordVerdictResult, never>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  const limit = await rateLimitAiUser(user.id);
  if (!limit.allowed) {
    return { status: 'error', message: 'Too many AI requests. Please try again later.', retryable: true };
  }

  const disclosure = getCanAffordDisclosure();

  try {
    const payload = buildCanAffordProviderPayload(breakdown);
    const text = await generateCanAffordVerdict(payload);
    if (!text) {
      return {
        status: 'success',
        data: { verdict: '', purpose: disclosure.purpose, fields: disclosure.fields },
        message: 'Affordability was calculated; AI narration is unavailable.',
      };
    }
    return {
      status: 'success',
      data: { verdict: text, purpose: disclosure.purpose, fields: disclosure.fields },
      message: 'Verdict generated.',
    };
  } catch (error) {
    console.error('Can I afford verdict failed', error);
    return { status: 'error', message: 'Could not generate a verdict.', retryable: true };
  }
}

export interface SafeToSpendExplanationResult {
  explanation: string | null;
  purpose: string;
  fields: readonly string[];
}

export async function getSafeToSpendExplanation(
  breakdown: SafeToSpendBreakdown,
): Promise<ActionResult<SafeToSpendExplanationResult, never>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  const limit = await rateLimitAiUser(user.id);
  if (!limit.allowed) {
    return { status: 'error', message: 'Too many AI requests. Please try again later.', retryable: true };
  }

  const disclosure = getSafeToSpendDisclosure();
  if (breakdown.isDeficit) {
    return {
      status: 'success',
      data: { explanation: '', purpose: disclosure.purpose, fields: disclosure.fields },
      message: 'No explanation available for a negative Safe to spend.',
    };
  }

  try {
    const payload = buildSafeToSpendProviderPayload(breakdown);
    const text = await generateSafeToSpendExplanation(payload);
    if (!text) {
      return {
        status: 'success',
        data: { explanation: '', purpose: disclosure.purpose, fields: disclosure.fields },
        message: 'Safe to spend was calculated; AI narration is unavailable.',
      };
    }
    return {
      status: 'success',
      data: { explanation: text, purpose: disclosure.purpose, fields: disclosure.fields },
      message: 'Explanation generated.',
    };
  } catch (error) {
    console.error('Safe to spend explanation failed', error);
    return { status: 'error', message: 'Could not generate an explanation.', retryable: true };
  }
}
