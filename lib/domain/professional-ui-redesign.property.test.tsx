import fc from "fast-check";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AccessibleChartTable } from "@/components/patterns/chart-panel";
import { Button, StatusRegion } from "@/components/ui";
import { aggregateDashboard } from "./dashboard";
import { projectNavigation } from "./navigation";
import { resolveAppearance } from "@/lib/preferences/preferences";
import type { ChartModel, ResolvedAppearance, ResolvedPeriod, Transaction } from "./types";

const period: ResolvedPeriod = {
  kind: "custom",
  start: "2025-03-01",
  end: "2025-03-31",
  label: "Mar 1, 2025 – Mar 31, 2025",
};

describe("professional UI redesign properties", () => {
  /** Feature: professional-ui-redesign, Property 1: Navigation projection preserves identity and order. */
  it("projects navigation without changing identity, label, or order", () => {
    fc.assert(fc.property(
      fc.uniqueArray(fc.stringMatching(/^[a-z][a-z0-9-]{0,12}$/), { minLength: 1, maxLength: 8 }),
      fc.nat(),
      (ids, currentIndex) => {
        const destinations = ids.map((id, index) => ({ id, label: `Destination ${index}` }));
        const current = destinations[currentIndex % destinations.length].id;
        const wide = projectNavigation(destinations, current, (id) => `/wide/${id}`);
        const compact = projectNavigation(destinations, current, (id) => `/compact/${id}`);
        expect(wide.map(({ id, label }) => ({ id, label }))).toEqual(destinations);
        expect(compact.map(({ id, label }) => ({ id, label }))).toEqual(destinations);
        expect(wide.filter((item) => item.current).map((item) => item.id)).toEqual([current]);
        expect(compact.filter((item) => item.current).map((item) => item.id)).toEqual([current]);
      },
    ));
  });

  /** Feature: professional-ui-redesign, Property 3: Reporting outputs carry complete context. */
  it("carries one resolved period through KPI, chart, and AI outputs", () => {
    fc.assert(fc.property(fc.integer({ min: 1, max: 1_000_000 }), (amountMinor) => {
      const transaction: Transaction = {
        id: "record", description: "Record", amountMinor, currency: "INR", type: "expense",
        categoryId: "Food", occurredOn: "2025-03-10T12:00:00.000Z", createdAt: "2025-03-10T12:00:00.000Z",
      };
      const dashboard = aggregateDashboard({ period, currency: "INR", records: [transaction] });
      expect(dashboard.period).toEqual(period);
      expect(dashboard.trend.periodLabel).toBe(dashboard.categories.periodLabel);
      expect(dashboard.trend.title).toBeTruthy();
      expect(dashboard.trend.unitLabel).toBe("INR");
      expect(dashboard.aiFactInputs.period).toEqual(period);
    }));
  });

  /** Feature: professional-ui-redesign, Property 11: Accessible chart data is visualization-equivalent. */
  it("renders every visual chart value in the accessible table", () => {
    fc.assert(fc.property(fc.array(fc.integer({ min: -1_000_000, max: 1_000_000 }), { maxLength: 20 }), (values) => {
      const model: ChartModel = {
        state: values.length ? "ready" : "empty",
        title: "Generated values",
        periodLabel: period.label,
        unit: "count",
        unitLabel: "records",
        series: [{ id: "value", label: "Value", semanticToken: "primary", symbol: "circle" }],
        rows: values.map((value, index) => ({ key: String(index), label: `Row ${index}`, values: [value], formattedValues: [String(value)] })),
      };
      const { container, unmount } = render(<AccessibleChartTable model={model} />);
      const tableValues = Array.from(container.querySelectorAll<HTMLElement>("[data-value]"), (cell) => Number(cell.dataset.value));
      expect(tableValues).toEqual(values);
      unmount();
    }));
  });

  /** Feature: professional-ui-redesign, Property 13: Passive status publication preserves focus. */
  it("publishes passive statuses without moving focus", () => {
    fc.assert(fc.property(fc.string({ minLength: 1, maxLength: 30 }), (detail) => {
      const { rerender, unmount } = render(<><button type="button">Keep focus</button><StatusRegion /></>);
      const control = screen.getByRole("button", { name: "Keep focus" });
      control.focus();
      rerender(<><button type="button">Keep focus</button><StatusRegion message={`Update complete: ${detail.toLowerCase()}`} visible /></>);
      expect(document.activeElement).toBe(control);
      unmount();
    }));
  });

  /** Feature: professional-ui-redesign, Property 14: Theme resolution honors explicit preference and system state. */
  it("resolves system appearance while explicit choices override it", () => {
    fc.assert(fc.property(
      fc.constantFrom("light" as ResolvedAppearance, "dark" as ResolvedAppearance),
      fc.constantFrom("light" as const, "dark" as const, "system" as const),
      (system, preference) => {
        expect(resolveAppearance(preference, system)).toBe(preference === "system" ? system : preference);
      },
    ));
  });

  /** Feature: professional-ui-redesign, Property 16: Density changes geometry, not semantics. */
  it("keeps control semantics and minimum targets across densities", () => {
    fc.assert(fc.property(fc.stringMatching(/^[A-Z][a-z]{1,12}$/), (noun) => {
      const label = `Open ${noun.toLowerCase()}`;
      const comfortable = render(<div data-density="comfortable"><Button label={label} /></div>);
      const comfortableButton = screen.getByRole("button", { name: label });
      const comfortableSemantics = { name: comfortableButton.textContent, type: comfortableButton.getAttribute("type") };
      expect(comfortableButton).toHaveClass("min-h-11", "min-w-11");
      comfortable.unmount();
      const compact = render(<div data-density="compact"><Button label={label} /></div>);
      const compactButton = screen.getByRole("button", { name: label });
      expect({ name: compactButton.textContent, type: compactButton.getAttribute("type") }).toEqual(comfortableSemantics);
      expect(compactButton).toHaveClass("min-h-11", "min-w-11");
      compact.unmount();
    }));
  });
});