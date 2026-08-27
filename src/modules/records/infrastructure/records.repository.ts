import { db } from "@/src/database/client";
import { boundaryAtStart, boundaryAtEnd } from "@/src/common/utils/date";
import type { ResolvedPeriod } from "@/lib/domain/types";
import type { Prisma } from "@prisma/client";

/**
 * Records repository — all Prisma access for Record.
 * Adds cursor pagination (P0 fix) to avoid loading entire period into memory.
 *
 * Previously lib/data/records.ts did `findMany` without take/skip.
 */

export interface PaginationCursor {
  date: string; // ISO date
  id: string;
}

export interface PaginatedRecords {
  items: Awaited<ReturnType<typeof db.record.findMany>>;
  nextCursor: PaginationCursor | null;
  hasMore: boolean;
}

export async function findByPeriod(
  userId: string,
  period: ResolvedPeriod,
): Promise<Awaited<ReturnType<typeof db.record.findMany>>> {
  return db.record.findMany({
    where: { userId, date: { gte: boundaryAtStart(period.start), lte: boundaryAtEnd(period.end) } },
    orderBy: [{ date: "desc" }, { id: "desc" }],
  });
}

export async function findByPeriodPaginated(
  userId: string,
  period: ResolvedPeriod,
  opts: { cursor?: PaginationCursor; take?: number } = {},
): Promise<PaginatedRecords> {
  const take = Math.min(Math.max(opts.take ?? 50, 1), 100);
  const where: Prisma.RecordWhereInput = {
    userId,
    date: { gte: boundaryAtStart(period.start), lte: boundaryAtEnd(period.end) },
  };

  // Cursor: fetch after (date < cursor.date) OR (date = cursor.date AND id < cursor.id)
  // Since orderBy is date desc, id desc, we need to filter accordingly
  if (opts.cursor) {
    const cursorDate = new Date(opts.cursor.date);
    where.AND = [
      {
        OR: [
          { date: { lt: cursorDate } },
          { date: cursorDate, id: { lt: opts.cursor.id } },
        ],
      },
    ];
  }

  const items = await db.record.findMany({
    where,
    orderBy: [{ date: "desc" }, { id: "desc" }],
    take: take + 1, // fetch one extra to know hasMore
  });

  const hasMore = items.length > take;
  const pageItems = hasMore ? items.slice(0, take) : items;
  const last = pageItems[pageItems.length - 1];
  const nextCursor = hasMore && last ? { date: last.date.toISOString(), id: last.id } : null;

  return { items: pageItems, nextCursor, hasMore };
}

export async function countByPeriod(userId: string, period: ResolvedPeriod): Promise<number> {
  return db.record.count({
    where: { userId, date: { gte: boundaryAtStart(period.start), lte: boundaryAtEnd(period.end) } },
  });
}

export interface RecordsQuery {
  search: string;
  types: readonly string[];
  categories: readonly string[];
  sort: { key: "date" | "amount"; direction: "asc" | "desc" };
}

export interface PaginatedQueryResult {
  items: Awaited<ReturnType<typeof db.record.findMany>>;
  total: number;
  hasMore: boolean;
}

export async function findByQueryPaginated(
  userId: string,
  period: ResolvedPeriod,
  query: RecordsQuery,
  pagination: { page: number; take: number },
): Promise<PaginatedQueryResult> {
  const take = Math.min(Math.max(pagination.take ?? 50, 1), 100);
  const page = Math.max(pagination.page ?? 1, 1);
  const skip = (page - 1) * take;

  const where: Prisma.RecordWhereInput = {
    userId,
    date: { gte: boundaryAtStart(period.start), lte: boundaryAtEnd(period.end) },
  };

  const search = query.search.trim();
  if (search) {
    where.text = { contains: search, mode: "insensitive" };
  }
  if (query.types.length > 0) {
    where.type = { in: [...query.types] };
  }
  if (query.categories.length > 0) {
    where.category = { in: [...query.categories] };
  }

  const orderBy: Prisma.RecordOrderByWithRelationInput =
    query.sort.key === "amount"
      ? { amount: query.sort.direction }
      : { date: query.sort.direction };

  const [total, items] = await Promise.all([
    db.record.count({ where }),
    db.record.findMany({
      where,
      orderBy: [orderBy, { id: "desc" }],
      skip,
      take,
    }),
  ]);

  return { items, total, hasMore: skip + items.length < total };
}

export async function createManyRecords(
  data: Array<{ text: string; amount: number; type: string; category: string; date: Date; userId: string }>,
) {
  if (data.length === 0) return { count: 0 };
  const BATCH = 500;
  let total = 0;
  for (let i = 0; i < data.length; i += BATCH) {
    const chunk = data.slice(i, i + BATCH);
    const res = await db.record.createMany({ data: chunk });
    total += res.count;
  }
  return { count: total };
}
