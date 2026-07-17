import { describe, expect, it, vi } from "vitest";
import { createActionBoundary, invalid, parsed } from "./action-boundary";

describe("typed authorized action boundary", () => {
  it("authenticates, authorizes, parses, executes, then revalidates", async () => {
    const calls: string[] = [];
    const run = createActionBoundary({ authenticate: async () => ({ id: "user-1" }), revalidate: (path) => { calls.push(`revalidate:${path}`); } });
    const result = await run({ scope: "transaction", input: "draft", authorize: () => { calls.push("authorize"); return true; }, parse: (input) => { calls.push("parse"); return parsed(input.trim()); }, execute: async (actor, value) => { calls.push(`execute:${actor.userId}:${value}`); return { value }; }, message: "Transaction added.", revalidatePaths: ["/dashboard", "/records"] });
    expect(result).toEqual({ status: "success", data: { value: "draft" }, message: "Transaction added." });
    expect(calls).toEqual(["authorize", "parse", "execute:user-1:draft", "revalidate:/dashboard", "revalidate:/records"]);
  });

  it("returns retained draft data for validation and recoverable execution failures", async () => {
    const run = createActionBoundary({ authenticate: async () => ({ id: "user-1" }), revalidate: vi.fn() });
    const validation = await run({ scope: "transaction", input: { description: "" }, parse: () => invalid({ description: ["Enter a description."] }, "Correct the highlighted field."), execute: async () => ({}) as never, message: "unused", preserve: (draft) => ({ draft }) });
    expect(validation).toEqual({ status: "validation-error", data: { draft: { description: "" } }, fieldErrors: { description: ["Enter a description."] }, message: "Correct the highlighted field." });
    const failure = await run({ scope: "ai", input: { question: "Where did I spend?" }, parse: parsed, execute: async () => { throw new Error("provider unavailable"); }, message: "unused", preserve: (draft) => ({ draft }) });
    expect(failure).toEqual({ status: "error", data: { draft: { question: "Where did I spend?" } }, message: "The operation could not be completed. Please retry.", retryable: true });
  });

  it("denies unauthenticated and unauthorized requests without running the command", async () => {
    const execute = vi.fn();
    const anonymous = createActionBoundary({ authenticate: async () => null, revalidate: vi.fn() });
    const anonymousResult = await anonymous({ scope: "record", input: "record-2", parse: parsed, execute, message: "unused" });
    expect(anonymousResult).toMatchObject({ status: "error", retryable: false });
    const authenticated = createActionBoundary({ authenticate: async () => ({ id: "user-1" }), revalidate: vi.fn() });
    const deniedResult = await authenticated({ scope: "record", input: "record-2", authorize: () => ({ message: "Record unavailable." }), parse: parsed, execute, message: "unused" });
    expect(deniedResult).toMatchObject({ status: "error", message: "Record unavailable.", retryable: false });
    expect(execute).not.toHaveBeenCalled();
  });
});
