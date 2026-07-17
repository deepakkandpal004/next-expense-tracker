import fc from "fast-check";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { formatDateTime, formatExactTime } from "@/lib/formatters/locale";
import { DateText } from "./data-display";

afterEach(cleanup);

const timestampArbitrary = fc
  .integer({ min: Date.UTC(2020, 0, 1), max: Date.UTC(2030, 11, 31) })
  .map((milliseconds) => new Date(milliseconds).toISOString());

describe("DateText timestamp property", () => {
  /** Validates: Requirements 14.10 */
  it("Property 15: human and exact times identify the same instant", () => {
    fc.assert(fc.property(timestampArbitrary, (timestamp) => {
      const options = { locale: "en-US", browserLocales: [], timeZone: "UTC" };
      const { container, unmount } = render(<DateText value={timestamp} format="date-time" {...options} />);
      const time = container.querySelector<HTMLTimeElement>("time");
      if (!time) throw new Error("Expected a rendered time element.");
      expect(time.dateTime).toBe(timestamp);
      expect(Date.parse(time.dateTime)).toBe(Date.parse(timestamp));
      expect(time.textContent).toBe(formatDateTime(timestamp, options));
      expect(time).toHaveAccessibleName(formatExactTime(timestamp, options));
      unmount();
    }), { numRuns: 100 });
  });
});
