import {
  FileBarChart,
  LayoutDashboard,
  Layers,
  Sparkles,
  ListChecks,
  Repeat,
  Settings,
  Target,
  Wallet,
} from "lucide-react";
import type { NavItem, SidebarDestinationId } from "./types";

export const NAV_ITEMS: readonly NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} strokeWidth={2} />, status: "available" },
  { id: "transactions", label: "Transactions", icon: <ListChecks size={18} strokeWidth={2} />, status: "available" },
  { id: "ai-insights", label: "AI Insights", icon: <Sparkles size={18} strokeWidth={2} />, status: "available" },
  { id: "budgets", label: "Budgets", icon: <Wallet size={18} strokeWidth={2} />, status: "available" },
  { id: "goals", label: "Goals", icon: <Target size={18} strokeWidth={2} />, status: "available" },
  { id: "categories", label: "Categories", icon: <Layers size={18} strokeWidth={2} />, status: "available" },
  { id: "recurring", label: "Recurring", icon: <Repeat size={18} strokeWidth={2} />, status: "available" },
  { id: "reports", label: "Reports", icon: <FileBarChart size={18} strokeWidth={2} />, status: "available" },
  { id: "settings", label: "Settings", icon: <Settings size={18} strokeWidth={2} />, status: "available" },
];

export const NAV_SECTIONS: readonly { title: string; items: SidebarDestinationId[] }[] = [
  { title: "Overview", items: ["dashboard", "transactions", "ai-insights"] },
  { title: "Manage", items: ["budgets", "goals", "categories", "recurring"] },
  { title: "Analytics", items: ["reports", "settings"] },
];
