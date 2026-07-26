'use server';

import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/lib/domain/types';

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export async function importTransactionsFromCsv(
  formData: FormData,
): Promise<ActionResult<ImportResult, never>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  const file = formData.get('file');
  if (!(file instanceof File) || !file.name.endsWith('.csv')) {
    return { status: 'error', message: 'Please upload a valid CSV file.', retryable: false };
  }

  try {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim());

    if (lines.length < 2) {
      return { status: 'error', message: 'CSV file must have a header row and at least one data row.', retryable: false };
    }

    const validCategories = ['Food', 'Transportation', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Income', 'Other'];

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCsvLine(lines[i]);
        if (values.length < 4) {
          skipped++;
          continue;
        }

        const dateStr = values[0]?.trim();
        const description = values[1]?.trim();
        const amountStr = values[2]?.trim();
        const type = (values[3]?.trim().toLowerCase() === 'income') ? 'income' : 'expense';
        const category = values[4]?.trim() || 'Other';
        const finalCategory = validCategories.includes(category) ? category : 'Other';

        if (!description || !amountStr) {
          skipped++;
          continue;
        }

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
          skipped++;
          continue;
        }

        const date = dateStr ? new Date(dateStr) : new Date();
        if (isNaN(date.getTime())) {
          skipped++;
          continue;
        }

        await db.record.create({
          data: {
            text: description.slice(0, 120),
            amount,
            type,
            category: finalCategory,
            date,
            userId: user.id,
          },
        });

        imported++;
      } catch {
        skipped++;
      }
    }

    revalidatePath('/records');
    revalidatePath('/dashboard');

    return {
      status: 'success',
      data: { imported, skipped, errors },
      message: `Imported ${imported} transaction(s). ${skipped} row(s) skipped.`,
    };
  } catch (error) {
    console.error('CSV import failed', error);
    return { status: 'error', message: 'Could not import CSV file. Check the format and try again.', retryable: true };
  }
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}
