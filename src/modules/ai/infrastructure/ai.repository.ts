/**
 * AI infrastructure — was lib/ai.ts + lib/domain/ai.ts provider calls.
 * Other modules call via this, never import openai directly.
 */
export {
  generateExpenseInsights,
  categorizeExpense,
  generateGoalPlanNarration,
  generateSafeToSpendExplanation,
  generateCanAffordVerdict,
} from "@/lib/ai";
