"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Search,
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Target,
  Repeat,
  BarChart3,
  Tag,
  Sparkles,
  Settings,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CornerDownLeft,
  X,
  Zap,
} from "lucide-react";
import { CATEGORY_REGISTRY, type ExpenseCategoryId } from "@/src/common/domain/categories";
import { createTransaction } from "@/app/actions/addExpenseRecord";
import { useToast } from "@/src/common/ui";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  category: "Navigation";
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, category: "Navigation" },
  { id: "records", title: "Transaction Records", href: "/records", icon: Receipt, category: "Navigation" },
  { id: "budgets", title: "Monthly Budgets", href: "/budgets", icon: PiggyBank, category: "Navigation" },
  { id: "goals", title: "Savings Goals", href: "/goals", icon: Target, category: "Navigation" },
  { id: "recurring", title: "Recurring Schedules", href: "/recurring", icon: Repeat, category: "Navigation" },
  { id: "reports", title: "Reports & Cash Flow", href: "/reports", icon: BarChart3, category: "Navigation" },
  { id: "categories", title: "Category Management", href: "/categories", icon: Tag, category: "Navigation" },
  { id: "ai-insights", title: "AI Financial Insights", href: "/ai-insights", icon: Sparkles, category: "Navigation" },
  { id: "settings", title: "Settings & Preferences", href: "/settings", icon: Settings, category: "Navigation" },
];

function guessCategoryFromText(text: string): { category: ExpenseCategoryId; type: "income" | "expense" } {
  const lower = text.toLowerCase();
  if (/\b(salary|freelance|client|retainer|income|dividend|bonus|payout|stipend)\b/.test(lower)) {
    return { category: "Other", type: "income" };
  }
  if (/\b(coffee|tea|dinner|lunch|breakfast|food|cafe|restaurant|burger|pizza|swiggy|zomato|starbucks)\b/.test(lower)) {
    return { category: "Food", type: "expense" };
  }
  if (/\b(uber|ola|taxi|fuel|petrol|diesel|metro|flight|train|bus|cab|parking|toll)\b/.test(lower)) {
    return { category: "Transportation", type: "expense" };
  }
  if (/\b(grocery|groceries|supermarket|vegetables|fruits|milk|bread|mart|zepto|blinkit|instamart)\b/.test(lower)) {
    return { category: "Food", type: "expense" };
  }
  if (/\b(rent|electricity|water|wifi|broadband|gas|maintenance|utility|utilities|bill)\b/.test(lower)) {
    return { category: "Bills", type: "expense" };
  }
  if (/\b(netflix|spotify|prime|movie|cinema|concert|game|steam|playstation|party)\b/.test(lower)) {
    return { category: "Entertainment", type: "expense" };
  }
  if (/\b(doctor|pharmacy|medicine|hospital|gym|fitness|health|dental|clinic)\b/.test(lower)) {
    return { category: "Healthcare", type: "expense" };
  }
  if (/\b(amazon|flipkart|clothes|shoes|shopping|electronics|gadget|mall|outfit)\b/.test(lower)) {
    return { category: "Shopping", type: "expense" };
  }
  return { category: "Other", type: "expense" };
}

function parseNaturalLanguageTransaction(raw: string): {
  description: string;
  amount: number;
  category: ExpenseCategoryId;
  type: "income" | "expense";
} | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Pattern: "Coffee 250" or "Spent 250 on Coffee" or "250 for Coffee"
  const matchTrailingNumber = trimmed.match(/^(?:spent\s+)?(.+?)\s+(?:for\s+)?(?:₹|\$|€)?\s*(\d+(?:\.\d{1,2})?)$/i);
  if (matchTrailingNumber) {
    const desc = matchTrailingNumber[1].trim();
    const amt = parseFloat(matchTrailingNumber[2]);
    if (desc && !isNaN(amt) && amt > 0) {
      const guessed = guessCategoryFromText(desc);
      return { description: desc, amount: amt, category: guessed.category, type: guessed.type };
    }
  }

  // Pattern: "250 Coffee" or "250 on Coffee"
  const matchLeadingNumber = trimmed.match(/^(?:₹|\$|€)?\s*(\d+(?:\.\d{1,2})?)\s+(?:on\s+|for\s+)?(.+)$/i);
  if (matchLeadingNumber) {
    const amt = parseFloat(matchLeadingNumber[1]);
    const desc = matchLeadingNumber[2].trim();
    if (desc && !isNaN(amt) && amt > 0) {
      const guessed = guessCategoryFromText(desc);
      return { description: desc, amount: amt, category: guessed.category, type: guessed.type };
    }
  }

  return null;
}

