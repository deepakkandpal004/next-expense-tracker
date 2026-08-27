'use server';

import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/lib/domain/types';
import { isCategoryId } from '@/lib/domain/categories';
import { CacheKey, deleteCacheByPattern } from '@/lib/cache';

export interface ImportResult {
  imported: number;
  skipped: number;
  duplicates: number;
  errors: string[];
}

type ColumnRole =
  | 'id'
  | 'date'
  | 'description'
  | 'amount'
  | 'amountMinor'
  | 'type'
  | 'category'
  | 'currency'
  | 'ignored';

const HEADER_ALIASES: Record<string, ColumnRole> = {
  id: 'id',
  date: 'date',
  'occurred on': 'date',
  'transaction date': 'date',
  'posting date': 'date',
  description: 'description',
  text: 'description',
  memo: 'description',
  merchant: 'description',
  payee: 'description',
  amount: 'amount',
  'amount (minor units)': 'amountMinor',
  value: 'amount',
  debit: 'amount',
  credit: 'amount',
  type: 'type',
  'transaction type': 'type',
  category: 'category',
  categoryid: 'category',
  currency: 'currency',
  'created at': 'ignored',
};

const COMPACT_ALIASES: Record<string, ColumnRole> = {
  id: 'id',
  date: 'date',
  occurredon: 'date',
  transactiondate: 'date',
  postingdate: 'date',
  description: 'description',
  text: 'description',
  memo: 'description',
  merchant: 'description',
  payee: 'description',
  name: 'description',
  amount: 'amount',
  amountminorunits: 'amountMinor',
  value: 'amount',
  debit: 'amount',
  credit: 'amount',
  type: 'type',
  transactiontype: 'type',
  category: 'category',
  categoryid: 'category',
  currency: 'currency',
  createdat: 'ignored',
};

function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Maps a header row to per-column roles. Falls back to Date-first order when no header is present. */
function detectColumnRoles(
  firstLine: readonly string[],
): { roles: readonly ColumnRole[]; isHeader: boolean } {
  const roles = firstLine.map((cell) => {
    const normalized = normalizeHeader(cell);
    if (HEADER_ALIASES[normalized]) return HEADER_ALIASES[normalized];
    return COMPACT_ALIASES[normalized.replace(/[^a-z0-9]/g, '')] ?? 'ignored';
  });

  const meaningful = roles.filter((role) => role !== 'ignored');
  const hasCoreColumn =
    roles.includes('date') ||
    roles.includes('description') ||
    roles.includes('amount') ||
    roles.includes('amountMinor') ||
    roles.includes('type');

  if (meaningful.length >= 2 && hasCoreColumn) {
    return { roles, isHeader: true };
  }
  return { roles: ['date', 'description', 'amount', 'type', 'category'], isHeader: false };
}

const DEFAULT_CATEGORY = 'Other';
const CATEGORY_BY_LABEL: Record<string, string> = {
  food: 'Food',
  groceries: 'Food',
  dining: 'Food',
  'food & dining': 'Food',
  transportation: 'Transportation',
  transport: 'Transportation',
  travel: 'Transportation',
  fuel: 'Transportation',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  bills: 'Bills',
  'bills & utilities': 'Bills',
  utilities: 'Bills',
  rent: 'Bills',
  housing: 'Bills',
  phone: 'Bills',
  internet: 'Bills',
  healthcare: 'Healthcare',
  health: 'Healthcare',
  'health & fitness': 'Healthcare',
  pharmacy: 'Healthcare',
  medical: 'Healthcare',
  income: 'Income',
  salary: 'Income',
  freelance: 'Income',
  other: 'Other',
};

function normalizeCategory(raw?: string): string {
  if (!raw) return DEFAULT_CATEGORY;
  const trimmed = raw.trim();
  if (isCategoryId(trimmed)) return trimmed;
  return CATEGORY_BY_LABEL[trimmed.toLowerCase()] ?? DEFAULT_CATEGORY;
}

const INCOME_TERMS = new Set([
  'income',
  'credit',
  'cr',
  'in',
  'revenue',
  'deposit',
  'refund',
  'salary',
]);
const EXPENSE_TERMS = new Set([
  'expense',
  'debit',
  'dr',
  'out',
  'withdrawal',
  'payment',
  'spend',
]);

