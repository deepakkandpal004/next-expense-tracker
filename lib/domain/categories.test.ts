import { describe, expect, it } from "vitest";
import {
  CATEGORY_DEFINITIONS,
  CATEGORY_REGISTRY,
  EXPENSE_CATEGORY_IDS,
  UNKNOWN_CATEGORY_FALLBACK,
  getCategoryDefinition,
  isCategoryId,
} from "./categories";

describe("category registry", () => {
  it("preserves every existing persisted category identifier", () => {
    expect(CATEGORY_DEFINITIONS.map(({ id }) => id)).toEqual([
      "Food",
      "Transportation",
      "Shopping",
      "Entertainment",
      "Bills",
      "Healthcare",
      "Income",
      "Other",
    ]);
    expect(EXPENSE_CATEGORY_IDS).not.toContain("Income");
  });

  it("provides semantic, icon, and non-color metadata for each category", () => {
    for (const definition of CATEGORY_DEFINITIONS) {
      expect(definition.label).not.toBe("");
      expect(definition.semanticToken).toMatch(/^category-/);
      expect(definition.lucideIcon).not.toBe("");
      expect(definition.symbol).not.toBe("");
      expect(CATEGORY_REGISTRY[definition.id]).toBe(definition);
    }
  });

  it("uses the same deterministic fallback for every unknown value", () => {
    expect(getCategoryDefinition("Groceries")).toBe(UNKNOWN_CATEGORY_FALLBACK);
    expect(getCategoryDefinition("__proto__")).toBe(UNKNOWN_CATEGORY_FALLBACK);
    expect(getCategoryDefinition(null)).toBe(UNKNOWN_CATEGORY_FALLBACK);
    expect(UNKNOWN_CATEGORY_FALLBACK).toBe(CATEGORY_REGISTRY.Other);
    expect(isCategoryId("Food")).toBe(true);
    expect(isCategoryId("food")).toBe(false);
  });
});