export function CommandPaletteModal({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const quickParsed = useMemo(() => {
    return parseNaturalLanguageTransaction(query);
  }, [query]);

  const filteredNav = useMemo(() => {
    if (!query.trim()) return NAV_ITEMS;
    const lower = query.toLowerCase().trim();
    return NAV_ITEMS.filter((item) => item.title.toLowerCase().includes(lower));
  }, [query]);

  const handleQuickAdd = useCallback(async () => {
    if (!quickParsed || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const requestId = globalThis.crypto?.randomUUID?.() ?? `quick-${Date.now()}`;
      const res = await createTransaction({
        requestId,
        command: {
          description: quickParsed.description,
          amount: String(quickParsed.amount),
          type: quickParsed.type,
          category: quickParsed.category,
          date: new Date().toISOString().split("T")[0],
        },
      });

      if (res.status === "success") {
        toast({
          title: "Transaction added",
          description: `${quickParsed.description} • ₹${quickParsed.amount.toLocaleString("en-IN")}`,
          tone: "success",
        });
        onOpenChange(false);
        router.refresh();
      } else {
        toast({
          title: "Failed to add transaction",
          description: "Please try again or use the full form.",
          tone: "error",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong.",
        tone: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [quickParsed, isSubmitting, onOpenChange, router, toast]);

  // Handle keyboard navigation inside command palette
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      } else if (e.key === "Enter" && quickParsed && !isSubmitting) {
        e.preventDefault();
        handleQuickAdd();
      }
    },
    [onOpenChange, quickParsed, isSubmitting, handleQuickAdd]
  );

  const handleNavigate = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  const handleOpenAddModal = (type: "expense" | "income") => {
    onOpenChange(false);
    window.dispatchEvent(new CustomEvent("open-add-transaction", { detail: { type } }));
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:pt-20"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-md"
        onClick={() => onOpenChange(false)}
      />

      {/* Palette Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -12 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-2xl rounded-2xl border border-white/[0.12] bg-[#0f1218]/95 backdrop-blur-2xl shadow-2xl overflow-hidden z-10"
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3.5 bg-white/[0.02]">
          <Search size={18} className="text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, page, or quick-add (e.g. 'Coffee 250')..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-white/40 hover:text-white p-1 rounded-md transition-colors"
            >
              <X size={14} />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block rounded-md border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-white/40">
              ESC to close
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-2">
          {/* Quick-Add Natural Language Banner */}
          {quickParsed && (
            <div className="p-1">
              <button
                type="button"
                onClick={handleQuickAdd}
                disabled={isSubmitting}
                className="w-full text-left rounded-xl border border-primary/40 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-3 transition-all hover:border-primary hover:scale-[1.005] group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-black font-bold">
                      <Zap size={15} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                          Instant Record
                        </span>
                        <span className="text-[11px] font-mono rounded bg-white/10 px-1.5 py-0.5 text-white/70">
                          {CATEGORY_REGISTRY[quickParsed.category]?.label ?? "Other"}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white mt-0.5">
                        Add {quickParsed.type === "income" ? "Income" : "Expense"}: &ldquo;{quickParsed.description}&rdquo; for ₹{quickParsed.amount.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-primary font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>{isSubmitting ? "Saving..." : "Press Enter"}</span>
                    <CornerDownLeft size={13} />
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="px-2 pt-1 pb-1">
            <span className="text-[11px] font-mono font-medium text-white/40 uppercase tracking-wider">
              Quick Actions
            </span>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleOpenAddModal("expense")}
                className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-xs text-white/80 hover:border-primary/30 hover:bg-primary/5 hover:text-white transition-all"
              >
                <TrendingDown size={14} className="text-danger" />
                <span>Add Expense Form</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenAddModal("income")}
                className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-xs text-white/80 hover:border-primary/30 hover:bg-primary/5 hover:text-white transition-all"
              >
                <TrendingUp size={14} className="text-emerald-400" />
                <span>Add Income Form</span>
              </button>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="px-2 pt-2">
            <span className="text-[11px] font-mono font-medium text-white/40 uppercase tracking-wider">
              Navigation
            </span>
            <div className="mt-1.5 space-y-1">
              {filteredNav.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.href)}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/[0.06] hover:text-white transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={15} className="text-white/40 group-hover:text-primary transition-colors" />
                      <span>{item.title}</span>
                    </div>
                    <ArrowRight size={13} className="text-white/20 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })}

              {filteredNav.length === 0 && !quickParsed && (
                <div className="py-6 text-center text-xs text-white/40">
                  No matching commands or pages found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-2 bg-white/[0.01] text-[11px] text-white/40 font-mono">
          <span>Tip: Type &ldquo;Uber 450&rdquo; or &ldquo;Coffee 150&rdquo; for instant quick-add</span>
          <span>Expense AI</span>
        </div>
      </motion.div>
    </div>
  );
}
