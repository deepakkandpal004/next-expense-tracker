import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  AlertDialog,
  CompactNavigation,
  ConfirmDestructiveAction,
  Dialog,
  DropdownMenu,
  Sheet,
  Tooltip,
} from "./index";

describe("focus-managed overlays", () => {
  it("moves focus to the dialog heading and restores its trigger after Escape", async () => {
    const user = userEvent.setup();
    render(<Dialog title="Add transaction" trigger={<button type="button">Open transaction form</button>}><button type="button">Save draft</button></Dialog>);

    const trigger = screen.getByRole("button", { name: "Open transaction form" });
    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: "Add transaction" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Add transaction" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Add transaction" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("uses a full-height sheet with a focus-managed close path", async () => {
    const user = userEvent.setup();
    render(<Sheet title="Record filters" trigger={<button type="button">Open filters</button>}><button type="button">Apply filters</button></Sheet>);

    const trigger = screen.getByRole("button", { name: "Open filters" });
    await user.click(trigger);
    const sheet = screen.getByRole("dialog", { name: "Record filters" });
    expect(sheet).toHaveClass("h-[100dvh]", "w-full");
    expect(screen.getByRole("heading", { name: "Record filters" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });

  it("renders destructive record context and prevents duplicate confirmation while processing", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ConfirmDestructiveAction consequence="This permanently removes the transaction." onConfirm={onConfirm} processing record={{ description: "Groceries", amount: "₹1,250.00", date: "March 8, 2025" }} trigger={<button type="button">Delete groceries</button>} />);

    const trigger = screen.getByRole("button", { name: "Delete groceries" });
    await user.click(trigger);
    expect(screen.getByRole("alertdialog", { name: "Delete transaction" })).toHaveTextContent("Groceries");
    expect(screen.getByRole("alertdialog")).toHaveTextContent("₹1,250.00");
    expect(screen.getByRole("alertdialog")).toHaveTextContent("March 8, 2025");
    expect(screen.getByText("This permanently removes the transaction.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete transaction" })).toBeDisabled();
  });
});

describe("menu and compact navigation primitives", () => {
  it("opens a labeled menu and restores focus to its trigger after Escape", async () => {
    const user = userEvent.setup();
    render(<DropdownMenu items={[{ id: "settings", label: "Settings" }, { id: "sign-out", label: "Sign out" }]} label="Account actions" trigger={<button type="button">Open account actions</button>} />);

    const trigger = screen.getByRole("button", { name: "Open account actions" });
    await user.click(trigger);
    expect(screen.getByRole("menu", { name: "Account actions" })).toHaveTextContent("Settings");
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });

  it("keeps compact-navigation destination order, current state, and escape restoration", async () => {
    const user = userEvent.setup();
    render(<CompactNavigation items={[
      { id: "dashboard", label: "Dashboard", href: "/dashboard", current: true },
      { id: "records", label: "Records", href: "/records" },
      { id: "insights", label: "Insights", href: "/insights" },
    ]} />);

    const trigger = screen.getByRole("button", { name: "Menu" });
    await user.click(trigger);
    expect(screen.getByRole("heading", { name: "Navigation menu" })).toHaveFocus();
    const links = screen.getAllByRole("link").map((link) => link.textContent);
    expect(links).toEqual(["DashboardCurrent", "Records", "Insights"]);
    expect(screen.getByRole("link", { name: /Dashboard/ })).toHaveAttribute("aria-current", "page");

    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });

  it("allows alert-dialog cancellation and restores the initiating control", async () => {
    const user = userEvent.setup();
    render(<AlertDialog action={{ label: "Delete record" }} cancel={{ label: "Cancel" }} title="Delete record" trigger={<button type="button">Open delete confirmation</button>}>This action cannot be undone.</AlertDialog>);

    const trigger = screen.getByRole("button", { name: "Open delete confirmation" });
    await user.click(trigger);
    expect(screen.getByRole("heading", { name: "Delete record" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(trigger).toHaveFocus();
  });
});


describe("tooltip primitive", () => {
  it("exposes supplementary content from a keyboard-focused named trigger", async () => {
    const user = userEvent.setup();
    render(<Tooltip content="Delete transaction" delayDuration={0}><button type="button">Delete transaction</button></Tooltip>);

    await user.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Delete transaction");
  });
});
