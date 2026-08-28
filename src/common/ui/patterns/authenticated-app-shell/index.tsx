"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AddNewRecord, { type TransactionSubmission } from "@/src/common/ui/AddNewRecord";
import { createTransaction, type CreateTransactionResult } from "@/app/actions/addExpenseRecord";
import {
  parseReportingPeriod,
  reportingPeriodForISODate,
  resolvedPeriodIncludesDate,
  withReportingPeriodSearchParams,
} from "@/src/common/domain/reporting-period";
import { Sheet } from "@/src/common/ui";
import type { TransactionType } from "@/src/common/domain/types";
import { AppHeader } from "../app-header";
import { AppSidebar } from "../app-sidebar";
import { currentDestinationId, hrefFor } from "./navigation";
import type { AuthenticatedAppShellProps } from "./types";

export { type AuthenticatedAppShellProps, type SafeUser } from "./types";

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
      <div className="app-atmosphere" aria-hidden="true" />

      <div className="hidden md:flex shrink-0 relative z-10">
        <AppSidebar
          activeDestinationId={activeDestinationId}
          collapsed={sidebarCollapsed}
          hrefFor={hrefFor}
          onNewRecord={handleNewRecord}
          onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col relative z-10">
        <div className="shrink-0 px-3 pt-3 sm:px-4">
          <AppHeader
            accountError={accountError}
            onMobileMenuOpen={() => setMobileNavOpen(true)}
            onSignOut={signOut}
            signingOut={signingOut}
            user={user}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <main
            className="min-w-0 px-4 pb-8 pt-6 sm:px-6 lg:px-8"
            id="main-content"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </div>

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
