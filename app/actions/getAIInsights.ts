'use server';

import { generateExpenseInsights, type AIInsight } from '@/lib/ai';
import { getAuthUser } from '@/lib/auth';
import {
  AI_INFORMATIONAL_DISCLAIMER,
  AI_DISCLOSURE_VERSION,
  buildPeriodScopedAiGenerationContext,
  getAiInsightsDisclosure,
  markAiInsightSetStale,
} from '@/lib/domain/ai';
import { normalizeReportingPeriod } from '@/lib/domain/reporting-period';
import type {
  ActionResult,
  AiDataUseDisclosure,
  AiInsightSet,
  AiInterpretation,
  AiRecommendation,
  ReportingPeriod,
} from '@/lib/domain/types';
import { getDashboardData } from '@/lib/data/dashboard';
import { createActionBoundary, invalid, parsed, type ParseResult } from '@/lib/server/action-boundary';

const run = createActionBoundary({
  authenticate: getAuthUser,
  revalidate: () => undefined,
  reportError: (scope, error) => console.error(`${scope} action failed`, error),
});

export interface AiInsightsRequest {
  period?: ReportingPeriod;
  disclosureVersion?: string;
  previousInsightSet?: AiInsightSet;
}

export type AiInsightsData =
  | { state: 'disclosure-required'; disclosure: AiDataUseDisclosure }
  | { state: 'ready'; insightSet: AiInsightSet };

type InsightsResult = ActionResult<AiInsightsData, 'period' | 'disclosure'>;

function disclosureRequired(): AiInsightsData {
  return { state: 'disclosure-required', disclosure: getAiInsightsDisclosure() };
}

function parseRequest(
  input: AiInsightsRequest,
): ParseResult<Required<Pick<AiInsightsRequest, 'period'>> & AiInsightsRequest, 'period' | 'disclosure'> {
  const normalized = normalizeReportingPeriod(input.period ?? { kind: 'current-month' });
  if (!normalized.valid) {
    return invalid({ period: ['Choose a valid reporting period before requesting AI insights.'] }, 'Choose a valid reporting period before requesting AI insights.');
  }
  if (input.disclosureVersion !== AI_DISCLOSURE_VERSION) {
    return invalid({ disclosure: ['Review the AI data-use disclosure before requesting insights.'] }, 'Review the AI data-use disclosure before requesting insights.');
  }
  return parsed({ ...input, period: normalized.input });
}

function toInsightSet(
  period: AiInsightSet['period'],
  facts: AiInsightSet['facts'],
  generated: readonly AIInsight[],
): AiInsightSet {
  const interpretations: AiInterpretation[] = generated.map((insight) => ({
    id: insight.id,
    title: insight.title,
    kind: insight.type,
    text: insight.message,
    source: 'ai-generated',
    confidence: insight.confidence,
    confidenceExplanation: insight.confidenceExplanation,
  }));
  const recommendations: AiRecommendation[] = generated.flatMap((insight) => insight.action ? [{
    id: `${insight.id}-recommendation`,
    text: insight.action,
    source: 'ai-generated' as const,
    relatedInterpretationId: insight.id,
    confidence: insight.confidence,
    confidenceExplanation: insight.confidenceExplanation,
  }] : []);

  return {
    source: 'ai-generated',
    period,
    generatedAt: new Date().toISOString(),
    facts,
    interpretations,
    recommendations,
    disclaimer: AI_INFORMATIONAL_DISCLAIMER,
    disclosure: getAiInsightsDisclosure(),
    stale: false,
  };
}

export async function getAIInsightsResult(input: AiInsightsRequest = {}): Promise<InsightsResult> {
  return run({
    scope: 'ai',
    input,
    parse: parseRequest,
    execute: async (actor, request): Promise<AiInsightsData> => {
      const normalized = normalizeReportingPeriod(request.period);
      if (!normalized.valid) throw new Error('Validated reporting period became invalid.');
      const dashboard = await getDashboardData(actor.userId, normalized.period);
      const context = buildPeriodScopedAiGenerationContext(dashboard.aiFactInputs);
      const generated = context ? await generateExpenseInsights(context.providerPayload) : [];
      return {
        state: 'ready',
        insightSet: toInsightSet(
          normalized.period,
          context?.facts ?? [],
          generated,
        ),
      };
    },
    message: 'AI insights generated.',
    preserve: (request) => request.previousInsightSet
      ? { state: 'ready', insightSet: markAiInsightSetStale(request.previousInsightSet) }
      : disclosureRequired(),
  });
}

/** Compatibility adapter for the legacy dashboard island; it never bypasses disclosure. */
export async function getAIInsights(): Promise<AIInsight[]> {
  const result = await getAIInsightsResult();
  if (result.status !== 'success' || result.data.state !== 'ready') return [];
  const recommendations = new Map(
    result.data.insightSet.recommendations.map((recommendation) => [
      recommendation.relatedInterpretationId,
      recommendation,
    ]),
  );
  return result.data.insightSet.interpretations.map((interpretation) => ({
    id: interpretation.id,
    type: interpretation.kind,
    title: interpretation.title,
    message: interpretation.text,
    action: recommendations.get(interpretation.id)?.text,
    confidence: interpretation.confidence,
    confidenceExplanation: interpretation.confidenceExplanation,
    source: 'ai-generated',
  }));
}
