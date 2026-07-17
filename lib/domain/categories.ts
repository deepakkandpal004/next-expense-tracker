export const CATEGORY_IDS = [
  "Food",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills",
  "Healthcare",
  "Income",
  "Other",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];
export type ExpenseCategoryId = Exclude<CategoryId, "Income">;

export type CategorySymbol =
  | "circle"
  | "triangle"
  | "rect"
  | "rectRot"
  | "cross"
  | "crossRot"
  | "star"
  | "dash";

export interface CategoryDefinition {
  id: CategoryId;
  label: string;
  semanticToken: `category-${Lowercase<CategoryId>}`;
  lucideIcon: string;
  symbol: CategorySymbol;
}

const definitions = [
  {
    id: "Food",
    label: "Food & dining",
    semanticToken: "category-food",
    lucideIcon: "Utensils",
    symbol: "circle",
  },
  {
    id: "Transportation",
    label: "Transportation",
    semanticToken: "category-transportation",
    lucideIcon: "Car",
    symbol: "triangle",
  },
  {
    id: "Shopping",
    label: "Shopping",
    semanticToken: "category-shopping",
    lucideIcon: "ShoppingBag",
    symbol: "rect",
  },
  {
    id: "Entertainment",
    label: "Entertainment",
    semanticToken: "category-entertainment",
    lucideIcon: "Film",
    symbol: "rectRot",
  },
  {
    id: "Bills",
    label: "Bills & utilities",
    semanticToken: "category-bills",
    lucideIcon: "Receipt",
    symbol: "cross",
  },
  {
    id: "Healthcare",
    label: "Healthcare",
    semanticToken: "category-healthcare",
    lucideIcon: "HeartPulse",
    symbol: "crossRot",
  },
  {
    id: "Income",
    label: "Income",
    semanticToken: "category-income",
    lucideIcon: "CircleDollarSign",
    symbol: "star",
  },
  {
    id: "Other",
    label: "Other",
    semanticToken: "category-other",
    lucideIcon: "Shapes",
    symbol: "dash",
  },
] as const satisfies readonly CategoryDefinition[];

export const CATEGORY_DEFINITIONS: readonly CategoryDefinition[] =
  Object.freeze(definitions);

export const CATEGORY_REGISTRY: Readonly<Record<CategoryId, CategoryDefinition>> =
  Object.freeze(
    Object.fromEntries(
      CATEGORY_DEFINITIONS.map((definition) => [definition.id, definition]),
    ) as Record<CategoryId, CategoryDefinition>,
  );

export const EXPENSE_CATEGORY_IDS: readonly ExpenseCategoryId[] = Object.freeze(
  CATEGORY_IDS.filter(
    (categoryId): categoryId is ExpenseCategoryId => categoryId !== "Income",
  ),
);

export const UNKNOWN_CATEGORY_FALLBACK = CATEGORY_REGISTRY.Other;

export function isCategoryId(value: unknown): value is CategoryId {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(CATEGORY_REGISTRY, value)
  );
}

export function getCategoryDefinition(value: unknown): CategoryDefinition {
  return isCategoryId(value)
    ? CATEGORY_REGISTRY[value]
    : UNKNOWN_CATEGORY_FALLBACK;
}
