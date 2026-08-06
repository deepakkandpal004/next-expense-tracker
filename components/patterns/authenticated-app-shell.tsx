"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import AddNewRecord, { type TransactionSubmission } from "@/components/AddNewRecord";
import { createTransaction, type CreateTransactionResult } from "@/app/actions/addExpenseRecord";
import {
  parseReportingPeriod,
  reportingPeriodForISODate,
  resolvedPeriodIncludesDate,
  withReportingPeriodSearchParams,
} from "@/lib/domain/reporting-period";
import { Sheet } from "@/components/ui";
import type { TransactionType } from "@/lib/domain/types";
import { AppHeader } from "./app-header";
import { AppSidebar, type SidebarDestinationId } from "./app-sidebar";

/** Serializable account data deliberately excludes passwords, tokens, and timestamps. */
export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
}

interface AuthenticatedAppShellProps {
  children: ReactNode;
  user: SafeUser;
}

function currentDestinationId(pathname: string): SidebarDestinationId {
  if (pathname.startsWith("/records")) return "transactions";
  if (pathname.startsWith("/ai-insights")) return "ai-insights";
  if (pathname.startsWith("/budgets")) return "budgets";
  if (pathname.startsWith("/goals")) return "goals";
  if (pathname.startsWith("/recurring")) return "recurring";
  if (pathname.startsWith("/categories")) return "categories";
  if (pathname.startsWith("/reports")) return "reports";
  if (pathname.startsWith("/settings")) return "settings";
  return "dashboard";
}

const NAV_ROUTE: Record<SidebarDestinationId, string> = {
  dashboard: "/dashboard",
  transactions: "/records",
  "ai-insights": "/ai-insights",
  budgets: "/budgets",
  goals: "/goals",
  categories: "/categories",
  recurring: "/recurring",
  reports: "/reports",
  settings: "/settings",
};

export function AuthenticatedAppShell({ children, user }: AuthenticatedAppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [signingOut, setSigningOut] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [addTransactionPreset, setAddTransactionPreset] = useState<TransactionType>("expense");

  const handleNewRecord = (type?: TransactionType) => {
    setAddTransactionPreset(type ?? "expense");
    setAddTransactionOpen(true);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ type?: TransactionType }>;
      handleNewRecord(customEvent.detail?.type);
    };
    window.addEventListener("open-add-transaction", handler);
    return () => window.removeEventListener("open-add-transaction", handler);
  }, []);

  const submitTransaction = async (submission: TransactionSubmission): Promise<CreateTransactionResult> => {
    const result = await createTransaction(submission);
    if (result.status === "success") {
      const transactionDate = result.data.transaction?.date;
      if (transactionDate) {
        const recordPeriod = reportingPeriodForISODate(transactionDate);
        const current = parseReportingPeriod(new URLSearchParams(window.location.search));
        if (recordPeriod && current.valid && !resolvedPeriodIncludesDate(current.period, transactionDate)) {
          const params = withReportingPeriodSearchParams(window.location.search, {
            kind: "custom",
            start: recordPeriod.start,
            end: recordPeriod.end,
          });
          if (params) {
            const query = params.toString();
            router.replace(`${pathname}${query ? `?${query}` : ""}`);
            router.refresh();
            return result;
          }
        }
      }
      router.refresh();
    }
    return result;
  };

  const activeDestinationId = currentDestinationId(pathname);

  const hrefFor = (destination: keyof typeof NAV_ROUTE): string => {
    return NAV_ROUTE[destination];
  };

  const signOut = async () => {
    setSigningOut(true);
    setAccountError(null);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Unable to sign out");
      router.replace("/sign-in");
    } catch {
      setAccountError("We couldn't sign you out. Please try again.");
      setSigningOut(false);
    }
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background text-foreground relative">
      {/* Atmospheric Background */}
      <div className="pulse-atmosphere" aria-hidden="true" />

      {/* Desktop sidebar */}
      <div className="hidden md:flex shrink-0 relative z-10">
        <AppSidebar
          activeDestinationId={activeDestinationId}
          collapsed={sidebarCollapsed}
          hrefFor={hrefFor}
          onNewRecord={handleNewRecord}
          onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
        />
      </div>

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto relative z-10">
        <AppHeader
          accountError={accountError}
          onMobileMenuOpen={() => setMobileNavOpen(true)}
          onSignOut={signOut}
          signingOut={signingOut}
          user={user}
        />

        <main
          className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8"
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

      {/* Mobile sidebar — Sheet overlay */}
      <Sheet
        className="w-[260px] border-0 bg-transparent p-0 shadow-none"
        closeLabel="Close navigation"
        hideTitle
        onOpenChange={setMobileNavOpen}
        open={mobileNavOpen}
        side="left"
        title="Application navigation"
      >
        <AppSidebar
          activeDestinationId={activeDestinationId}
          hrefFor={hrefFor}
          onNavigate={() => setMobileNavOpen(false)}
          onNewRecord={() => { setMobileNavOpen(false); handleNewRecord(); }}
        />
      </Sheet>

      {/* Global add transaction dialog */}
      <AddNewRecord
        defaultType={addTransactionPreset}
        hideTrigger
        onOpenChange={setAddTransactionOpen}
        open={addTransactionOpen}
        submitTransaction={submitTransaction}
      />
    </div>
  );
}
