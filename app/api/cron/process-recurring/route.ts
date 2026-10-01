import { NextResponse } from 'next/server';

import { db } from '@/src/database/client';
import { processDueRecurringRecords } from '@/src/modules/recurring';
import { CacheKey, deleteCacheByPattern } from '@/src/common/cache';
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

    // Parallelize per-user processing (was sequential — 50 users = 50x latency).
    // Only aggregate counts are returned: per-user ids must not leak in the response.
    const createdCounts = await Promise.all(
      users.map(async ({ userId }) => {
        const created = await processDueRecurringRecords(userId);
        if (created > 0) {
          await deleteCacheByPattern(CacheKey.userAllPattern(userId));
        }
        return created;
      }),
    );

    return NextResponse.json({
      usersProcessed: users.length,
      occurrencesCreated: createdCounts.reduce((sum, n) => sum + n, 0),
    });
  } catch (error) {
    console.error('Recurring cron failed', error);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
});
