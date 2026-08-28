/**
 * @deprecated Use `@/src/modules/ai` instead.
 */
export {
  generateExpenseInsights,
  categorizeExpense,
  generateGoalPlanNarration,
  generateSafeToSpendExplanation,
  generateCanAffordVerdict,
  toAIInsight,
  executeAiProviderRequest,
  setAiCompletionProviderForTesting,
  AiProviderUnavailableError,
  AI_PROVIDER_RETRY_POLICY,
  type AiCompletionRequest,
  type AiCompletionProvider,
  type AiProviderRetryPolicy,
  type AIInsight,
} from "@/src/modules/ai/infrastructure/ai.repository";
