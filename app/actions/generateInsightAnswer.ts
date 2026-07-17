'use server';

import { generateAIAnswer } from '@/lib/ai';
import { getAuthUser } from '@/lib/auth';
import {
  AI_DISCLOSURE_VERSION,
  AI_INFORMATIONAL_DISCLAIMER,
  buildPeriodScopedAiGenerationContext,
  getAiAnswerDisclosure,
} from '@/lib/domain/ai';
import { normalizeReportingPeriod } from '@/lib/domain/reporting-period';
import type {
  ActionResult,
  AiConversationAnswer,
  AiDataUseDisclosure,
  ReportingPeriod,
} from '@/lib/domain/types';
import { getDashboardData } from '@/lib/data/dashboard';
import { createActionBoundary, invalid, parsed, type ParseResult } from '@/lib/server/action-boundary';

const run = createActionBoundary({
  authenticate: getAuthUser,
  revalidate: () => undefined,
  reportError: (scope, error) => console.error(`${scope} action failed`, error),
});

export interface AnswerRequest {
  question: string;
  period?: ReportingPeriod;
  disclosureVersion?: string;
  previousAnswer?: AiConversationAnswer;
}

export type AnswerData =
  | { state: 'disclosure-required'; disclosure: AiDataUseDisclosure; question: string }
  | { state: 'ready'; answer: AiConversationAnswer };

type AnswerResult = ActionResult<AnswerData, 'question' | 'period' | 'disclosure'>;

function disclosureRequired(question: string): AnswerData {
  return { state: 'disclosure-required', disclosure: getAiAnswerDisclosure(), question };
}

function parseQuestion(
  input: AnswerRequest,
): ParseResult<AnswerRequest & { period: ReportingPeriod }, 'question' | 'period' | 'disclosure'> {
  const question = input.question?.trim();
  if (!question) {
    return invalid({ question: ['Enter a question before requesting an answer.'] }, 'Enter a question before requesting an answer.');
  }
  const normalized = normalizeReportingPeriod(input.period ?? { kind: 'current-month' });
  if (!normalized.valid) {
    return invalid({ period: ['Choose a valid reporting period before requesting an answer.'] }, 'Choose a valid reporting period before requesting an answer.');
  }
  if (input.disclosureVersion !== AI_DISCLOSURE_VERSION) {
    return invalid({ disclosure: ['Review the AI data-use disclosure before requesting an answer.'] }, 'Review the AI data-use disclosure before requesting an answer.');
  }
  return parsed({ ...input, question, period: normalized.input });
}

export async function generateInsightAnswerResult(input: AnswerRequest): Promise<AnswerResult> {
  return run({
    scope: 'ai',
    input,
    parse: parseQuestion,
    execute: async (actor, request): Promise<AnswerData> => {
      const normalized = normalizeReportingPeriod(request.period);
      if (!normalized.valid) throw new Error('Validated reporting period became invalid.');
      const dashboard = await getDashboardData(actor.userId, normalized.period);
      const context = buildPeriodScopedAiGenerationContext(dashboard.aiFactInputs);
      const answer = context
        ? await generateAIAnswer(request.question, context.providerPayload)
        : 'There are no available recorded transactions in the selected reporting period to analyze.';
      return {
        state: 'ready',
        answer: {
          source: 'ai-generated',
          question: request.question,
          answer,
          period: normalized.period,
          generatedAt: new Date().toISOString(),
          facts: context?.facts ?? [],
          disclaimer: AI_INFORMATIONAL_DISCLAIMER,
          disclosure: getAiAnswerDisclosure(),
          stale: false,
        },
      };
    },
    message: 'AI answer generated.',
    preserve: (request) => request.previousAnswer
      ? { state: 'ready', answer: { ...request.previousAnswer, stale: true } }
      : disclosureRequired(request.question),
  });
}

/** Compatibility adapter for the legacy dashboard island; it never bypasses disclosure. */
export async function generateInsightAnswer(question: string): Promise<string> {
  const result = await generateInsightAnswerResult({ question });
  return result.status === 'success' && result.data.state === 'ready'
    ? result.data.answer.answer
    : "I'm unable to provide a detailed answer at the moment. Please retry your question.";
}
