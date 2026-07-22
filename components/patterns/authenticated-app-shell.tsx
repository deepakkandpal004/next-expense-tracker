"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Sheet } from "@/components/ui";
import {
  APP_PERIOD_DESTINATIONS,
  appPeriodHref,
  parseReportingPeriod,
  resolveReportingPeriodState,
  writeReportingPeriodSession,
  type AppPeriodDestination,
} from "@/lib/domain/reporting-period";
import type { ReportingPeriod } from "@/lib/domain/types";
import { AppHeader } from "./app-header";
import { AppSidebar, type SidebarDestinationId, type SidebarUser } from "./app-sidebar";

/** Serializable account data deliberately excludes passwords, tokens, and timestamps. */
export type SafeUser = SidebarUser;

interface AuthenticatedAppShellProps {
  children: ReactNode;
  user: SafeUser;
}

function currentDestinationId(pathname: string): SidebarDestinationId {
  if (pathname.startsWith("/records")) return "transactions";
  if (pathname.startsWith("/ai-insights")) return "ai-insights";
  if (pathname.startsWith("/insights")) return "ai-insights";
  if (pathname.startsWith("/budgets")) return "budgets";
  if (pathname.startsWith("/goals")) return "goals";
  return "dashboard";
}

const NAV_TO_ROUTE: Record<Exclude<SidebarDestinationId, "categories" | "recurring" | "reports" | "settings">, AppPeriodDestination> = {
  dashboard: "dashboard",
  transactions: "records",
  "ai-insights": "ai-insights",
  budgets: "budgets",
  goals: "goals",
};

/**
 * Route-owned signed-in chrome. Sidebar is an icon rail on desktop, hidden on mobile
 * (hamburger opens a Sheet overlay). URL period parameters remain authoritative;
 * sessionStorage only mirrors a valid period when the URL has no period state.
 */
export function AuthenticatedAppShell({ children, user }: AuthenticatedAppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const periodSearch = searchParams.toString();

  const [sessionPeriod, setSessionPeriod] = useState<ReportingPeriod>({ kind: "current-month" });
  const [signingOut, setSigningOut] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleNewRecord = () => {
    const href = appPeriodHref("records", period);
    router.push(`${href}?addTransaction=1`);
  };

  const urlPeriod = useMemo(
    () => parseReportingPeriod(new URLSearchParams(periodSearch)),
    [periodSearch],
  );
  const hasPeriodInUrl = searchParams.get("period") !== null;
  const period = hasPeriodInUrl && urlPeriod.valid ? urlPeriod.input : sessionPeriod;

  useEffect(() => {
    const nextPeriod = resolveReportingPeriodState(
      new URLSearchParams(periodSearch),
      window.sessionStorage,
    );
    if (!nextPeriod.valid) return;
    setSessionPeriod(nextPeriod.input);
    writeReportingPeriodSession(window.sessionStorage, nextPeriod.input);
  }, [periodSearch]);

  const activeDestinationId = currentDestinationId(pathname);

  const hrefFor = (destination: keyof typeof NAV_TO_ROUTE): string => {
    const route = NAV_TO_ROUTE[destination];
    return appPeriodHref(route, period) ?? APP_PERIOD_DESTINATIONS[route];
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
          hrefFor={hrefFor}
          onNewRecord={handleNewRecord}
          onSignOut={signOut}
          signingOut={signingOut}
          user={user}
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
          onSignOut={signOut}
          signingOut={signingOut}
          user={user}
        />
      </Sheet>
    </div>
  );
}
