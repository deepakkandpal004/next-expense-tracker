import Link from "next/link";
import { cn } from "@/src/common/ui/cn";
import type { AppSidebarProps, NavItem } from "./types";

export function NavRow({
  item,
  isActive,
  hrefFor,
  onNavigate,
  expanded,
}: {
  item: NavItem;
  isActive: boolean;
  hrefFor: AppSidebarProps["hrefFor"];
  onNavigate?: () => void;
  expanded: boolean;
}) {
  const baseClass = cn(
    "group relative flex h-11 items-center rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
    expanded ? "w-full gap-3 px-3" : "mx-auto w-11 justify-center px-0",
    isActive
      ? "bg-primary-muted font-medium text-white hover:bg-primary/18"
      : "text-muted-foreground hover:bg-white/[0.04] hover:text-on-surface-variant",
    item.status === "coming-soon" && "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-text-tertiary",
  );

  const iconClass = cn(
    "shrink-0 transition-colors duration-200",
    isActive
      ? "text-primary"
      : "text-text-tertiary group-hover:text-on-surface-variant",
  );

  const content = (
    <>
      <span aria-hidden="true" className={iconClass}>
        {item.icon}
      </span>
      <span
        className={cn(
          "truncate text-sm font-medium whitespace-nowrap transition-all duration-200",
          expanded
            ? "min-w-0 flex-1 opacity-100"
            : "w-0 flex-none overflow-hidden opacity-0",
        )}
      >
        {item.label}
      </span>
      {isActive && expanded && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_6px_var(--primary)]" />
      )}
    </>
  );

  if (item.status === "coming-soon") {
    return (
      <button
        type="button"
        aria-disabled="true"
        className={baseClass}
        disabled
        title={`${item.label} — coming soon`}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={baseClass}
      href={hrefFor(item.id)}
      onClick={onNavigate}
      title={!expanded ? item.label : undefined}
    >
      {content}
    </Link>
  );
}
