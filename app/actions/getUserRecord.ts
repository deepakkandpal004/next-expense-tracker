'use server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

async function getUserRecord(): Promise<{
  record?: number;
  daysWithRecords?: number;
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
    });

    const record = records.reduce((sum, r) => sum + r.amount, 0);

    // Count the number of unique days with valid expense records
    const validRecords = records.filter((r) => r.amount > 0);
    const uniqueDays = new Set(
      validRecords.map((r) => {
        const d = new Date(r.date);
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      })
    );
    const daysWithRecords = uniqueDays.size;

    return { record, daysWithRecords };
  } catch (error) {
    console.error('Error fetching user record:', error); // Log the error
    return { error: 'Database error' };
  }
}

export default getUserRecord;