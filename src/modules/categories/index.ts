export * from "./domain/categories.domain";
export {
  findByUser,
  findByUserAndId,
  groupSpendingByCategory,
} from "./infrastructure/categories.repository";
export {
  getCategories,
  upsertCategory,
  createCustomCategory,
  deleteCustomCategory,
  type CategoryWithSpending,
} from "./application/categories.service";
