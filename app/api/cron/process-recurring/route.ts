import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { processDueRecurringRecords } from '@/lib/data/recurring';

export const dynamic = 'force-dynamic';

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

/** Scheduled entry point that processes due recurring rules for every user. */
export async function GET(request: Request): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await db.recurringRecord.findMany({
      where: { active: true },
      distinct: ['userId'],
      select: { userId: true },
    });

    const results = [];
    for (const { userId } of users) {
      const created = await processDueRecurringRecords(userId);
      if (created > 0) results.push({ userId, created });
    }

    return NextResponse.json({ processed: users.length, created: results.reduce((sum, r) => sum + r.created, 0), results });
  } catch (error) {
    console.error('Recurring cron failed', error);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
