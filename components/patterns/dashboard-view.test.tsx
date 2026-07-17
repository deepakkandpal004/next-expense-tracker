import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { aggregateDashboard } from "@/lib/domain/dashboard";
import type { AiDataUseDisclosure, ReportingPeriod, ResolvedPeriod, Transaction } from "@/lib/domain/types";

const actions = vi.hoisted(() => ({
  createTransaction: vi.fn(),
  getDashboardSnapshot: vi.fn(),
  setBudgetResult: vi.fn(),
}));
vi.mock("@/app/actions/addExpenseRecord", () => ({ createTransaction: actions.createTransaction }));
vi.mock("@/app/actions/getDashboardSnapshot", () => ({ getDashboardSnapshot: actions.getDashboardSnapshot }));
vi.mock("@/app/actions/setBudget", () => ({ setBudgetResult: actions.setBudgetResult }));
vi.mock("@/components/AddNewRecord", () => ({
  default: ({ submitTransaction }: { submitTransaction: (value: unknown) => Promise<unknown> }) => (
    <button onClick={() => void submitTransaction({ requestId: "request-1", command: {} })} type="button">Add transaction</button>
  ),
}));
vi.mock("@/components/patterns/chart-panel", () => ({
  ChartPanel: ({ model }: { model: { state: string; title: string } }) => (
    <section data-chart-state={model.state}><h2>{model.title}</h2></section>
  ),
}));
vi.mock("@/components/patterns/ai-highlight-list", () => ({
  AiHighlightList: () => <section><h2>AI highlights</h2></section>,
}));

import { DashboardView } from "./dashboard-view";

const resolvedPeriod: ResolvedPeriod = { kind: "custom", start: "2025-03-01", end: "2025-03-31", label: "Mar 1–31, 2025" };
const period: ReportingPeriod = { kind: "custom", start: resolvedPeriod.start, end: resolvedPeriod.end };
const disclosure: AiDataUseDisclosure = {
  version: "test", purpose: "Generate period insights.", fields: ["recorded totals"],
  providerRetention: { status: "unverified", statement: "Provider retention is unverified." },
};
const groceries: Transaction = {
  id: "expense-1", description: "Groceries", amountMinor: 2_500, currency: "INR", type: "expense",
  categoryId: "Food", occurredOn: "2025-03-08T12:00:00.000Z", createdAt: "2025-03-08T12:00:00.000Z",
};

function dashboard(records: readonly Transaction[] | undefined = [groceries], budget?: Parameters<typeof aggregateDashboard>[0]["budget"]) {
  return aggregateDashboard({ period: resolvedPeriod, currency: "INR", records, budget });
}

beforeEach(() => {
  actions.createTransaction.mockReset();
  actions.getDashboardSnapshot.mockReset();
  actions.setBudgetResult.mockReset();
});

describe("DashboardView presentation", () => {
  it("renders the stable programmatic order and wide-grid placement contract", () => {
    const { container } = render(<DashboardView dashboard={dashboard()} disclosure={disclosure} period={period} />);
    const headings = Array.from(container.querySelectorAll("h2"), (heading) => heading.textContent);
    expect(headings).toEqual([
      "Income and spending trend",
      "Recent records",
      "AI highlights",
      "Spending by category",
      "Want a deeper look?",
    ]);
    const reportingData = screen.getByLabelText("Dashboard reporting data");
    expect(reportingData).toHaveClass("lg:grid-cols-12");
    expect(reportingData.children[0]).toHaveClass("lg:col-span-8");
    expect(reportingData.children[1]).toHaveClass("lg:col-span-4");
    expect(screen.getByText("Groceries")).toBeInTheDocument();
  });

  it("distinguishes unavailable, not-configured, and exceeded metrics with period context", () => {
    const unavailable = aggregateDashboard({ period: resolvedPeriod, currency: "INR", records: undefined });
    const { rerender } = render(<DashboardView dashboard={unavailable} disclosure={disclosure} period={period} />);
    expect(screen.getAllByText("Unavailable").length).toBeGreaterThanOrEqual(4);
    expect(screen.getAllByText("Transaction data is unavailable for this reporting period.").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Set budget" })).toBeInTheDocument();

    rerender(<DashboardView dashboard={dashboard()} disclosure={disclosure} period={period} />);
    expect(screen.getByText("No budget set")).toBeInTheDocument();
    expect(screen.getByText("No monthly budget is configured for this period.")).toBeInTheDocument();

    const exceeded = dashboard([groceries], {
      id: "budget-1", userId: "user-1", amountMinor: 1_000, cadence: "monthly",
      effectiveFrom: "2025-03-01", currency: "INR",
    });
    rerender(<DashboardView dashboard={exceeded} disclosure={disclosure} period={period} />);
    expect(screen.getByText("Exceeded")).toBeInTheDocument();
    expect(screen.getByText(/Exceeded by ₹15\.00 for Mar 1–31, 2025\./)).toBeInTheDocument();
  });
});

describe("DashboardView isolated refresh", () => {
  it("keeps the last snapshot during failure and replaces all non-AI data on retry", async () => {
    const user = userEvent.setup();
    let resolveRefresh!: (result: unknown) => void;
    actions.createTransaction.mockResolvedValue({ status: "success", data: {}, message: "Transaction added." });
    actions.getDashboardSnapshot.mockImplementationOnce(() => new Promise((resolve) => { resolveRefresh = resolve; }));
    render(<DashboardView dashboard={dashboard()} disclosure={disclosure} period={period} />);

    await user.click(screen.getByRole("button", { name: "Add transaction" }));
    await waitFor(() => expect(actions.getDashboardSnapshot).toHaveBeenCalledWith(period));
    expect(screen.getByLabelText("Key metrics")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByLabelText("Dashboard reporting data")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Refreshing dashboard.");

    resolveRefresh({ status: "error", message: "Refresh unavailable.", retryable: true });
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Refresh unavailable.");
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Last successful data is still available.");

    const salary: Transaction = {
      ...groceries, id: "income-1", description: "Salary", amountMinor: 100_000,
      type: "income", categoryId: "Income", occurredOn: "2025-03-10T12:00:00.000Z",
    };
    actions.getDashboardSnapshot.mockResolvedValueOnce({
      status: "success", data: { dashboard: dashboard([groceries, salary]) }, message: "Dashboard refreshed.",
    });
    await user.click(within(alert).getByRole("button", { name: "Retry dashboard" }));

    expect(await screen.findByText("Salary")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Dashboard refreshed.");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Key metrics")).not.toHaveAttribute("aria-busy");
    expect(actions.getDashboardSnapshot).toHaveBeenCalledTimes(2);
  });
});