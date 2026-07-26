'use server';

import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { normalizeReportingPeriod } from '@/lib/domain/reporting-period';
import type { ActionResult, ReportingPeriod } from '@/lib/domain/types';

const CSV_COLUMNS = ['Date', 'Description', 'Amount', 'Type', 'Category'] as const;

function escapeCsvCell(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function exportTransactionsToCsv(
  period: ReportingPeriod,
): Promise<ActionResult<{ csv: string; filename: string }, 'period'>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  const normalized = normalizeReportingPeriod(period);
  if (!normalized.valid) {
    return { status: 'validation-error', fieldErrors: { period: ['Choose a valid reporting period.'] }, message: 'Choose a valid reporting period.' };
  }

  try {
    const records = await db.record.findMany({
      where: {
        userId: user.id,
        date: {
          gte: new Date(`${normalized.period.start}T00:00:00.000Z`),
          lte: new Date(`${normalized.period.end}T23:59:59.999Z`),
        },
      },
      orderBy: { date: 'desc' },
    });

    const header = CSV_COLUMNS.map(escapeCsvCell).join(',');
    const rows = records.map(r => [
      r.date.toISOString().slice(0, 10),
      r.text,
      r.amount.toFixed(2),
      r.type,
      r.category,
    ].map(escapeCsvCell).join(','));

    const csv = [header, ...rows].join('\r\n');
    const filename = `expense-ai-export-${normalized.period.start}-to-${normalized.period.end}.csv`;

    return { status: 'success', data: { csv, filename }, message: 'CSV exported.' };
  } catch (error) {
    console.error('CSV export failed', error);
    return { status: 'error', message: 'Could not export transactions.', retryable: true };
  }
}
