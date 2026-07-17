export const PRIMITIVE_STATES = [
  "default",
  "hover",
  "focus",
  "active",
  "disabled",
  "loading",
  "invalid",
  "success",
] as const;

export type PrimitiveState = (typeof PRIMITIVE_STATES)[number];
export type ContentConvention =
  | "sentence-case"
  | "action-led"
  | "visible-name-match"
  | "accessible-name-required"
  | "complete-financial-value"
  | "locale-aware"
  | "no-color-only-meaning";

export interface PrimitiveDefinition {
  anatomy: readonly string[];
  states: readonly PrimitiveState[];
  content: readonly ContentConvention[];
  frequentTarget: boolean;
  example: Readonly<Record<string, string>>;
}

const interactiveStates = PRIMITIVE_STATES;
const displayStates = ["default", "loading", "invalid", "success"] as const;

export const PRIMITIVE_REGISTRY = {

  Button: {
    anatomy: ["visible action label", "optional decorative icon", "progress indicator"],
    states: interactiveStates,
    content: ["sentence-case", "action-led", "visible-name-match"],
    frequentTarget: true,
    example: { label: "Add transaction", intent: "primary" },
  },
  IconButton: {
    anatomy: ["icon", "accessible action name", "tooltip"],
    states: interactiveStates,
    content: ["sentence-case", "action-led", "accessible-name-required"],
    frequentTarget: true,
    example: { label: "Delete transaction", icon: "Trash2" },
  },
  LinkButton: {
    anatomy: ["visible action label", "optional decorative icon"],
    states: interactiveStates,
    content: ["sentence-case", "action-led", "visible-name-match"],
    frequentTarget: true,
    example: { label: "View all transactions", href: "/records" },
  },
  Field: {
    anatomy: ["visible label", "description", "control", "correction or success message"],
    states: interactiveStates,
    content: ["sentence-case", "visible-name-match"],
    frequentTarget: true,
    example: { id: "description", label: "Description", type: "text" },
  },
  Select: {
    anatomy: ["visible label", "description", "select control", "correction or success message"],
    states: interactiveStates,
    content: ["sentence-case", "visible-name-match"],
    frequentTarget: true,
    example: { id: "category", label: "Category", option: "Housing" },
  },
  Tabs: {
    anatomy: ["labeled tab list", "tab triggers", "selected panel"],
    states: interactiveStates,
    content: ["sentence-case", "visible-name-match", "no-color-only-meaning"],
    frequentTarget: true,
    example: { label: "Chart view", tab: "Spending trend" },
  },
  Dialog: {
    anatomy: ["named trigger", "modal heading", "optional description", "focused task content", "close action"],
    states: interactiveStates,
    content: ["sentence-case", "accessible-name-required"],
    frequentTarget: false,
    example: { title: "Add transaction", closeLabel: "Close dialog" },
  },
  Sheet: {
    anatomy: ["named trigger", "full-height mobile surface", "modal heading", "task content", "close action"],
    states: interactiveStates,
    content: ["sentence-case", "accessible-name-required"],
    frequentTarget: false,
    example: { title: "Navigation menu", closeLabel: "Close sheet" },
  },
  AlertDialog: {
    anatomy: ["named trigger", "alert dialog title", "consequence", "cancel action", "confirm action"],
    states: interactiveStates,
    content: ["sentence-case", "action-led", "accessible-name-required"],
    frequentTarget: false,
    example: { title: "Delete transaction", action: "Delete transaction" },
  },
  DropdownMenu: {
    anatomy: ["named trigger", "labeled menu", "keyboard-operable menu items"],
    states: interactiveStates,
    content: ["sentence-case", "accessible-name-required"],
    frequentTarget: true,
    example: { label: "Account actions", item: "Sign out" },
  },
  CompactNavigation: {
    anatomy: ["visible Menu trigger", "focus-managed sheet", "ordered destinations", "current-page cue"],
    states: interactiveStates,
    content: ["sentence-case", "visible-name-match", "no-color-only-meaning"],
    frequentTarget: true,
    example: { label: "Menu", current: "Dashboard" },
  },
  ConfirmDestructiveAction: {
    anatomy: ["trigger", "record description", "amount", "date", "consequence", "cancel", "confirmation"],
    states: interactiveStates,
    content: ["sentence-case", "action-led", "complete-financial-value"],
    frequentTarget: true,
    example: { action: "Delete transaction", consequence: "This cannot be undone" },
  },
  Badge: {
    anatomy: ["optional non-color symbol", "status text"],
    states: displayStates,
    content: ["sentence-case", "no-color-only-meaning"],
    frequentTarget: false,
    example: { tone: "success", text: "On track", symbol: "check" },
  },
  Card: {
    anatomy: ["container", "optional header", "content", "optional footer"],
    states: displayStates,
    content: ["sentence-case"],
    frequentTarget: false,
    example: { elevation: "flat", content: "Section content" },
  },
  DataTable: {
    anatomy: ["caption", "column headers", "rows", "cells"],
    states: displayStates,
    content: ["sentence-case", "complete-financial-value"],
    frequentTarget: false,
    example: { caption: "Transactions for March 2025", columns: "Date, Description, Amount" },
  },
  Tooltip: {
    anatomy: ["named trigger", "supplementary description", "arrow"],
    states: ["default", "hover", "focus", "disabled"],
    content: ["sentence-case", "accessible-name-required"],
    frequentTarget: false,
    example: { content: "Delete transaction" },
  },
  Alert: {
    anatomy: ["non-color icon", "title", "description", "optional action"],
    states: displayStates,
    content: ["sentence-case", "no-color-only-meaning"],
    frequentTarget: false,
    example: { tone: "danger", title: "Transaction could not be deleted" },
  },
  StatusRegion: {
    anatomy: ["live region", "status message"],
    states: displayStates,
    content: ["sentence-case", "no-color-only-meaning"],
    frequentTarget: false,
    example: { politeness: "polite", message: "Transaction added" },
  },
  Skeleton: {
    anatomy: ["reserved footprint", "textual busy status", "static shapes"],
    states: ["default", "loading"],
    content: ["accessible-name-required"],
    frequentTarget: false,
    example: { label: "Loading transactions", minimumHeight: "12rem" },
  },
  EmptyState: {
    anatomy: ["title", "purpose or scope", "relevant action"],
    states: ["default"],
    content: ["sentence-case", "action-led"],
    frequentTarget: false,
    example: { title: "No transactions yet", action: "Add transaction" },
  },
  ErrorState: {
    anatomy: ["title", "affected scope", "recovery action"],
    states: ["invalid"],
    content: ["sentence-case", "action-led", "no-color-only-meaning"],
    frequentTarget: false,
    example: { title: "Transactions could not be loaded", action: "Try again" },
  },
  SectionHeader: {
    anatomy: ["title", "description", "metadata", "optional action"],
    states: ["default", "loading", "invalid", "success"],
    content: ["sentence-case"],
    frequentTarget: false,
    example: { title: "Recent transactions", metadata: "March 1–31, 2025" },
  },
  CurrencyText: {
    anatomy: ["locale-aware visible value", "unambiguous currency alternative"],
    states: ["default", "loading", "invalid"],
    content: ["complete-financial-value", "locale-aware"],
    frequentTarget: false,
    example: { minorValue: "125050", currency: "INR", output: "₹1,250.50" },
  },
  DateText: {
    anatomy: ["locale-aware visible value", "machine-readable date", "exact alternative"],
    states: ["default", "loading", "invalid"],
    content: ["locale-aware"],
    frequentTarget: false,
    example: { value: "2025-03-08T12:30:00Z", format: "date-time" },
  },
} as const satisfies Record<string, PrimitiveDefinition>;

