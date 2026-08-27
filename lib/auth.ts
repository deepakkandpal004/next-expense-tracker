/**
 * Legacy re-export — auth now lives in modular monolith.
 * Keep this file for backwards compat; new code import from `@/src/modules/auth`.
 * @deprecated Use `@/src/modules/auth` instead.
 */
export * from "@/src/modules/auth/application/auth.service";
export { SESSION_COOKIE_NAME } from "@/src/modules/auth/application/auth.service";