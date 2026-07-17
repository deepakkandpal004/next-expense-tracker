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
  if (pathname.startsWith("/insights")) return "analytics";
  return "dashboard";
}

const NAV_TO_ROUTE: Record<Exclude<SidebarDestinationId, "budgets" | "goals" | "categories" | "recurring" | "reports" | "settings">, AppPeriodDestination> = {
  dashboard: "dashboard",
  transactions: "records",
  analytics: "insights",
};

/**
 * Route-owned signed-in chrome. Left sidebar is permanent on desktop and served through
 * a bottom-anchored drawer on mobile. URL period parameters remain authoritative;
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
      setAccountError("We couldn’t sign you out. Please try again.");
      setSigningOut(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] bg-canvas text-foreground">
      <div className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 lg:flex">
        <AppSidebar
          activeDestinationId={activeDestinationId}
          hrefFor={hrefFor}
          onSignOut={signOut}
          signingOut={signingOut}
          user={user}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          accountError={accountError}
          onMobileMenuOpen={() => setMobileNavOpen(true)}
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

      <Sheet
        className="max-w-72 border-0 bg-transparent p-0 shadow-none"
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
          onSignOut={signOut}
          signingOut={signingOut}
          user={user}
        />
      </Sheet>
    </div>
  );
}
