// Custom UI primitives (project-owned) — these are the primary exports
export * from "./actions";
export * from "./animated-number";
export * from "./data-display";
export * from "./feedback";
export * from "./forms";
export * from "./overlays";
export * from "@/lib/ui/primitive-registry";
export * from "@/lib/ui/animations";

// shadcn/ui components (non-conflicting additions)
// Note: Button, Badge, Card, Alert, Skeleton are provided by the custom primitives above.
// Import shadcn versions directly from their files if needed for specific use cases.
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
export { Progress } from "./progress";
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip";
export { Input } from "./input";
export { Separator } from "./separator";
export { Avatar, AvatarImage, AvatarFallback } from "./avatar";
export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "./chart";
