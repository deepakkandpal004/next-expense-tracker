import { db } from "@/src/database/client";

/**
 * Categories repository — Prisma gateway for UserCategory.
 * Was app/actions/manageCategories.ts inline queries.
 */

export async function findByUser(userId: string) {
  return db.userCategory.findMany({ where: { userId } });
}

export async function findByUserAndId(userId: string, categoryId: string) {
  return db.userCategory.findUnique({ where: { userId_categoryId: { userId, categoryId } } });
}

export async function upsertCategory(userId: string, categoryId: string, data: { label: string; iconName?: string; color?: string }) {
  return db.userCategory.upsert({
    where: { userId_categoryId: { userId, categoryId } },
    update: { label: data.label, iconName: data.iconName ?? "", color: data.color ?? "" },
    create: { userId, categoryId, label: data.label, iconName: data.iconName ?? "", color: data.color ?? "" },
  });
}

export async function createCustomCategory(userId: string, label: string, iconName?: string, color?: string) {
  const categoryId = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return db.userCategory.create({
    data: { userId, categoryId, label, iconName: iconName ?? "Shapes", color: color ?? "#6B7280", isCustom: true },
  });
}

export async function deleteCustomCategory(userId: string, categoryId: string) {
  const cat = await db.userCategory.findUnique({ where: { userId_categoryId: { userId, categoryId } } });
  if (!cat || !cat.isCustom) return null;
  return db.userCategory.delete({ where: { id: cat.id } });
}

export async function groupSpendingByCategory(userId: string) {
  return db.record.groupBy({
    by: ["category"],
    where: { userId, type: "expense" },
    _sum: { amount: true },
    _count: true,
  });
}