function parseType(raw?: string): 'income' | 'expense' | null {
  if (!raw) return null;
  const term = raw.trim().toLowerCase();
  if (INCOME_TERMS.has(term)) return 'income';
  if (EXPENSE_TERMS.has(term)) return 'expense';
  return null;
}

/**
 * Parses locale-style amounts: strips currency symbols, handles thousand
 * separators for both 1,200.50 and 1.200,50 conventions, and supports
 * wrapping-parenthesis or leading-minus negatives.
 */
function parseAmount(raw: string | undefined, isMinor: boolean): number | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const negative =
    /^-/.test(trimmed) || /^\(.*\)$/.test(trimmed);
  let cleaned = trimmed.replace(/[^\d.,-]/g, '');
  if (!cleaned) return null;
  cleaned = cleaned.replace(/^-/, '');

  const lastDot = cleaned.lastIndexOf('.');
  const lastComma = cleaned.lastIndexOf(',');

  if (lastDot > -1 && lastComma > -1) {
    cleaned =
      lastDot > lastComma
        ? cleaned.replace(/,/g, '')
        : cleaned.replace(/\./g, '').replace(/,/, '.');
  } else if (lastComma > -1) {
    const digitCountAfter = cleaned.slice(lastComma + 1).length;
    const isThousands =
      cleaned.split(',').length > 2 || digitCountAfter === 3;
    cleaned = isThousands ? cleaned.replace(/,/g, '') : cleaned.replace(/,/, '.');
  } else if (lastDot > -1 && cleaned.split('.').length > 2) {
    cleaned = cleaned.replace(/\./g, '');
  }

  const amount = parseFloat(cleaned);
  if (!Number.isFinite(amount) || amount === 0) return null;

  const finalAmount = negative ? -amount : amount;
  if (!Number.isFinite(finalAmount) || Math.abs(finalAmount) > 999_999_999) return null;
  return isMinor ? finalAmount / 100 : finalAmount;
}

function parseDate(raw: string | undefined): Date | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const match = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/u.exec(trimmed);
  if (match) {
    const first = Number(match[1]);
    const second = Number(match[2]);
    const yearValue = Number(match[3]);
    const year = yearValue < 100 ? 2000 + yearValue : yearValue;

    let day: number;
    let month: number;
    if (second > 12) {
      day = second;
      month = first;
    } else {
      day = first;
      month = second;
    }

    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date;
    }
  }

  return null;
}

interface ParsedRow {
  date?: string;
  description?: string;
  amountRaw?: string;
  isMinor: boolean;
  typeRaw?: string;
  categoryRaw?: string;
}

function buildRow(cells: readonly string[], roles: readonly ColumnRole[]): ParsedRow {
  const row: ParsedRow = { isMinor: false };
  roles.forEach((role, index) => {
    const value = cells[index]?.trim();
    switch (role) {
      case 'date':
        row.date = value;
        break;
      case 'description':
        if (value && row.description === undefined) row.description = value;
        break;
      case 'amount':
        row.amountRaw = value;
        row.isMinor = false;
        break;
      case 'amountMinor':
        row.amountRaw = value;
        row.isMinor = true;
        break;
      case 'type':
        row.typeRaw = value;
        break;
      case 'category':
        row.categoryRaw = value;
        break;
    }
  });
  return row;
}

