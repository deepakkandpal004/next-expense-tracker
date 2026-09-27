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
    "group relative flex h-9 items-center rounded-lg text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
    expanded ? "w-full gap-2.5 px-2.5" : "mx-auto w-9 justify-center px-0",
    isActive
      ? "bg-white/[0.08] text-white font-semibold"
      : "text-text-secondary hover:bg-white/[0.04] hover:text-white",
    item.status === "coming-soon" && "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-text-tertiary",
  );

  const iconClass = cn(
    "shrink-0 transition-colors duration-150",
    isActive
      ? "text-primary"
      : "text-text-tertiary group-hover:text-text-secondary",
  );

  const content = (
    <>
      <span aria-hidden="true" className={iconClass}>
        {item.icon}
      </span>
      <span
        className={cn(
          "truncate whitespace-nowrap transition-all duration-150",
          expanded
            ? "min-w-0 flex-1 opacity-100"
            : "w-0 flex-none overflow-hidden opacity-0",
        )}
      >
        {item.label}
      </span>
      {isActive && expanded && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
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
