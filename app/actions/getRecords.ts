'use server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { Record } from '@/types/Record';

async function getRecords(): Promise<{
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
        date: 'desc', // Sort by the `date` field in descending order
      },
      take: 10, // Limit the request to 10 records
    });

    return { records };
  } catch (error) {
    console.error('Error fetching records:', error); // Log the error
    return { error: 'Database error' };
  }
}

export default getRecords;