export type PrimitiveName = keyof typeof PRIMITIVE_REGISTRY;

const ACTION_VERBS = new Set([
  "add", "apply", "ask", "cancel", "change", "choose", "clear", "close", "confirm",
  "continue", "create", "delete", "dismiss", "download", "edit", "explore", "export", "get", "go",
  "hide", "learn", "open", "refresh", "remove", "reset", "retry", "return",
  "save", "search", "select", "send", "set", "show", "sign", "sort", "start",
  "submit", "try", "update", "view",
]);

function words(value: string): string[] {
  return value.trim().split(/\s+/).filter(Boolean);
}

export function isSentenceCase(value: string): boolean {
  const normalized = value.trim();
  if (!normalized) return false;
  const firstLetter = normalized.match(/[A-Za-z]/)?.[0];
  if (firstLetter && firstLetter !== firstLetter.toUpperCase()) return false;
  const tokens = words(normalized).filter((token) => /^[A-Za-z][a-z]+$/.test(token));
  return tokens.length < 2 || !tokens.slice(1).every((token) => token[0] === token[0].toUpperCase());
}

export function isActionLed(value: string): boolean {
  const [first = ""] = words(value.toLowerCase());
  return ACTION_VERBS.has(first.replace(/[^a-z]/g, ""));
}

export function enforceSentenceCase(value: string, subject = "Label"): void {
  if (!isSentenceCase(value)) throw new Error(`${subject} must use sentence case: "${value}"`);
}

export function enforceActionLabel(value: string, subject = "Action label"): void {
  enforceSentenceCase(value, subject);
  if (!isActionLed(value)) throw new Error(`${subject} must begin with an action: "${value}"`);
}

export function enforceAccessibleName(visibleLabel: string | undefined, accessibleName: string): void {
  const visible = visibleLabel?.trim();
  const accessible = accessibleName.trim();
  if (!accessible) throw new Error("Icon-only controls require an accessible action name");
  if (visible && visible.toLocaleLowerCase() !== accessible.toLocaleLowerCase()) {
    throw new Error(`Accessible name must match the visible label: "${visible}"`);
  }
}

export function registryIssues(): string[] {
  return Object.entries(PRIMITIVE_REGISTRY).flatMap(([name, definition]) => {
    const issues: string[] = [];
    if (!definition.anatomy.length) issues.push(`${name}: anatomy is required`);
    if (!definition.states.includes("default" as never) && name !== "ErrorState") issues.push(`${name}: default state is required`);
    if (definition.frequentTarget && !definition.content.length) issues.push(`${name}: content rules are required`);
    return issues;
  });
}
