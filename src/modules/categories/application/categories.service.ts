'use server';

import { getAuthUser } from "@/src/modules/auth";
import * as repo from "@/src/modules/categories/infrastructure/categories.repository";
import type { ActionResult } from "@/lib/domain/types";
import { CATEGORY_DEFINITIONS } from "@/src/modules/categories/domain/categories.domain";
import { CacheKey, deleteCache } from "@/src/common/cache";

export interface CategoryWithSpending {
  id: string;
  categoryId: string;
  label: string;
  iconName: string;
  color: string;
  isCustom: boolean;
  spendingMinor: number;
  transactionCount: number;
}

export async function getCategories(): Promise<ActionResult<CategoryWithSpending[], never>> {
  const user = await getAuthUser();
  if (!user) return { status: "error", message: "Sign in to continue.", retryable: false };
  try {
    const [userCategories, spending] = await Promise.all([repo.findByUser(user.id), repo.groupSpendingByCategory(user.id)]);
    const catMap = new Map(userCategories.map((c) => [c.categoryId, c]));
    const spendMap = new Map(spending.map((s) => [s.category, { total: Number(s._sum.amount ?? 0) ?? 0, count: s._count }]));
    const result: CategoryWithSpending[] = CATEGORY_DEFINITIONS.map((def) => {
      const custom = catMap.get(def.id);
      const stats = spendMap.get(def.id);
      return {
        id: def.id,
        categoryId: def.id,
        label: custom?.label ?? def.label,
        iconName: custom?.iconName ?? def.lucideIcon,
        color: custom?.color ?? "",
        isCustom: custom?.isCustom ?? false,
        spendingMinor: Math.round(Number(stats?.total ?? 0) * 100),
        transactionCount: stats?.count ?? 0,
      };
    });
    for (const uc of userCategories) {
      if (!result.find((r) => r.categoryId === uc.categoryId)) {
        result.push({
          id: uc.id,
          categoryId: uc.categoryId,
          label: uc.label,
          iconName: uc.iconName,
          color: uc.color,
          isCustom: uc.isCustom,
          spendingMinor: Math.round(Number(spendMap.get(uc.categoryId)?.total ?? 0) * 100),
          transactionCount: spendMap.get(uc.categoryId)?.count ?? 0,
        });
      }
    }
    return { status: "success", data: result, message: "Categories loaded." };
  } catch (error) {
    console.error("Failed to load categories", error);
    return { status: "error", message: "Could not load categories.", retryable: true };
  }
}

export async function upsertCategory(categoryId: string, data: { label: string; iconName?: string; color?: string }): Promise<ActionResult<{ categoryId: string }, never>> {
  const user = await getAuthUser();
  if (!user) return { status: "error", message: "Sign in to continue.", retryable: false };
  try {
    await repo.upsertCategory(user.id, categoryId, data);
    await deleteCache(CacheKey.categories(user.id));
    return { status: "success", data: { categoryId }, message: "Category saved." };
  } catch (error) {
    console.error("Failed to save category", error);
    return { status: "error", message: "Could not save category.", retryable: true };
  }
}

export async function createCustomCategory(label: string, iconName?: string, color?: string): Promise<ActionResult<{ categoryId: string }, never>> {
  const user = await getAuthUser();
  if (!user) return { status: "error", message: "Sign in to continue.", retryable: false };
  try {
    const cat = await repo.createCustomCategory(user.id, label, iconName, color);
    await deleteCache(CacheKey.categories(user.id));
    return { status: "success", data: { categoryId: cat.categoryId }, message: "Category created." };
  } catch (error) {
    console.error("Failed to create category", error);
    return { status: "error", message: "Could not create category.", retryable: true };
  }
}

export async function deleteCustomCategory(categoryId: string): Promise<ActionResult<{ categoryId: string }, never>> {
  const user = await getAuthUser();
  if (!user) return { status: "error", message: "Sign in to continue.", retryable: false };
  try {
    const cat = await repo.deleteCustomCategory(user.id, categoryId);
    if (!cat) return { status: "error", message: "Cannot delete a built-in category.", retryable: false };
    await deleteCache(CacheKey.categories(user.id));
    return { status: "success", data: { categoryId }, message: "Category deleted." };
  } catch (error) {
    console.error("Failed to delete category", error);
    return { status: "error", message: "Could not delete category.", retryable: true };
  }
}
