'use server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

async function getUserRecord(): Promise<{
  totalExpenses?: number;
  totalIncome?: number;
  netBalance?: number;
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

    const totalExpenses = records
      .filter((r) => r.type !== 'income')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalIncome = records
      .filter((r) => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0);

    const netBalance = totalIncome - totalExpenses;

    // Count unique days with expense records (for average calculation)
    const expenseRecords = records.filter((r) => r.type !== 'income' && r.amount > 0);
    const uniqueDays = new Set(
      expenseRecords.map((r) => {
        const d = new Date(r.date);
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      })
    );
    const daysWithRecords = uniqueDays.size;

    return { totalExpenses, totalIncome, netBalance, daysWithRecords };
  } catch (error) {
    console.error('Error fetching user record:', error);
    return { error: 'Database error' };
  }
}

export default getUserRecord;