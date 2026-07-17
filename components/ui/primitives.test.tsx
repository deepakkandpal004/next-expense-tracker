import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Alert,
  Button,
  CurrencyText,
  DataTable,
  DateText,
  EmptyState,
  Field,
  IconButton,
  LinkButton,
  PRIMITIVE_REGISTRY,
  PRIMITIVE_STATES,
  Select,
  Skeleton,
  StatusRegion,
  Tabs,
  enforceActionLabel,
  enforceAccessibleName,
  registryIssues,
} from "./index";

describe("primitive registry and content conventions", () => {
  it("documents every task primitive and has no structural issues", () => {
    expect(Object.keys(PRIMITIVE_REGISTRY)).toEqual([
      "Button", "IconButton", "LinkButton", "Field", "Select", "Tabs",
      "Dialog", "Sheet", "AlertDialog", "DropdownMenu", "CompactNavigation", "ConfirmDestructiveAction",
      "Badge", "Card", "DataTable", "Tooltip", "Alert", "StatusRegion",
      "Skeleton", "EmptyState", "ErrorState", "SectionHeader", "CurrencyText", "DateText",
    ]);
    expect(PRIMITIVE_STATES).toEqual([
      "default", "hover", "focus", "active", "disabled", "loading", "invalid", "success",
    ]);
    expect(registryIssues()).toEqual([]);
  });

  it("rejects title case, noun-led actions, and name mismatches", () => {
    expect(() => enforceActionLabel("Save Changes")).toThrow(/sentence case/);
    expect(() => enforceActionLabel("Transaction details")).toThrow(/begin with an action/);
    expect(() => enforceAccessibleName("Delete transaction", "Remove item")).toThrow(/must match/);
  });
});

describe("action primitives", () => {
  it("uses matching visible names, state metadata, and prevents duplicate loading actions", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<Button icon={<span>+</span>} label="Add transaction" onClick={onClick} />);

    const button = screen.getByRole("button", { name: "Add transaction" });
    await user.click(button);
    expect(onClick).toHaveBeenCalledOnce();
    expect(button).toHaveClass("min-h-11", "min-w-11");
    expect(button).toHaveAttribute("data-state", "default");
    expect(button.querySelector("[aria-hidden='true']")).toBeInTheDocument();

    rerender(<Button label="Add transaction" loading onClick={onClick} />);
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("data-state", "loading");
  });

  it("gives icon-only and link actions complete semantics", () => {
    render(<div><IconButton icon={<span>×</span>} label="Delete transaction" /><LinkButton href="/records" label="View all transactions" state="invalid" /></div>);
    expect(screen.getByRole("button", { name: "Delete transaction" })).toHaveClass("min-h-11", "min-w-11");
    const link = screen.getByRole("link", { name: "View all transactions" });
    expect(link).toHaveAttribute("href", "/records");
    expect(link).toHaveAttribute("aria-invalid", "true");
    expect(link).toHaveAttribute("data-state", "invalid");
    expect(link).toHaveClass("min-h-11", "min-w-11");
  });
});

describe("form and selection primitives", () => {
  it("associates visible field labels, descriptions, errors, and required state", () => {
    render(<Field description="Use the merchant name" error="Enter a description" id="description" label="Description" required />);
    const field = screen.getByRole("textbox", { name: /Description/ });
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAttribute("aria-required", "true");
    expect(field).toHaveAccessibleDescription("Use the merchant name Enter a description");
  });

  it("exposes select and tab state programmatically with 44px target classes", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Select id="category" label="Category" options={[{ value: "housing", label: "Housing" }]} />
        <Tabs label="Chart view" items={[
          { value: "trend", label: "Spending trend", content: "Trend content" },
          { value: "category", label: "Category distribution", content: "Category content" },
        ]} />
      </>,
    );
    expect(screen.getByRole("combobox", { name: "Category" })).toHaveClass("min-h-11");
    const categoryTab = screen.getByRole("tab", { name: "Category distribution" });
    await user.click(categoryTab);
    expect(categoryTab).toHaveAttribute("aria-selected", "true");
    expect(categoryTab).toHaveClass("min-h-11", "min-w-11");
  });

  it("marks loading fields, selects, and tab groups as busy and unavailable", () => {
    render(
      <>
        <Field id="description" label="Description" loading />
        <Select id="category" label="Category" loading options={[{ value: "housing", label: "Housing" }]} />
        <Tabs label="Chart view" loading items={[{ value: "trend", label: "Spending trend", content: "Trend content" }]} />
      </>,
    );

    const field = screen.getByRole("textbox", { name: "Description" });
    const select = screen.getByRole("combobox", { name: "Category" });
    expect(field).toBeDisabled();
    expect(field).toHaveAttribute("aria-busy", "true");
    expect(field).toHaveAttribute("data-state", "loading");
    expect(select).toBeDisabled();
    expect(select).toHaveAttribute("aria-busy", "true");
    expect(select).toHaveAttribute("data-state", "loading");

    const tabList = screen.getByRole("tablist", { name: "Chart view" });
    expect(tabList.parentElement).toHaveAttribute("aria-busy", "true");
    expect(tabList.parentElement).toHaveAttribute("data-state", "loading");
    expect(screen.getByRole("tab", { name: "Spending trend" })).toBeDisabled();
  });
});

describe("data and feedback primitives", () => {
  it("preserves complete values in semantic tables", () => {
    const rows = [{ id: "1", description: "A complete description", amount: "₹123,456,789.00" }];
    render(<DataTable caption="Transactions" columns={[
      { id: "description", header: "Description", rowHeader: true, render: (row: typeof rows[number]) => row.description },
      { id: "amount", header: "Amount", align: "end", render: (row: typeof rows[number]) => row.amount },
    ]} rowKey={(row) => row.id} rows={rows} />);
    expect(screen.getByRole("table", { name: "Transactions" })).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "A complete description" })).toHaveClass("whitespace-normal", "break-words");
    expect(screen.getByText("₹123,456,789.00")).not.toHaveClass("truncate");
  });

  it("uses shared locale formatters and exact accessible alternatives", () => {
    render(
      <>
        <CurrencyText browserLocales={[]} currency="INR" locale="en-IN" minorValue={123450} />
        <DateText browserLocales={[]} locale="en-US" timeZone="UTC" value="2025-03-08T12:30:00Z" />
      </>,
    );
    expect(screen.getByText("₹1,234.50")).toHaveAttribute("aria-label", "INR 1,234.50");
    const date = screen.getByText("Mar 8, 2025");
    expect(date).toHaveAttribute("datetime", "2025-03-08T12:30:00Z");
    expect(date).toHaveAttribute("title", expect.stringContaining("2025"));
  });

  it("provides appropriate status, alert, loading, and empty semantics", () => {
    render(
      <>
        <StatusRegion message="Transaction added" />
        <Alert title="Export failed" tone="danger" />
        <Skeleton label="Loading transactions" minimumHeight="10rem" />
        <EmptyState description="Add a transaction to begin tracking." title="No transactions yet" />
      </>,
    );
    expect(screen.getByRole("status", { name: "" })).toHaveTextContent("Transaction added");
    expect(screen.getByRole("alert")).toHaveTextContent("Export failed");
    expect(screen.getByText("Loading transactions").parentElement).toHaveStyle({ minHeight: "10rem" });
    expect(screen.getByRole("heading", { name: "No transactions yet" })).toBeInTheDocument();
  });
});
