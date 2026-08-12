import type { ReactNode } from "react";

export type SidebarDestinationId =
  | "dashboard"
  | "transactions"
  | "ai-insights"
  | "budgets"
  | "goals"
  | "categories"
  | "recurring"
  | "reports"
  | "settings";

export interface NavItem {
  id: SidebarDestinationId;
  label: string;
  icon: ReactNode;
  status: "available" | "coming-soon";
}

export interface AppSidebarProps {
  activeDestinationId: SidebarDestinationId;
  hrefFor: (destination: SidebarDestinationId) => string;
  onNavigate?: () => void;
  onNewRecord?: () => void;
  onToggleCollapsed?: () => void;
  collapsed?: boolean;
}
