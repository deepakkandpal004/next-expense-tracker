'use server';

import { categorizeExpense } from '@/lib/ai';
import { getAuthUser } from '@/lib/auth';
import {
  AI_DISCLOSURE_VERSION,
  getAiCategoryDisclosure,
} from '@/lib/domain/ai';
import type {
  ActionResult,
  AiCategorySuggestion,
  AiDataUseDisclosure,
  FieldErrors,
} from '@/lib/domain/types';
import { createActionBoundary, invalid, parsed, type ParseResult } from '@/lib/server/action-boundary';

const run = createActionBoundary({
  authenticate: getAuthUser,
  revalidate: () => undefined,
  reportError: (scope, error) => console.error(`${scope} action failed`, error),
});

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
    execute: async (_actor, request): Promise<CategoryData> => {
      if (request.disclosureVersion !== AI_DISCLOSURE_VERSION) {
        return { state: 'disclosure-required', description: request.description, disclosure: getAiCategoryDisclosure() };
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
