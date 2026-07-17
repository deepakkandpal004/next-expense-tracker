import type { TestRecord } from "./types";

export const RECORDS = [
  {
    id: "record-expense-0001",
    userId: "user-primary-0001",
    text: "Weekly groceries",
    amount: 2450.75,
    type: "expense",
    category: "Food",
    date: "2025-03-05T00:00:00.000Z",
    createdAt: "2025-03-05T08:30:00.000Z",
  },
  {
    id: "record-income-0002",
    userId: "user-primary-0001",
    text: "Monthly salary",
    amount: 85000,
    type: "income",
    category: "Income",
    date: "2025-03-01T00:00:00.000Z",
    createdAt: "2025-03-01T06:00:00.000Z",
  },
  {
    id: "record-secondary-0003",
    userId: "user-secondary-0002",
    text: "Private secondary record",
    amount: 999,
    type: "expense",
    category: "Other",
    date: "2025-03-02T00:00:00.000Z",
    createdAt: "2025-03-02T09:00:00.000Z",
  },
] as const satisfies readonly TestRecord[];
