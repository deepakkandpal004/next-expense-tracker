import { test as base, expect } from "@playwright/test";
import { createIsolatedScenario } from "./scenario";
import type { TestScenario } from "./types";

type Fixtures = {
  scenario: TestScenario;
  blockExternalRequests: void;
};

export const test = base.extend<Fixtures>({
  scenario: async ({}, provide) => {
    await provide(createIsolatedScenario());
  },
  blockExternalRequests: [
    async ({ context, baseURL }, provide) => {
      const allowedOrigins = new Set([
        new URL(baseURL ?? "http://127.0.0.1:3100").origin,
        "http://127.0.0.1:3100",
        "http://localhost:3100",
      ]);

      await context.route("**/*", async (route) => {
        const url = new URL(route.request().url());
        if (!allowedOrigins.has(url.origin)) {
          await route.abort("blockedbyclient");
          return;
        }
        await route.continue();
      });

      await provide();
    },
    { auto: true },
  ],
});

export { expect };
