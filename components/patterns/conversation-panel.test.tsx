import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AiConversationAnswer, AiDataUseDisclosure, ReportingPeriod } from "@/lib/domain/types";
import { ConversationPanel } from "./conversation-panel";

const period: ReportingPeriod = { kind: "custom", start: "2025-03-01", end: "2025-03-31" };
const disclosure: AiDataUseDisclosure = {
  version: "test-version",
  purpose: "Answer a question from the selected reporting period.",
  fields: ["recorded totals", "submitted question"],
  providerRetention: { status: "unverified", statement: "Provider retention is unverified." },
};
const answer: AiConversationAnswer = {
  source: "ai-generated",
  question: "Where did I spend the most?",
  answer: "Food was the largest recorded spending category.",
  facts: [{ label: "Recorded spending: Food", value: "INR 500.00", source: "recorded-data" }],
  period: { kind: "custom", start: "2025-03-01", end: "2025-03-31", label: "Mar 1–31, 2025" },
  generatedAt: "2025-03-31T12:00:00.000Z",
  disclaimer: "Informational only.",
  disclosure,
  stale: false,
};

function readyResult() {
  return { status: "success" as const, data: { state: "ready" as const, answer }, message: "AI answer generated." };
}

describe("ConversationPanel", () => {
  it("requires first-use disclosure, retains the pending question, and announces the answer", async () => {
    const user = userEvent.setup();
    let resolveAnswer!: (value: ReturnType<typeof readyResult>) => void;
    const pending = new Promise<ReturnType<typeof readyResult>>((resolve) => { resolveAnswer = resolve; });
    const loadAnswer = vi.fn(() => pending);
    render(<ConversationPanel disclosure={disclosure} loadAnswer={loadAnswer} period={period} />);

    expect(screen.getByRole("heading", { name: "AI data-use disclosure" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continue and ask a question" }));
    const question = screen.getByLabelText(/Question/);
    await user.type(question, answer.question);
    await user.click(screen.getByRole("button", { name: "Ask" }));
    expect(question).toHaveValue(answer.question);
    expect(screen.getByRole("button", { name: "Ask" })).toHaveAttribute("aria-busy", "true");
    resolveAnswer(readyResult());
    expect(await screen.findByText(answer.answer)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Answer is available.");
    expect(screen.getByText("Recorded data facts")).toBeInTheDocument();
    expect(screen.getByText("AI-generated answer")).toBeInTheDocument();
  });

  it("retries the exact failed question without disabling core controls", async () => {
    const user = userEvent.setup();
    const loadAnswer = vi.fn()
      .mockRejectedValueOnce(new Error("provider unavailable"))
      .mockResolvedValueOnce(readyResult());
    render(<ConversationPanel disclosure={disclosure} loadAnswer={loadAnswer} period={period} />);
    await user.click(screen.getByRole("button", { name: "Continue and ask a question" }));
    await user.type(screen.getByLabelText(/Question/), answer.question);
    await user.click(screen.getByRole("button", { name: "Ask" }));
    expect(await screen.findByText("The answer could not be generated. Please retry.")).toBeInTheDocument();
    expect(screen.getByLabelText(/Question/)).toHaveValue(answer.question);
    await user.click(screen.getByRole("button", { name: "Retry question" }));
    expect(await screen.findByText(answer.answer)).toBeInTheDocument();
    expect(loadAnswer).toHaveBeenCalledTimes(2);
    expect(loadAnswer.mock.calls[0][0].question).toBe(answer.question);
    expect(loadAnswer.mock.calls[1][0].question).toBe(answer.question);
    expect(screen.getByRole("button", { name: "Ask" })).toBeEnabled();
  });
});