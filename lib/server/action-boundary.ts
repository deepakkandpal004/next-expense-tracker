import type { ActionResult, FieldErrors } from "@/lib/domain/types";

export const EXPENSE_COMMAND_SCOPES = ["transaction", "record", "export", "dashboard", "budget", "ai"] as const;
export type ExpenseCommandScope = (typeof EXPENSE_COMMAND_SCOPES)[number];
export interface AuthorizedActor { readonly userId: string }
export type ParseResult<T, TField extends string> =
  | { readonly valid: true; readonly value: T }
  | { readonly valid: false; readonly fieldErrors: FieldErrors<TField>; readonly message: string };
export const parsed = <T>(value: T): ParseResult<T, never> => ({ valid: true, value });
export const invalid = <TField extends string>(fieldErrors: FieldErrors<TField>, message: string): ParseResult<never, TField> => ({ valid: false, fieldErrors, message });

type AuthorizationResult = true | { readonly message: string; readonly retryable?: boolean };
export interface ActionBoundaryDependencies {
  authenticate(): Promise<{ id: string } | null>;
  revalidate(path: string): void | Promise<void>;
  reportError?(scope: ExpenseCommandScope, error: unknown): void;
}
export interface AuthorizedAction<TInput, TParsed, TData, TField extends string> {
  scope: ExpenseCommandScope;
  input: TInput;
  parse(input: TInput): ParseResult<TParsed, TField>;
  authorize?(actor: AuthorizedActor, input: TInput): Promise<AuthorizationResult> | AuthorizationResult;
  execute(actor: AuthorizedActor, input: TParsed): Promise<TData>;
  message: string | ((data: TData) => string);
  revalidatePaths?: readonly string[];
  preserve?(input: TInput): TData | undefined;
}

/** Executes every protected command in the same authenticate, authorize, parse, execute, and revalidate sequence. */
export function createActionBoundary(dependencies: ActionBoundaryDependencies) {
  return async function runAuthorizedAction<TInput, TParsed, TData, TField extends string>(
    action: AuthorizedAction<TInput, TParsed, TData, TField>,
  ): Promise<ActionResult<TData, TField>> {
    const preserved = action.preserve?.(action.input);
    try {
      const user = await dependencies.authenticate();
      if (!user) return { status: "error", data: preserved, message: "Sign in to continue.", retryable: false };
      const actor: AuthorizedActor = { userId: user.id };
      const authorization = await action.authorize?.(actor, action.input);
      if (authorization !== undefined && authorization !== true) return { status: "error", data: preserved, message: authorization.message, retryable: authorization.retryable ?? false };
      const parsedInput = action.parse(action.input);
      if (!parsedInput.valid) return { status: "validation-error", data: preserved, fieldErrors: parsedInput.fieldErrors, message: parsedInput.message };
      const data = await action.execute(actor, parsedInput.value);
      for (const path of action.revalidatePaths ?? []) {
        try { await dependencies.revalidate(path); } catch (error) { dependencies.reportError?.(action.scope, error); }
      }
      return { status: "success", data, message: typeof action.message === "function" ? action.message(data) : action.message };
    } catch (error) {
      dependencies.reportError?.(action.scope, error);
      return { status: "error", data: preserved, message: "The operation could not be completed. Please retry.", retryable: true };
    }
  };
}
