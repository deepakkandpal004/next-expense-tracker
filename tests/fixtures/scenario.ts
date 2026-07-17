import { RECORDS } from "./records";
import { AI_RESPONSE, APPEARANCES, BUDGETS, DENSITIES, FAILURES, LOCALES } from "./states";
import type { TestScenario } from "./types";
import { AUTHENTICATED_USERS } from "./users";

export const FIXED_NOW = "2025-03-08T12:00:00.000Z";

const BASE_SCENARIO: TestScenario = {
  now: FIXED_NOW,
  users: [...AUTHENTICATED_USERS],
  records: [...RECORDS],
  budgets: [...BUDGETS],
  ai: {
    ...AI_RESPONSE,
    facts: [...AI_RESPONSE.facts],
    recommendations: [...AI_RESPONSE.recommendations],
  },
  failures: { ...FAILURES },
  locales: [...LOCALES],
  appearances: [...APPEARANCES],
  densities: [...DENSITIES],
};

export function createIsolatedScenario(): TestScenario {
  return structuredClone(BASE_SCENARIO);
}
