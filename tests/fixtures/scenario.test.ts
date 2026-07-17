import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { FIXED_NOW, createIsolatedScenario } from "./scenario";

// This is an example-based tooling test, not one of the design's named properties.
describe("deterministic test scenario", () => {
  it("contains representative isolated states", () => {
    const scenario = createIsolatedScenario();

    expect(scenario.now).toBe(FIXED_NOW);
    expect(scenario.users).toHaveLength(2);
    expect(scenario.records.some((record) => record.type === "income")).toBe(true);
    expect(scenario.records.some((record) => record.type === "expense")).toBe(true);
    expect(scenario.budgets).toHaveLength(1);
    expect(scenario.ai.recommendations).toHaveLength(1);
    expect(scenario.appearances).toEqual(["light", "dark", "system"]);
    expect(scenario.densities).toEqual(["comfortable", "compact"]);
  });

  it("returns a fresh clone for every test", () => {
    const first = createIsolatedScenario();
    const second = createIsolatedScenario();

    first.users[0].name = "Changed only in this test";
    first.records.pop();

    expect(second.users[0].name).toBe("Primary Test User");
    expect(second.records).toHaveLength(3);
  });

  it("configures fast-check for at least 100 runs", () => {
    expect(fc.readConfigureGlobal().numRuns).toBeGreaterThanOrEqual(100);
  });
});
