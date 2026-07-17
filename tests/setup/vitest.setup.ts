import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import fc from "fast-check";
import { afterEach, beforeEach, vi } from "vitest";

const configuredRuns = Number.parseInt(
  process.env.FAST_CHECK_NUM_RUNS ?? "100",
  10,
);
const configuredSeed = Number.parseInt(
  process.env.FAST_CHECK_SEED ?? "20250308",
  10,
);

fc.configureGlobal({
  numRuns: Number.isFinite(configuredRuns) ? Math.max(100, configuredRuns) : 100,
  seed: Number.isFinite(configuredSeed) ? configuredSeed : 20250308,
  verbose: 1,
});

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn((input: RequestInfo | URL) =>
      Promise.reject(
        new Error(
          `Real network access is disabled in routine tests: ${String(input)}`,
        ),
      ),
    ),
  );
});

afterEach(() => {
  cleanup();
});

class MemoryStorage implements Storage {
  readonly #values = new Map<string, string>();

  get length(): number { return this.#values.size; }
  clear(): void { this.#values.clear(); }
  getItem(key: string): string | null { return this.#values.get(key) ?? null; }
  key(index: number): string | null { return Array.from(this.#values.keys())[index] ?? null; }
  removeItem(key: string): void { this.#values.delete(key); }
  setItem(key: string, value: string): void { this.#values.set(String(key), String(value)); }
}

const localStorageMock = new MemoryStorage();
const sessionStorageMock = new MemoryStorage();
Object.defineProperty(globalThis, "localStorage", { configurable: true, value: localStorageMock });
Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: sessionStorageMock });
Object.defineProperty(window, "localStorage", { configurable: true, value: localStorageMock });
Object.defineProperty(window, "sessionStorage", { configurable: true, value: sessionStorageMock });

Object.defineProperty(window, "matchMedia", {
  configurable: true,
  value: vi.fn((query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  })),
});

class ResizeObserverMock implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
Object.defineProperty(globalThis, "ResizeObserver", { configurable: true, value: ResizeObserverMock });

beforeEach(() => {
  localStorageMock.clear();
  sessionStorageMock.clear();
});