'use server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { Record } from '@/types/Record';

async function getAllRecords(): Promise<{
  records?: Record[];
  error?: string;
}> {
  const user = await getAuthUser();

  if (!user) {
    return { error: 'User not found' };
  }

  const userId = user.id;

  try {
    const records = await db.record.findMany({
      where: { userId },
      orderBy: {
        date: 'desc',
      },
      // No take limit — fetches all records
    });

    return { records: records as unknown as Record[] };
  } catch (error) {
    console.error('Error fetching all records:', error);
    return { error: 'Database error' };
  }
}

export default getAllRecords;
