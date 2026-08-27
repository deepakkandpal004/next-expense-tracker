/**
 * Modules barrel — single import surface for cross-module usage.
 * Enforces dependency direction: modules may only import from
 * src/common, src/config, src/database, or other modules' public index.
 */

export * as AuthModule from "./auth";
export * as RecordsModule from "./records";
export * as BudgetsModule from "./budgets";
export * as GoalsModule from "./goals";
export * as RecurringModule from "./recurring";
export * as DashboardModule from "./dashboard";
export * as ReportsModule from "./reports";
export * as AiModule from "./ai";
export * as CategoriesModule from "./categories";
