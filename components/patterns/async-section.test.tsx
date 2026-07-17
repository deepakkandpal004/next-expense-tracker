import { act, fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AsyncSection, BUSY_FEEDBACK_DELAY_MS, isBlockingOverlayAllowed } from "./async-section";

afterEach(() => vi.useRealTimers());

describe("AsyncSection", () => {
  it("reserves loading geometry, exposes immediate textual busy status, and delays visible progress", () => {
    vi.useFakeTimers();
    render(<AsyncSection label="Recent transactions" minimumHeight="16rem" state="loading" />);

    const section = screen.getByRole("region", { name: "Recent transactions" });
    expect(section).toHaveAttribute("aria-busy", "true");
    expect(section).toHaveStyle({ minHeight: "16rem" });
    expect(screen.getByRole("status", { name: "Loading recent transactions" })).toHaveStyle({ minHeight: "16rem" });

    const busyStatus = screen.getByText("Recent transactions is refreshing.");
    expect(busyStatus).toHaveClass("sr-only");
    act(() => vi.advanceTimersByTime(BUSY_FEEDBACK_DELAY_MS));
    expect(busyStatus).not.toHaveClass("sr-only");
  });

  it("keeps successful content and external focus stable while a scoped section refreshes", () => {
    const { rerender } = render(
      <div>
        <button type="button">Change reporting period</button>
        <AsyncSection label="Recent transactions" state="ready"><p>March transactions</p></AsyncSection>
      </div>,
    );
    const periodButton = screen.getByRole("button", { name: "Change reporting period" });
    periodButton.focus();

    rerender(
      <div>
        <button type="button">Change reporting period</button>
        <AsyncSection label="Recent transactions" pending state="ready"><p>March transactions</p></AsyncSection>
      </div>,
    );

    expect(screen.getByText("March transactions")).toBeInTheDocument();
    expect(document.activeElement).toBe(periodButton);
    expect(screen.getByRole("region", { name: "Recent transactions" })).toHaveAttribute("aria-busy", "true");
  });

  it("renders first-content and filtered empty states with their required recovery actions", () => {
    const { rerender } = render(
      <AsyncSection
        empty={{ action: <button type="button">Add transaction</button>, description: "Track income and expenses here.", title: "No transactions yet" }}
        label="Transactions"
        state="empty"
      />,
    );
    expect(screen.getByRole("heading", { name: "No transactions yet" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add transaction" })).toBeInTheDocument();

    rerender(
      <AsyncSection
        filteredEmpty={{ action: <button type="button">Clear filters</button>, description: "No transactions match the current filters.", scope: "Expense · Housing", title: "No matching transactions" }}
        label="Transactions"
        state="filtered-empty"
      />,
    );
    expect(screen.getByText("Expense · Housing")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
  });

  it("scopes failures, announces recovery, and leaves a passive status focused where it was", () => {
    const retry = vi.fn();
    const { rerender } = render(
      <div>
        <button type="button">Change reporting period</button>
        <AsyncSection failure={{ description: "We could not load this section.", onRetry: retry, retryLabel: "Retry transactions" }} label="Recent transactions" state="error" />
      </div>,
    );
    const periodButton = screen.getByRole("button", { name: "Change reporting period" });
    periodButton.focus();
    fireEvent.click(screen.getByRole("button", { name: "Retry transactions" }));
    expect(retry).toHaveBeenCalledOnce();

    rerender(
      <div>
        <button type="button">Change reporting period</button>
        <AsyncSection label="Recent transactions" state="ready" status={{ message: "Transactions updated" }}><p>Recovered transactions</p></AsyncSection>
      </div>,
    );

    expect(screen.getByText("Recovered transactions")).toBeInTheDocument();
    expect(screen.getByText("Recent transactions recovered.")).toBeInTheDocument();
    expect(document.activeElement).toBe(periodButton);
  });

  it("moves focus and explains the move only for immediate-action statuses", () => {
    function RequiredActionStatus() {
      const target = useRef<HTMLButtonElement>(null);
      return <div><button ref={target} type="button">Fix section</button><AsyncSection label="Recent transactions" state="ready" status={{ message: "Transaction details need attention", priority: "action-required", requiredActionRef: target }} /></div>;
    }

    render(<RequiredActionStatus />);
    expect(screen.getByRole("button", { name: "Fix section" })).toHaveFocus();
    expect(screen.getByRole("alert")).toHaveTextContent("Focus moved to the required action.");
  });

  it("permits blocking overlays only for operations that cannot continue underneath", () => {
    expect(isBlockingOverlayAllowed("section-refresh")).toBe(false);
    expect(isBlockingOverlayAllowed("background-mutation")).toBe(false);
    expect(isBlockingOverlayAllowed("requires-completion-or-cancellation")).toBe(true);
  });
});
