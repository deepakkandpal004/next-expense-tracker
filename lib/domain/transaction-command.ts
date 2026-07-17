import { z } from "zod";
import {
  CATEGORY_IDS,
  EXPENSE_CATEGORY_IDS,
  type CategoryId,
  type ExpenseCategoryId,
} from "./categories";
import type { FieldErrors, TransactionType } from "./types";

/** One shared rule: descriptions contain 1–120 characters after trimming. */
export const TRANSACTION_DESCRIPTION_MAX_LENGTH = 120;
/** Maximum major-unit value accepted by the current Float-backed server model. */
export const TRANSACTION_AMOUNT_MAX = 999_999_999.99;
export const TRANSACTION_DATE_FORMAT = "YYYY-MM-DD";

export const TRANSACTION_FIELD_ORDER = [
  "type",
  "description",
  "date",
  "amount",
  "category",
] as const;

export type TransactionCommandField = (typeof TRANSACTION_FIELD_ORDER)[number];
export type TransactionCommandFieldErrors = FieldErrors<TransactionCommandField>;
export type ExpenseCategorySource =
  | "manual"
  | "ai-suggested"
  | "ai-replaced";

export interface TransactionCommandInput {
  type: unknown;
  description: unknown;
  date: unknown;
  amount: unknown;
  category?: unknown;
  categorySource?: unknown;
  categoryConfirmed?: unknown;
}

export interface TransactionCommand {
  type: TransactionType;
  description: string;
  date: string;
  amount: number;
  category: CategoryId;
}

const messages = {
  type: "Choose income or expense.",
  description: `Enter a description between 1 and ${TRANSACTION_DESCRIPTION_MAX_LENGTH} characters.`,
  date: `Enter a valid calendar date in ${TRANSACTION_DATE_FORMAT} format.`,
  amount: `Enter an amount greater than 0 and no more than ${TRANSACTION_AMOUNT_MAX}.`,
  category: "Choose a supported expense category.",
  aiConfirmation: "Confirm or replace the AI-suggested category.",
} as const;

export const transactionTypeSchema = z.enum(["income", "expense"], {
  required_error: messages.type,
  invalid_type_error: messages.type,
});

export const transactionDescriptionSchema = z
  .string({
    required_error: messages.description,
    invalid_type_error: messages.description,
  })
  .trim()
  .min(1, messages.description)
  .max(TRANSACTION_DESCRIPTION_MAX_LENGTH, messages.description);

export const transactionAmountSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed === "" ? Number.NaN : Number(trimmed);
  },
  z
    .number({
      required_error: messages.amount,
      invalid_type_error: messages.amount,
    })
    .finite(messages.amount)
    .positive(messages.amount)
    .max(TRANSACTION_AMOUNT_MAX, messages.amount),
);

function isValidCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;

  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return day <= daysInMonth[month - 1];
}

export const transactionDateSchema = z
  .string({ required_error: messages.date, invalid_type_error: messages.date })
  .refine(isValidCalendarDate, messages.date);

export const supportedCategorySchema = z.enum(CATEGORY_IDS);
export const expenseCategorySchema = supportedCategorySchema.refine(
  (category): category is ExpenseCategoryId => category !== "Income",
  messages.category,
);

function isExpenseCategory(value: unknown): value is ExpenseCategoryId {
  return (
    typeof value === "string" &&
    EXPENSE_CATEGORY_IDS.includes(value as ExpenseCategoryId)
  );
}

function isCategorySource(value: unknown): value is ExpenseCategorySource {
  return (
    value === undefined ||
    value === "manual" ||
    value === "ai-suggested" ||
    value === "ai-replaced"
  );
}

function isExplicitlyConfirmed(value: unknown): boolean {
  return value === true || value === "true" || value === "on";
}

const transactionCommandBaseSchema = z.object({
  type: transactionTypeSchema,
  description: transactionDescriptionSchema,
  date: transactionDateSchema,
  amount: transactionAmountSchema,
  category: z.unknown().optional(),
  categorySource: z.unknown().optional(),
  categoryConfirmed: z.unknown().optional(),
});

export const transactionCommandSchema = transactionCommandBaseSchema
  .superRefine((command, context) => {
    if (command.type === "income") return;

    if (!isExpenseCategory(command.category)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["category"],
        message: messages.category,
      });
      return;
    }

    if (!isCategorySource(command.categorySource)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["category"],
        message: messages.category,
      });
      return;
    }

    if (
      command.categorySource === "ai-suggested" &&
      !isExplicitlyConfirmed(command.categoryConfirmed)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["category"],
        message: messages.aiConfirmation,
      });
    }
  })
  .transform(
    (command): TransactionCommand => ({
      type: command.type,
      description: command.description,
      date: command.date,
      amount: command.amount,
      category:
        command.type === "income"
          ? "Income"
          : (command.category as ExpenseCategoryId),
    }),
  );

export type TransactionCommandValidationResult =
  | { success: true; data: TransactionCommand }
  | {
      success: false;
      fieldErrors: TransactionCommandFieldErrors;
      firstInvalidField: TransactionCommandField;
    };

export function toTransactionFieldErrors(
  error: z.ZodError,
): TransactionCommandFieldErrors {
  const fieldErrors: TransactionCommandFieldErrors = {};

  for (const field of TRANSACTION_FIELD_ORDER) {
    const issue = error.issues.find((candidate) => candidate.path[0] === field);
    if (issue) fieldErrors[field] = [issue.message];
  }

  return fieldErrors;
}

/** Run this again at the server boundary; client validation is advisory only. */
export function validateTransactionCommand(
  input: TransactionCommandInput,
): TransactionCommandValidationResult {
  const result = transactionCommandSchema.safeParse(input);
  if (result.success) return result;

  const fieldErrors = toTransactionFieldErrors(result.error);
  const firstInvalidField = TRANSACTION_FIELD_ORDER.find(
    (field) => fieldErrors[field] !== undefined,
  );

  // Every base/schema refinement is attached to a visible transaction field.
  if (!firstInvalidField) {
    throw new Error("Transaction validation produced no field-specific error.");
  }

  return { success: false, fieldErrors, firstInvalidField };
}
