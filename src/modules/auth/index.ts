/**
 * Auth module public API — what other modules may import.
 * Internal files (domain/infrastructure) stay private.
 */
export * from "./domain/auth.domain";
export * from "./application/auth.service";
export * as AuthRepository from "./infrastructure/auth.repository";
