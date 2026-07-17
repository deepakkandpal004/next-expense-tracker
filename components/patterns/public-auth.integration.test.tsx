import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { push, refresh, refreshUser } = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  refreshUser: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ refreshUser }) }));

import SignInPage from "@/app/(auth)/sign-in/page";
import SignUpPage from "@/app/(auth)/sign-up/page";
import ForgotPasswordPage from "@/app/(auth)/forgot-password/page";
import { PasswordField } from "./authentication-form";
import { LandingPageContent } from "./public-pages";

beforeEach(() => {
  push.mockReset();
  refresh.mockReset();
  refreshUser.mockReset();
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) =>
    window.setTimeout(() => callback(0), 0),
  );
});

describe("public content", () => {
  it("keeps one heading and an accessible focus-preserving FAQ relationship", async () => {
    const user = userEvent.setup();
    render(<LandingPageContent />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByText("Illustrative interface").length).toBeGreaterThan(0);
    const question = screen.getByRole("button", { name: "How is AI used?" });
    expect(question).toHaveAttribute("aria-expanded", "false");
    await user.click(question);
    const regionId = question.getAttribute("aria-controls");
    expect(question).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById(regionId!)).toHaveAttribute("role", "region");
    expect(question).toHaveFocus();
  });
});

describe("authentication forms", () => {
  it("reveals a password without changing its value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PasswordField autoComplete="current-password" id="password" label="Password" onChange={onChange} value="kept-secret" />);
    const field = screen.getByLabelText(/Password/);
    expect(field).toHaveAttribute("type", "password");
    expect(field).toHaveAttribute("autocomplete", "current-password");
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(field).toHaveAttribute("type", "text");
    expect(field).toHaveValue("kept-secret");
  });

  it("focuses the first invalid sign-in field and prevents duplicate pending requests", async () => {
    const user = userEvent.setup();
    render(<SignInPage />);
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(screen.getByLabelText(/Email address/)).toHaveFocus());
    expect(screen.getByLabelText(/Email address/)).toHaveAttribute("autocomplete", "username");

    await user.type(screen.getByLabelText(/Email address/), "person@example.com");
    await user.type(screen.getByLabelText(/Password/), "password");
    let resolveRequest!: (value: Response) => void;
    const request = new Promise<Response>((resolve) => { resolveRequest = resolve; });
    const fetchMock = vi.fn(() => request);
    vi.stubGlobal("fetch", fetchMock);
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByRole("button", { name: "Sign in" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(fetchMock).toHaveBeenCalledOnce();
    resolveRequest(new Response(null, { status: 401 }));
    expect(await screen.findByText("We could not sign you in with those details. Check them and try again.")).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/)).toHaveValue("person@example.com");
    expect(screen.getByRole("button", { name: "Retry sign in" })).toBeEnabled();
  });

  it("validates account confirmation and exposes correct autocomplete purposes", async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);
    await user.type(screen.getByLabelText(/Full name/), "Example Person");
    await user.type(screen.getByLabelText(/Email address/), "person@example.com");
    await user.type(screen.getByLabelText(/^Password/), "first-password");
    await user.type(screen.getByLabelText(/Confirm password/), "different-password");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(screen.getByText("Passwords must match.")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText(/Confirm password/)).toHaveFocus());
    expect(screen.getByLabelText(/^Password/)).toHaveAttribute("autocomplete", "new-password");
  });

  it("uses a privacy-neutral recovery response and retains the entered email", async () => {
    vi.useFakeTimers();
    render(<ForgotPasswordPage />);
    fireEvent.change(screen.getByLabelText(/Email address/), { target: { value: "person@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Send recovery instructions" }));
    await act(async () => { vi.advanceTimersByTime(250); });
    expect(screen.getByText(/If an account can be recovered with this email address/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/)).toHaveValue("person@example.com");
    vi.useRealTimers();
  });
});