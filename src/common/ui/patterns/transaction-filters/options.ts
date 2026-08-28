import { CATEGORY_REGISTRY, EXPENSE_CATEGORY_IDS } from "@/src/common/domain/categories";

export const typeOptions = [
  { value: "", label: "All types" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
];

export const categoryOptions = [
  { value: "", label: "All categories" },
  { value: "Income", label: "Income" },
  ...EXPENSE_CATEGORY_IDS.map((id) => ({ value: id, label: CATEGORY_REGISTRY[id].label })),
];

export const sortOptions = [
  { value: "date-desc", label: "Newest first" },
  { value: "date-asc", label: "Oldest first" },
  { value: "amount-desc", label: "Highest amount" },
  { value: "amount-asc", label: "Lowest amount" },
];
