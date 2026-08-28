import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { processDueRecurringRecords } from '@/lib/data/recurring';
import { CacheKey, deleteCacheByPattern } from '@/lib/cache';
import { timingSafeEqual } from 'node:crypto';
import { withApiLogging } from '@/src/common/server/logger';

export const dynamic = 'force-dynamic';

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const provided = request.headers.get('authorization');
  if (!provided?.startsWith('Bearer ')) return false;
  const a = Buffer.from(provided.slice('Bearer '.length));
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Scheduled entry point that processes due recurring rules for every user. */
export const GET = withApiLogging(async (request: Request): Promise<NextResponse> => {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await db.recurringRecord.findMany({
      where: { active: true },
      distinct: ['userId'],
      select: { userId: true },
    });

    // Parallelize per-user processing (was sequential — 50 users = 50x latency)
    const results = await Promise.all(
      users.map(async ({ userId }) => {
        const created = await processDueRecurringRecords(userId);
        if (created > 0) {
          await deleteCacheByPattern(CacheKey.userAllPattern(userId));
          return { userId, created };
        }
        return null;
      }),
    ).then((all) => all.filter((r): r is { userId: string; created: number } => r !== null));

    return NextResponse.json({ processed: users.length, created: results.reduce((sum, r) => sum + r.created, 0), results });
  } catch (error) {
    console.error('Recurring cron failed', error);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
});
