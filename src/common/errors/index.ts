/**
 * Shared error types — consistent shape across modules.
 * Mirrors lib/domain/types.ts ActionResult but as classes for service layer.
 */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly retryable: boolean = false,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public readonly fieldErrors: Record<string, string[]>) {
    super(message, "VALIDATION_ERROR", 400, false);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Sign in to continue.") {
    super(message, "UNAUTHORIZED", 401, false);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, "FORBIDDEN", 403, false);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, "NOT_FOUND", 404, false);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests", public readonly retryAfterMs: number) {
    super(message, "RATE_LIMITED", 429, true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, "CONFLICT", 409, false);
  }
}
