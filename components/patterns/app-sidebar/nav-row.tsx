import Link from "next/link";
import { cn } from "@/lib/ui/cn";
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
    "group relative flex h-11 items-center rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
    expanded ? "w-full gap-3 px-3" : "mx-auto w-11 justify-center px-0",
    isActive
      ? "bg-[rgba(0,220,229,0.12)] font-medium text-white hover:bg-[rgba(0,220,229,0.18)]"
      : "text-[#8B95A5] hover:bg-white/[0.04] hover:text-[#C5CCD6]",
    item.status === "coming-soon" && "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-[#5B6472]",
  );

  const iconClass = cn(
    "shrink-0 transition-colors duration-200",
    isActive
      ? "text-[#00DCE5]"
      : "text-[#6B7580] group-hover:text-[#9AA3AF]",
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
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#00DCE5] shadow-[0_0_6px_rgba(0,220,229,0.6)]" />
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
