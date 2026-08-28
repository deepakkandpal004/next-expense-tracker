import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/src/modules/auth';
import { getRecordsView } from '@/src/modules/records';
import { resolveValidReportingPeriod } from '@/src/common/domain/reporting-period';
import { toSearchParams } from '@/src/common/domain/search-params';
import { RecordsView } from '@/src/modules/records/presentation';

export const metadata: Metadata = { title: 'Records – Expense Tracker AI' };

interface RecordsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  const user = await getAuthUser();
  if (!user) redirect('/sign-in');

  const query = await searchParams;
  const searchParamsObject = toSearchParams(query);
  const { input: periodInput, period } = resolveValidReportingPeriod(searchParamsObject);

  // Parse server-side query for pagination + filtering
  const search = typeof query.search === "string" ? query.search : Array.isArray(query.search) ? query.search[0] ?? "" : "";
  const typeParam = query.type;
  const types = typeParam ? (Array.isArray(typeParam) ? typeParam : [typeParam]).filter(Boolean) as string[] : [];
  const categoryParam = query.category;
  const categories = categoryParam ? (Array.isArray(categoryParam) ? categoryParam : [categoryParam]).filter(Boolean) as string[] : [];
  const sortParam = typeof query.sort === "string" ? query.sort : Array.isArray(query.sort) ? query.sort[0] : undefined;
  const pageParam = typeof query.page === "string" ? parseInt(query.page, 10) : Array.isArray(query.page) ? parseInt(query.page[0] ?? "1", 10) : 1;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  // Parse sort: e.g., "date-desc" or "amount-asc"
  let sortKey: "date" | "amount" = "date";
  let sortDir: "asc" | "desc" = "desc";
  if (sortParam) {
    const [k, d] = sortParam.split("-");
    if (k === "date" || k === "amount") sortKey = k;
    if (d === "asc" || d === "desc") sortDir = d;
  }

  const { records, total, hasMore } = await getRecordsView(
    user.id,
    period,
    { search, types, categories, sort: { key: sortKey, direction: sortDir }, page, take: 15 },
    user.currency,
  );

  return (
    <RecordsView
      period={periodInput}
      records={records}
      resolvedPeriod={period}
      pagination={{ total, page, hasMore, take: 15 }}
    />
  );
}