const MAX_REPORTED_ERRORS = 25;

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/** Canonical identity for one record: day-precision date + minor-unit amount + type + category + lowercased text. */
function recordKey(input: {
  text: string;
  amount: number;
  type: string;
  category: string;
  date: Date;
}): string {
  const { text, amount, type, category, date } = input;
  const day = `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
  return [text.trim().toLowerCase(), Math.round(Math.abs(amount) * 100), type, category, day].join('|');
}

export async function importTransactionsFromCsv(
  formData: FormData,
): Promise<ActionResult<ImportResult, never>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  const file = formData.get('file');
  if (!(file instanceof File) || !file.name.toLowerCase().endsWith('.csv')) {
    return { status: 'error', message: 'Please upload a valid CSV file.', retryable: false };
  }

  const MAX_IMPORT_BYTES = 2 * 1024 * 1024; // 2 MB
  if (file.size > MAX_IMPORT_BYTES) {
    return { status: 'error', message: 'CSV file must be under 2 MB.', retryable: false };
  }

  try {
    const rawText = (await file.text()).replace(/^\uFEFF/, '');
    // Normalize tab- and semicolon-delimited files so the parser can stay comma-based.
    const text = rawText.includes('\t') && !rawText.includes(',')
      ? rawText.split('\t').join(',')
      : rawText.includes(';') && !rawText.includes(',') && !rawText.includes('\t')
        ? rawText.split(';').join(',')
        : rawText;
    const lines = text.split(/\r?\n/);
    const MAX_IMPORT_ROWS = 10_000;
     if (lines.length > MAX_IMPORT_ROWS) {
       return { status: 'error', message: `CSV file cannot have more than ${MAX_IMPORT_ROWS.toLocaleString()} rows.`, retryable: false };
     }

    if (lines.length < 2) {
      return {
        status: 'error',
        message: 'CSV file must contain at least one data row.',
        retryable: false,
      };
    }

    const { roles, isHeader } = detectColumnRoles(parseCsvLine(lines[0]));
    const startIndex = isHeader ? 1 : 0;

    // Preload every existing record so re-importing an unchanged file is a no-op.
    const existingRows = await db.record.findMany({
      where: { userId: user.id },
      select: { text: true, amount: true, type: true, category: true, date: true },
    });
    const existingKeys = new Set(
      existingRows.map((row) =>
        recordKey({
          text: row.text,
          amount: Number(row.amount),
          type: row.type,
          category: row.category,
          date: row.date,
        }),
      ),
    );
    const seenInFile = new Set<string>();

    let skipped = 0;
    let duplicates = 0;
    const errors: string[] = [];
    const toCreate: Array<{ text: string; amount: number; type: string; category: string; date: Date; userId: string }> = [];

    for (let i = startIndex; i < lines.length; i++) {
      const lineNo = i + 1;
      const cells = parseCsvLine(lines[i]);
      if (cells.length === 1 && cells[0]?.trim() === '') continue;

      const row = buildRow(cells, roles);
      let reason: string | undefined;

      if (!row.description) {
        reason = 'missing description';
      } else if (row.amountRaw === undefined || !row.amountRaw) {
        reason = 'missing amount';
      } else {
        const amount = parseAmount(row.amountRaw, row.isMinor);
        if (amount === null) {
          reason = `invalid amount "${row.amountRaw}"`;
        } else if (row.date !== undefined && parseDate(row.date) === null) {
          reason = `invalid date "${row.date}"`;
        } else {
          const typeFromColumn = parseType(row.typeRaw);
          const categoryFromRow = normalizeCategory(row.categoryRaw);
          const isIncomeCategory = categoryFromRow === 'Income';
          const type = typeFromColumn ?? (isIncomeCategory ? 'income' : 'expense');
          const category =
            type === 'income'
              ? 'Income'
              : isIncomeCategory
                ? 'Other'
                : categoryFromRow;
          const date = row.date !== undefined ? (parseDate(row.date) as Date) : new Date();
          const description = row.description.slice(0, 120);
          const finalAmount = Math.abs(amount);

          const key = recordKey({ text: description, amount: finalAmount, type, category, date });
          if (existingKeys.has(key) || seenInFile.has(key)) {
            duplicates++;
            continue;
          }

          toCreate.push({
            text: description,
            amount: finalAmount,
            type,
            category,
            date,
            userId: user.id,
          });

          seenInFile.add(key);
          existingKeys.add(key);
          continue;
        }
      }

      skipped++;
      if (errors.length < MAX_REPORTED_ERRORS) {
        errors.push(`Row ${lineNo}: ${reason}`);
      }
    }

    let imported = 0;
    if (toCreate.length > 0) {
      // Batch in chunks of 500 to stay within DB limits and avoid large payloads
      const BATCH = 500;
      for (let i = 0; i < toCreate.length; i += BATCH) {
        const chunk = toCreate.slice(i, i + BATCH);
        const res = await db.record.createMany({ data: chunk });
        imported += res.count;
      }
    }

    if (skipped > errors.length) {
      errors.push(`...and ${skipped - errors.length} more row(s) skipped.`);
    }

    revalidatePath('/records');
    revalidatePath('/dashboard');
    await deleteCacheByPattern(CacheKey.userAllPattern(user.id));

    return {
      status: 'success',
      data: { imported, skipped, duplicates, errors },
      message: `Imported ${imported} transaction(s). ${duplicates} duplicate(s) skipped. ${skipped} row(s) skipped.`,
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
