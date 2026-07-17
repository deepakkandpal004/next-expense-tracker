import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import AddNewRecord, { type TransactionSubmission } from "./AddNewRecord";

const label = (name: string) => new RegExp(`^${name}`);

async function fillExpense(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(label("Description")), "Groceries");
  await user.type(screen.getByLabelText(label("Date")), "2025-03-08");
  await user.type(screen.getByLabelText(label("Amount")), "24.50");
  await user.selectOptions(screen.getByLabelText(label("Category")), "Food");
}

describe("AddNewRecord", () => {
  it("uses labeled, type-dependent fields and focuses the first invalid field", async () => {
    const user = userEvent.setup();
    render(<AddNewRecord />);
    await user.click(screen.getByRole("button", { name: "Add transaction" }));
    await user.click(screen.getByRole("button", { name: "Add transaction" }));
    expect(await screen.findByText(/Enter a description between/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText(label("Description"))).toHaveFocus());
    await user.selectOptions(screen.getByLabelText(label("Type")), "income");
    expect(screen.queryByRole("combobox", { name: label("Category") })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Category")).toHaveTextContent("Income is assigned automatically.");
  });

  it("labels AI suggestions and requires confirmation or a category replacement", async () => {
    const user = userEvent.setup();
    const received: TransactionSubmission[] = [];
    render(<AddNewRecord requestCategorySuggestion={async () => ({ status: "success", message: "AI category suggestion generated.", data: { state: "ready", description: "Groceries", suggestion: { categoryId: "Food", explanation: "AI-generated from the description.", source: "ai-generated" } } })} submitTransaction={async (submission) => { received.push(submission); return { status: "success", data: undefined, message: "Transaction added." }; }} />);
    await user.click(screen.getByRole("button", { name: "Add transaction" }));
    await fillExpense(user);
    await user.click(screen.getByRole("button", { name: "Get AI category suggestion" }));
    expect(await screen.findByText("AI-generated category suggestion")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add transaction" }));
    expect(await screen.findByText("Confirm or replace the AI-suggested category.")).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(label("Category")), "Transportation");
    await user.click(screen.getByRole("button", { name: "Add transaction" }));
    await waitFor(() => expect(received).toHaveLength(1));
    expect(received[0].command.category).toBe("Transportation");
  });

  it("retains the draft, disables duplicate pending submission, and retries with one request ID", async () => {
    const user = userEvent.setup();
    const received: TransactionSubmission[] = [];
    let resolve!: (value: { status: "error"; message: string; retryable: true }) => void;
    render(<AddNewRecord submitTransaction={(submission) => { received.push(submission); return new Promise((done) => { resolve = done; }); }} />);
    await user.click(screen.getByRole("button", { name: "Add transaction" }));
    await fillExpense(user);
    await user.click(screen.getByRole("button", { name: "Add transaction" }));
    await user.click(screen.getByRole("button", { name: "Add transaction" }));
    expect(received).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Add transaction" })).toBeDisabled();
    resolve({ status: "error", message: "Transaction could not be added.", retryable: true });
    await user.click(await screen.findByRole("button", { name: "Retry transaction" }));
    expect(received).toHaveLength(2);
    expect(received[1].requestId).toBe(received[0].requestId);
    expect(screen.getByLabelText(label("Description"))).toHaveValue("Groceries");
  });
});
