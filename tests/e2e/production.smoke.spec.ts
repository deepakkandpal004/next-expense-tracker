import { test, expect } from "../fixtures/playwright";

test("@smoke production build serves the public route", async ({ page, scenario }) => {
  const response = await page.goto("/");

  expect(response?.ok()).toBe(true);
  await expect(page.locator("body")).toBeVisible();
  expect(scenario.now).toBe("2025-03-08T12:00:00.000Z");
});
