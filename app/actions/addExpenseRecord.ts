'use server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

interface RecordData {
  text: string;
  amount: number;
  type: string;
  category: string;
  date: string;
}

interface RecordResult {
  data?: RecordData;
  error?: string;
}

async function addExpenseRecord(formData: FormData): Promise<RecordResult> {
  const textValue = formData.get('text');
  const amountValue = formData.get('amount');
  const categoryValue = formData.get('category');
  const dateValue = formData.get('date');
  const typeValue = formData.get('type') ?? 'expense';

  if (!textValue || textValue === '' || !amountValue || !dateValue || dateValue === '') {
    return { error: 'Text, amount, or date is missing' };
  }

  const type = typeValue.toString();
  const text: string = textValue.toString();
  const amount: number = parseFloat(amountValue.toString());

  // For income records, category is not required
  const category: string =
    type === 'income' ? 'Income' : (categoryValue?.toString() || 'Other');

  if (type === 'expense' && (!categoryValue || categoryValue === '')) {
    return { error: 'Category is required for expense records' };
  }

  let date: string;
  try {
    const inputDate = dateValue.toString();
    const [year, month, day] = inputDate.split('-');
    const dateObj = new Date(
      Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0)
    );
    date = dateObj.toISOString();
  } catch (error) {
    console.error('Invalid date format:', error);
    return { error: 'Invalid date format' };
  }

  const user = await getAuthUser();
  if (!user) {
    return { error: 'User not found' };
  }

  const userId = user.id;

  try {
    const createdRecord = await db.record.create({
      data: {
        text,
        amount,
        type,
        category,
        date,
        userId,
      },
    });

    const recordData: RecordData = {
      text: createdRecord.text,
      amount: createdRecord.amount,
      type: createdRecord.type,
      category: createdRecord.category,
      date: createdRecord.date?.toISOString() || date,
    };

    revalidatePath('/');

    return { data: recordData };
  } catch (error) {
    console.error('Error adding record:', error);
    return {
      error: 'An unexpected error occurred while adding the record.',
    };
  }
}

export default addExpenseRecord;