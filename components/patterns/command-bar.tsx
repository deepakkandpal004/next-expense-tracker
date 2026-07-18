"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  CreditCard,
  DollarSign,
  FileText,
  HelpCircle,
  Menu,
  Search,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/ui/cn";
import { formatCurrency } from "@/lib/formatters/locale";
import { appPeriodHref } from "@/lib/domain/reporting-period";
import type { ReportingPeriod } from "@/lib/domain/types";

interface CommandBarAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: "query" | "navigation" | "action";
  keywords: string[];
  handler: () => void | Promise<void>;
  shortcut?: string;
}

interface CommandBarProps {
  period: ReportingPeriod;
  currency: string;
  onClose: () => void;
  onAskAI: (question: string) => void;
  onNavigate: (href: string) => void;
  recentTransactions?: Array<{
    id: string;
    description: string;
    amountMinor: number;
    categoryId: string;
    occurredOn: string;
  }>;
  insightsSummary?: {
    totalIncome: number;
    totalExpense: number;
    savings: number;
    topCategory: string;
  };
}

const SHORTCUT_KEYS = ["⌘", "K"] as const;

function formatShortcut(keys: readonly string[]): string {
  return keys.join(" + ");
}

export function CommandBar({
  period,
  currency,
  onClose,
  onAskAI,
  onNavigate,
  recentTransactions = [],
  insightsSummary,
}: CommandBarProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  const actions = useMemo<CommandBarAction[]>(() => {
    const baseActions: CommandBarAction[] = [
      {
        id: "ask-ai",
        label: "Ask AI about finances",
        description: "Get intelligent insights about your spending",
        icon: <Brain size={18} strokeWidth={2.2} />,
        category: "query",
        keywords: ["ai", "ask", "question", "insight", "analyze", "advice"],
        handler: () => {
          if (query.trim()) {
            onAskAI(query.trim());
            onClose();
          }
        },
      },
      {
        id: "spending-report",
        label: "Show spending report",
        description: "View detailed breakdown of this period's expenses",
        icon: <FileText size={18} strokeWidth={2.2} />,
        category: "navigation",
        keywords: ["spending", "report", "expense", "breakdown", "analysis"],
        handler: () => {
          const href = appPeriodHref("insights", period) ?? "/insights";
          onNavigate(href);
          onClose();
        },
        shortcut: "S",
      },
      {
        id: "add-expense",
        label: "Add expense",
        description: "Quickly log a new expense transaction",
        icon: <TrendingDown size={18} strokeWidth={2.2} />,
        category: "action",
        keywords: ["add", "expense", "spend", "log", "record", "new"],
        handler: () => {
          const href = `/records?addTransaction=1&type=expense${period.kind !== "current-month" ? `&period=${period.kind}` : ""}`;
          onNavigate(href);
          onClose();
        },
        shortcut: "E",
      },
      {
        id: "add-income",
        label: "Add income",
        description: "Record a new income entry",
        icon: <TrendingUp size={18} strokeWidth={2.2} />,
        category: "action",
        keywords: ["add", "income", "earn", "salary", "receive", "record"],
        handler: () => {
          const href = `/records?addTransaction=1&type=income${period.kind !== "current-month" ? `&period=${period.kind}` : ""}`;
          onNavigate(href);
          onClose();
        },
        shortcut: "I",
      },
      {
        id: "budgets",
        label: "Manage budgets",
        description: "Set or adjust your monthly spending limits",
        icon: <CreditCard size={18} strokeWidth={2.2} />,
        category: "navigation",
        keywords: ["budget", "limit", "spending", "target", "manage"],
        handler: () => {
          onNavigate("/budgets");
          onClose();
        },
        shortcut: "B",
      },
      {
        id: "goals",
        label: "View goals",
        description: "Track progress toward your financial goals",
        icon: <DollarSign size={18} strokeWidth={2.2} />,
        category: "navigation",
        keywords: ["goal", "target", "save", "progress", "objective"],
        handler: () => {
          onNavigate("/goals");
          onClose();
        },
        shortcut: "G",
      },
      {
        id: "categories",
        label: "Manage categories",
        description: "Organize your spending categories",
        icon: <Menu size={18} strokeWidth={2.2} />,
        category: "navigation",
        keywords: ["category", "categories", "organize", "tag", "label"],
        handler: () => {
          onNavigate("/categories");
          onClose();
        },
      },
      {
        id: "help",
        label: "Help & shortcuts",
        description: "View keyboard shortcuts and help",
        icon: <HelpCircle size={18} strokeWidth={2.2} />,
        category: "navigation",
        keywords: ["help", "shortcut", "keyboard", "guide", "how to"],
        handler: () => {
          onNavigate("/help");
          onClose();
        },
        shortcut: "?",
      },
    ];

    if (insightsSummary) {
      baseActions.unshift({
        id: "quick-summary",
        label: "Quick financial summary",
        description: `Income: ${formatCurrency({ minorValue: insightsSummary.totalIncome, currency })} • Expenses: ${formatCurrency({ minorValue: insightsSummary.totalExpense, currency })}`,
        icon: <DollarSign size={18} strokeWidth={2.2} />,
        category: "query",
        keywords: ["summary", "overview", "total", "balance", "income", "expense"],
        handler: () => {
          onAskAI("Give me a quick financial summary for this period");
          onClose();
        },
      });
    }

    if (recentTransactions.length > 0) {
      recentTransactions.slice(0, 3).forEach((tx) => {
        baseActions.push({
          id: `recent-tx-${tx.id}`,
          label: tx.description,
          description: `${formatCurrency({ minorValue: tx.amountMinor, currency })} • ${tx.categoryId} • ${new Date(tx.occurredOn).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
          icon: <FileText size={18} strokeWidth={2.2} />,
          category: "action",
          keywords: [tx.description.toLowerCase(), tx.categoryId.toLowerCase()],
          handler: () => {
            onNavigate(`/records/${tx.id}`);
            onClose();
          },
        });
      });
    }

    return baseActions;
  }, [period, currency, query, onAskAI, onNavigate, onClose, recentTransactions, insightsSummary]);

  const filteredActions = useMemo(() => {
    if (!query.trim()) {
      return actions.slice(0, 8);
    }

    return actions
      .map((action) => {
        const lowerQuery = query.toLowerCase();

        let score = 0;
        if (action.label.toLowerCase().startsWith(lowerQuery)) score += 100;
        if (action.label.toLowerCase().includes(lowerQuery)) score += 50;
        if (action.keywords.some((k) => k.includes(lowerQuery))) score += 30;
        if (action.description.toLowerCase().includes(lowerQuery)) score += 20;

        return { action, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ action }) => action);
  }, [actions, query]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const items = filteredActions;
      if (items.length === 0) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          event.preventDefault();
          if (items[selectedIndex]) {
            items[selectedIndex].handler();
          }
          break;
        case "Escape":
          event.preventDefault();
          onClose();
          break;
      }
    },
    [filteredActions, selectedIndex, onClose],
  );

  useEffect(() => {
    inputRef.current?.focus();
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k" &&
        !event.shiftKey &&
        !event.altKey
      ) {
        const target = event.target as HTMLElement;
        if (!target.closest("input, textarea, [contenteditable]")) {
          event.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    const item = itemsRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    item?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (filteredActions[selectedIndex]) {
      filteredActions[selectedIndex].handler();
    } else if (query.trim()) {
      onAskAI(query.trim());
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="command-bar-overlay fixed inset-0 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.form
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="command-bar fixed top-[15vh] left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl"
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-label="Command bar"
      >
        <div className="flex flex-col rounded-2xl bg-surface shadow-premium-xl overflow-hidden">
          <div className="relative flex items-center gap-3 p-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-secondary"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI, search, or run a command…"
                className="command-bar-input w-full rounded-xl bg-surface-subtle/50 px-12 py-3.5 text-body text-foreground placeholder:text-foreground-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                autoComplete="off"
                spellCheck={false}
                aria-label="Command bar input"
                aria-autocomplete="list"
                aria-controls="command-bar-results"
                aria-activedescendant={filteredActions[selectedIndex] ? `cmd-item-${filteredActions[selectedIndex].id}` : undefined}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-foreground-secondary hover:text-foreground transition-colors"
                  aria-label="Clear query"
                >
                  <X size={18} strokeWidth={2.2} />
                </button>
              )}
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-caption text-foreground-secondary bg-surface-subtle rounded-lg">
              <span className="font-mono">{formatShortcut(SHORTCUT_KEYS)}</span>
              <span>to open</span>
            </kbd>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredActions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="command-bar-results overflow-hidden"
                id="command-bar-results"
                role="listbox"
                ref={itemsRef}
              >
                {filteredActions.map((action, index) => (
                  <motion.button
                    key={action.id}
                    type="button"
                    data-index={index}
                    id={`cmd-item-${action.id}`}
                    role="option"
                    aria-selected={index === selectedIndex}
                    onClick={() => {
                      setSelectedIndex(index);
                      action.handler();
                    }}
                    className={cn(
                      "command-bar-item w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                      index === selectedIndex && "bg-surface-subtle",
                    )}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.15, delay: index * 0.02 }}
                  >
                    <span
                      className={cn(
                        "command-bar-item-icon flex h-10 w-10 items-center justify-center rounded-lg",
                        action.category === "query" && "bg-accent-surface text-accent",
                        action.category === "navigation" && "bg-info-surface text-info",
                        action.category === "action" && "bg-kpi-income-surface text-kpi-income",
                      )}
                      aria-hidden="true"
                    >
                      {action.icon}
                    </span>
                    <div className="command-bar-item-content flex-1 min-w-0">
                      <p className="command-bar-item-title text-body font-medium text-foreground truncate">
                        {action.label}
                      </p>
                      <p className="command-bar-item-description text-caption text-foreground-secondary truncate">
                        {action.description}
                      </p>
                    </div>
                    {action.shortcut && (
                      <kbd className="command-bar-item-shortcut flex items-center gap-1 px-2 py-1 text-caption text-foreground-secondary bg-surface-subtle rounded font-mono">
                        {action.shortcut}
                      </kbd>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}

            {query.trim() && filteredActions.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 text-center"
              >
                <Brain className="mx-auto h-12 w-12 text-foreground-secondary/50" aria-hidden="true" />
                <p className="mt-3 text-body text-foreground">No commands match {query}</p>
                <p className="mt-1 text-caption text-foreground-secondary">
                  Press Enter to ask AI directly
                </p>
              </motion.div>
            )}

            {!query.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4"
              >
                <p className="text-caption text-foreground-secondary flex items-center gap-2">
                  <kbd className="px-2 py-0.5 text-[10px] font-mono bg-surface-subtle rounded">
                    ⌘K
                  </kbd>
                  <span>Open command bar anywhere</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.form>
    </AnimatePresence>
  );
}