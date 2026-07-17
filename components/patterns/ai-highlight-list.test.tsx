import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AiHighlightList, type AiHighlightsLoader } from "./ai-highlight-list";
import type { AiDataUseDisclosure, AiInsightSet, ReportingPeriod } from "@/lib/domain/types";

const period: ReportingPeriod = { kind: "custom", start: "2025-03-01", end: "2025-03-31" };
const disclosure: AiDataUseDisclosure = {
  version: "test-disclosure-v1",
  purpose: "Generate informational spending interpretations from your selected reporting period.",
  fields: ["recorded transaction count", "recorded spending totals by category"],
  providerRetention: { status: "unverified", statement: "Provider retention behavior has not been verified." },
};
const insightSet: AiInsightSet = {
  source: "ai-generated",
  period: { kind: "custom", start: "2025-03-01", end: "2025-03-31", label: "Mar 1, 2025 – Mar 31, 2025" },
  generatedAt: "2025-03-31T10:15:00.000Z",
  facts: [{ label: "Recorded spending", value: "INR 500.00", source: "recorded-data" }],
  interpretations: [{ id: "interpretation-1", title: "Spending increased", kind: "warning", text: "Recorded spending was higher than the prior period.", source: "ai-generated", confidence: 0.82, confidenceExplanation: "Confidence estimates consistency in the disclosed aggregate data." }],
  recommendations: [{ id: "recommendation-1", text: "Review the categories with the largest increases.", source: "ai-generated", relatedInterpretationId: "interpretation-1" }],
  disclaimer: "AI-generated interpretations and recommendations are informational only and are not professional financial advice.",
  disclosure,
  stale: false,
};

function successLoader(): AiHighlightsLoader {
  return vi.fn().mockResolvedValue({ status: "success", data: { state: "ready", insightSet }, message: "AI insights generated." });
}

beforeEach(() => window.sessionStorage.clear());

describe("AiHighlightList", () => {
  it("shows first-use disclosure before requesting and clearly separates recorded facts from generated guidance", async () => {
    const loadInsights = successLoader();
    render(<AiHighlightList disclosure={disclosure} loadInsights={loadInsights} period={period} />);

    expect(screen.getByRole("heading", { name: "AI data-use disclosure" })).toBeInTheDocument();
    expect(screen.getByText("recorded spending totals by category")).toBeInTheDocument();
    expect(screen.getByText("Provider retention behavior has not been verified.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Continue and generate highlights" }));
    await waitFor(() => expect(loadInsights).toHaveBeenCalledOnce());
    expect(loadInsights).toHaveBeenCalledWith({ disclosureVersion: disclosure.version, period, previousInsightSet: undefined });

    expect(screen.getByRole("heading", { name: "Recorded data facts" })).toBeInTheDocument();
    expect(screen.getByText("Recorded spending")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "AI-generated interpretations" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "AI-generated recommendations" })).toBeInTheDocument();
    expect(screen.getAllByText("AI-generated")).not.toHaveLength(0);
    expect(screen.getByText("Confidence: 82%")).toBeInTheDocument();
    expect(screen.getByText("What does AI confidence mean?")).toBeInTheDocument();
    expect(screen.getByText(/not professional financial advice/i)).toBeInTheDocument();
  });


  it("retains the last successful insight set as stale and retries only the AI boundary", async () => {
    const loadInsights: AiHighlightsLoader = vi.fn()
      .mockResolvedValueOnce({ status: "error", message: "AI provider is unavailable.", retryable: true })
      .mockResolvedValueOnce({ status: "success", data: { state: "ready", insightSet }, message: "AI insights generated." });
    render(<AiHighlightList disclosure={disclosure} initialInsightSet={insightSet} loadInsights={loadInsights} period={period} />);

    fireEvent.click(screen.getByRole("button", { name: "Refresh AI highlights" }));
    await waitFor(() => expect(screen.getByText("Showing stale AI highlights")).toBeInTheDocument());
    expect(screen.getByText("Recorded spending")).toBeInTheDocument();
    expect(screen.getByText(/Last successful AI highlights are shown below/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open detailed Insights" })).toHaveAttribute("href", "/insights?period=custom&start=2025-03-01&end=2025-03-31");

    fireEvent.click(screen.getByRole("button", { name: "Retry AI highlights" }));
    await waitFor(() => expect(screen.getByText("AI highlights refreshed.")).toBeInTheDocument());
    expect(loadInsights).toHaveBeenCalledTimes(2);
    expect(loadInsights).toHaveBeenLastCalledWith({ disclosureVersion: disclosure.version, period, previousInsightSet: expect.objectContaining({ stale: true }) });
    expect(screen.queryByText("Showing stale AI highlights")).not.toBeInTheDocument();
  });
});
