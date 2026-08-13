'use server';

import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import type { ActionResult } from '@/lib/domain/types';
import { CATEGORY_DEFINITIONS } from '@/lib/domain/categories';
import { CacheKey, deleteCache } from '@/lib/cache';

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
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  try {
    const [userCategories, spending] = await Promise.all([
      db.userCategory.findMany({ where: { userId: user.id } }),
      db.record.groupBy({
        by: ['category'],
        where: { userId: user.id, type: 'expense' },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const catMap = new Map(userCategories.map(c => [c.categoryId, c]));
    const spendMap = new Map(spending.map(s => [s.category, { total: s._sum.amount ?? 0, count: s._count }]));

    const result: CategoryWithSpending[] = CATEGORY_DEFINITIONS.map(def => {
      const custom = catMap.get(def.id);
      const stats = spendMap.get(def.id);
      return {
        id: def.id,
        categoryId: def.id,
        label: custom?.label ?? def.label,
        iconName: custom?.iconName ?? def.lucideIcon,
        color: custom?.color ?? '',
        isCustom: custom?.isCustom ?? false,
        spendingMinor: Math.round((stats?.total ?? 0) * 100),
        transactionCount: stats?.count ?? 0,
      };
    });

    for (const uc of userCategories) {
      if (!result.find(r => r.categoryId === uc.categoryId)) {
        result.push({
          id: uc.id,
          categoryId: uc.categoryId,
          label: uc.label,
          iconName: uc.iconName,
          color: uc.color,
          isCustom: uc.isCustom,
          spendingMinor: Math.round((spendMap.get(uc.categoryId)?.total ?? 0) * 100),
          transactionCount: spendMap.get(uc.categoryId)?.count ?? 0,
        });
      }
    }

    return { status: 'success', data: result, message: 'Categories loaded.' };
  } catch (error) {
    console.error('Failed to load categories', error);
    return { status: 'error', message: 'Could not load categories.', retryable: true };
  }
}

export async function upsertCategory(
  categoryId: string,
  data: { label: string; iconName?: string; color?: string },
): Promise<ActionResult<{ categoryId: string }, never>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  try {
    await db.userCategory.upsert({
      where: { userId_categoryId: { userId: user.id, categoryId } },
      update: { label: data.label, iconName: data.iconName ?? '', color: data.color ?? '' },
      create: {
        userId: user.id,
        categoryId,
        label: data.label,
        iconName: data.iconName ?? '',
        color: data.color ?? '',
      },
    });
    await deleteCache(CacheKey.categories(user.id));
    return { status: 'success', data: { categoryId }, message: 'Category saved.' };
  } catch (error) {
    console.error('Failed to save category', error);
    return { status: 'error', message: 'Could not save category.', retryable: true };
  }
}

export async function createCustomCategory(
  label: string,
  iconName?: string,
  color?: string,
): Promise<ActionResult<{ categoryId: string }, never>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  try {
    const categoryId = `custom-${Date.now()}`;
    await db.userCategory.create({
      data: {
        userId: user.id,
        categoryId,
        label,
        iconName: iconName ?? 'Shapes',
        color: color ?? '#6B7280',
        isCustom: true,
      },
    });
    await deleteCache(CacheKey.categories(user.id));
    return { status: 'success', data: { categoryId }, message: 'Category created.' };
  } catch (error) {
    console.error('Failed to create category', error);
    return { status: 'error', message: 'Could not create category.', retryable: true };
  }
}

export async function deleteCustomCategory(
  categoryId: string,
): Promise<ActionResult<{ categoryId: string }, never>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  try {
    const cat = await db.userCategory.findUnique({
      where: { userId_categoryId: { userId: user.id, categoryId } },
    });
    if (!cat || !cat.isCustom) {
      return { status: 'error', message: 'Cannot delete a built-in category.', retryable: false };
    }
    await db.userCategory.delete({ where: { id: cat.id } });
    await deleteCache(CacheKey.categories(user.id));
    return { status: 'success', data: { categoryId }, message: 'Category deleted.' };
  } catch (error) {
    console.error('Failed to delete category', error);
    return { status: 'error', message: 'Could not delete category.', retryable: true };
  }
}
