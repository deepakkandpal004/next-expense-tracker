import { describe, it, expect } from "vitest";
import {
  CATEGORY_IDS,
  CATEGORY_DEFINITIONS,
  CATEGORY_REGISTRY,
  EXPENSE_CATEGORY_IDS,
  isCategoryId,
  getCategoryDefinition,
} from "@/lib/domain/categories";

describe("categories", () => {
  it("exports the correct category IDs", () => {
    expect(CATEGORY_IDS).toEqual([
      "Food",
      "Transportation",
      "Shopping",
      "Entertainment",
      "Bills",
      "Healthcare",
      "Income",
      "Other",
    ]);
  });

  it("each definition has required fields", () => {
    for (const def of CATEGORY_DEFINITIONS) {
      expect(def.id).toBeTruthy();
      expect(def.label).toBeTruthy();
      expect(def.semanticToken).toMatch(/^category-/);
      expect(def.lucideIcon).toBeTruthy();
      expect(def.symbol).toBeTruthy();
    }
  });

  it("registry contains all definitions", () => {
    for (const id of CATEGORY_IDS) {
      expect(CATEGORY_REGISTRY[id]).toBeDefined();
      expect(CATEGORY_REGISTRY[id].id).toBe(id);
    }
  });

  it("expense categories exclude Income", () => {
    expect(EXPENSE_CATEGORY_IDS).not.toContain("Income");
    expect(EXPENSE_CATEGORY_IDS.length).toBe(CATEGORY_IDS.length - 1);
  });

  it("isCategoryId validates correctly", () => {
    expect(isCategoryId("Food")).toBe(true);
    expect(isCategoryId("Income")).toBe(true);
    expect(isCategoryId("Invalid")).toBe(false);
    expect(isCategoryId("")).toBe(false);
    expect(isCategoryId(null)).toBe(false);
    expect(isCategoryId(undefined)).toBe(false);
  });

  it("getCategoryDefinition returns correct definition", () => {
    const def = getCategoryDefinition("Food");
    expect(def.id).toBe("Food");
    expect(def.label).toBe("Food & dining");
  });

  it("getCategoryDefinition returns Other fallback for unknown", () => {
    const def = getCategoryDefinition("Unknown");
    expect(def.id).toBe("Other");
  });
});
