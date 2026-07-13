'use server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function deleteRecord(recordId: string): Promise<{
  message?: string;
  error?: string;
}> {
  const user = await getAuthUser();

  if (!user) {
    return { error: 'User not found' };
  }

  const userId = user.id;

  try {
    await db.record.delete({
      where: {
        id: recordId,
        userId,
      },
    });

    revalidatePath('/');

    return { message: 'Record deleted' };
  } catch (error) {
    console.error('Error deleting record:', error); // Log the error
    return { error: 'Database error' };
  }
}

export default deleteRecord;