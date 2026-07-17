import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReportingPeriod, ResolvedPeriod, Transaction } from "@/lib/domain/types";

const navigation = vi.hoisted(() => ({
  params: new URLSearchParams(),
  pathname: "/records",
  push: vi.fn(),
}));
const actions = vi.hoisted(() => ({
  createTransaction: vi.fn(),
  deleteTransactionRecord: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push }),
  useSearchParams: () => navigation.params,
}));
vi.mock("@/app/actions/addExpenseRecord", () => ({ createTransaction: actions.createTransaction }));
vi.mock("@/app/actions/deleteRecord", () => ({ deleteTransactionRecord: actions.deleteTransactionRecord }));
vi.mock("@/components/AddNewRecord", () => ({
  default: () => <button type="button">Add transaction</button>,
}));

import { RecordsView } from "./records-view";

const period: ReportingPeriod = { kind: "custom", start: "2025-03-01", end: "2025-03-31" };
const resolvedPeriod: ResolvedPeriod = { ...period, label: "Mar 1–31, 2025" };
const records: readonly Transaction[] = [
  { id: "expense-1", description: "Groceries", amountMinor: 2450, currency: "INR", type: "expense", categoryId: "Food", occurredOn: "2025-03-08T12:00:00.000Z", createdAt: "2025-03-08T12:00:00.000Z" },
  { id: "income-1", description: "Salary", amountMinor: 100_000, currency: "INR", type: "income", categoryId: "Income", occurredOn: "2025-03-01T12:00:00.000Z", createdAt: "2025-03-01T12:00:00.000Z" },
];

function renderView(items: readonly Transaction[] = records) {
  return render(<RecordsView currency="INR" initialAddTransaction={false} period={period} records={items} resolvedPeriod={resolvedPeriod} />);
}

beforeEach(() => {
  navigation.params = new URLSearchParams();
  navigation.push.mockReset();
  actions.createTransaction.mockReset();
  actions.deleteTransactionRecord.mockReset();
});

describe("RecordsView selection and adaptive collection", () => {
  it("projects canonical URL filters, sort, chips, and result count", () => {
    navigation.params = new URLSearchParams("search=grocer&type=expense&category=Food&sort=amount-asc");
    renderView();

    expect(screen.getByLabelText("Search")).toHaveValue("grocer");
    expect(screen.getByLabelText("Type")).toHaveValue("expense");
    expect(screen.getByLabelText("Category")).toHaveValue("Food");
    expect(screen.getByLabelText("Sort")).toHaveValue("amount-asc");
    expect(screen.getByText("1 record shown")).toBeInTheDocument();
    expect(screen.getByText("Search: grocer")).toBeInTheDocument();
    expect(screen.getByText("Type: Expense")).toBeInTheDocument();
    expect(screen.getByText(/Category: Food/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "salary" } });
    expect(navigation.push).toHaveBeenLastCalledWith("/records?search=salary&type=expense&category=Food&sort=amount-asc");
  });

  it("clears only predicates while preserving the period and sort", async () => {
    navigation.params = new URLSearchParams("search=grocer&type=expense&category=Food&sort=amount-asc");
    renderView();
    await userEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    const destination = navigation.push.mock.calls[0][0] as string;
    const cleared = new URL(destination, "https://expense.test").searchParams;
    expect(Object.fromEntries(cleared)).toEqual({
      period: "custom",
      start: "2025-03-01",
      end: "2025-03-31",
      sort: "amount-asc",
    });
  });

  it("keeps every record value and action equivalent in table and card projections", () => {
    renderView([records[0]]);
    const table = screen.getByRole("table", { name: `Records for ${resolvedPeriod.label}` });
    const cardList = screen.getByRole("list", { name: `Records for ${resolvedPeriod.label}` });
    const tableRow = within(table).getByRole("row", { name: /Groceries/ });
    const card = within(cardList).getByRole("article");

    for (const value of ["Groceries", "Food", "Expense", "₹24.50"]) {
      expect(tableRow).toHaveTextContent(value);
      expect(card).toHaveTextContent(value);
    }
    expect(within(tableRow).getByRole("button", { name: "Delete transaction: Groceries" })).toBeInTheDocument();
    expect(within(card).getByRole("button", { name: "Delete transaction: Groceries" })).toBeInTheDocument();
  });
});

describe("RecordsView export and deletion recovery", () => {
  it("confirms the complete export scope and creates no file for an empty scope", async () => {
    const user = userEvent.setup();
    const { unmount } = renderView([records[0]]);
    await user.click(screen.getByRole("button", { name: "Export CSV" }));
    const dialog = screen.getByRole("dialog", { name: "Export records" });
    expect(dialog).toHaveTextContent(resolvedPeriod.label);
    expect(dialog).toHaveTextContent("CSV");
    expect(dialog).toHaveTextContent("Included columns");
    expect(dialog).toHaveTextContent("Description");
    expect(within(dialog).getByRole("button", { name: "Download CSV" })).toBeEnabled();

    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    unmount();
    renderView([]);
    await user.click(screen.getByRole("button", { name: "Export CSV" }));
    const emptyDialog = screen.getByRole("dialog", { name: "Export records" });
    expect(emptyDialog).toHaveTextContent("Nothing to export");
    expect(within(emptyDialog).getByRole("button", { name: "Download CSV" })).toBeDisabled();
  });

  it("retains a failed deletion, retries with the same token, then announces success", async () => {
    const user = userEvent.setup();
    actions.deleteTransactionRecord
      .mockResolvedValueOnce({ status: "error", message: "Delete failed.", retryable: true })
      .mockResolvedValueOnce({ status: "success", data: undefined, message: "Transaction deleted." });
    renderView([records[0]]);

    await user.click(screen.getAllByRole("button", { name: "Delete transaction: Groceries" })[0]);
    const confirmation = await screen.findByRole("alertdialog", { name: "Delete transaction" });
    expect(confirmation).toHaveTextContent("Groceries");
    expect(confirmation).toHaveTextContent("₹24.50");
    await user.click(within(confirmation).getByRole("button", { name: "Delete transaction" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Delete failed.");
    expect(screen.getAllByText("Groceries").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "Retry delete" }));
    await waitFor(() => expect(screen.queryByText("Groceries")).not.toBeInTheDocument());
    expect(screen.getByRole("status")).toHaveTextContent("Transaction deleted.");
    expect(actions.deleteTransactionRecord).toHaveBeenCalledTimes(2);
    expect(actions.deleteTransactionRecord.mock.calls[1][0].requestId)
      .toBe(actions.deleteTransactionRecord.mock.calls[0][0].requestId);
  });
});