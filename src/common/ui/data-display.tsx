import { createElement, type HTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/common/ui/cn";
import { enforceSentenceCase } from "@/src/common/ui/primitive-registry";
import { formatCurrency, formatDate, formatDateTime, formatExactTime, type CurrencyFormatOptions, type DateTimeFormatOptions } from "@/src/common/formatters/locale";
import type { CurrencyCode, ISODate, ISODateTime, MinorUnitAmount } from "@/src/common/domain/types";

const badgeVariants = cva(
  "inline-flex min-h-6 max-w-full items-center gap-1 rounded-circular px-2 py-0.5 text-interface-xs font-semibold",
  {
    variants: {
      tone: {
        neutral: "bg-surface-subtle text-foreground",
        info: "bg-info-surface text-info-foreground",
        success: "bg-success-surface text-success-foreground",
        warning: "bg-warning-surface text-warning-foreground",
        danger: "bg-danger-surface text-danger-foreground",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  children: ReactNode;
  symbol?: ReactNode;
}

export function Badge({ children, symbol, tone, className, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props}>{symbol ? <span aria-hidden="true">{symbol}</span> : null}{children}</span>;
}

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "article" | "section";
  elevation?: "flat" | "raised";
}

export function Card({ as = "div", elevation = "flat", className, ...props }: CardProps) {
  return createElement(as, {
    className: cn(
      "min-w-0 rounded-2xl bg-surface p-4 text-foreground",
      elevation === "raised" && "shadow-sm",
      className,
    ),
    ...props,
  });
}

export interface DataTableColumn<TRow> {
  id: string;
  header: string;
  rowHeader?: boolean;
  align?: "start" | "center" | "end";
  render: (row: TRow) => ReactNode;
}

export interface DataTableProps<TRow> {
  caption: string;
  columns: readonly DataTableColumn<TRow>[];
  rows: readonly TRow[];
  rowKey: (row: TRow) => string;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<TRow>({ caption, columns, rows, rowKey, emptyMessage = "No data available", className }: DataTableProps<TRow>) {
  enforceSentenceCase(caption, "Table caption");
  columns.forEach((column) => enforceSentenceCase(column.header, "Column heading"));
  return (
    <div aria-label={caption} className={cn("custom-scrollbar max-w-full overflow-x-auto rounded-2xl", className)} role="region" tabIndex={0}>
      <table className="w-full min-w-max border-collapse text-left text-interface-sm">
        <caption className="p-3 text-left font-semibold text-foreground">{caption}</caption>
        <thead className="bg-surface-subtle text-foreground">
          <tr>{columns.map((column) => <th className={cn("border-y border-border px-3 py-2 font-semibold", column.align === "end" && "text-right", column.align === "center" && "text-center")} key={column.id} scope="col">{column.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row) => (
            <tr className="border-b border-border last:border-0" key={rowKey(row)}>
              {columns.map((column) => {
                const Cell = column.rowHeader ? "th" : "td";
                return <Cell className={cn("max-w-none whitespace-normal break-words px-3 py-3 align-top text-foreground", column.align === "end" && "text-right tabular-nums", column.align === "center" && "text-center")} key={column.id} scope={column.rowHeader ? "row" : undefined}>{column.render(row)}</Cell>;
              })}
            </tr>
          )) : <tr><td className="px-3 py-6 text-center text-foreground-secondary" colSpan={columns.length}>{emptyMessage}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export interface SectionHeaderProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description?: ReactNode;
  metadata?: ReactNode;
  action?: ReactNode;
  headingLevel?: 2 | 3 | 4;
}

export function SectionHeader({ title, description, metadata, action, headingLevel = 2, className, ...props }: SectionHeaderProps) {
  // Display headings intentionally allow Title Case and other conventions.
  // Enforcement is limited to interactive labels (buttons, nav, tooltips).
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <header className={cn("flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)} {...props}>
      <div className="min-w-0">
        <Heading className="text-display-sm font-semibold text-foreground">{title}</Heading>
        {description ? <div className="mt-1 text-interface-sm text-foreground-secondary">{description}</div> : null}
        {metadata ? <div className="mt-1 text-interface-xs text-foreground-secondary">{metadata}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export interface CurrencyTextProps extends HTMLAttributes<HTMLDataElement>, CurrencyFormatOptions {
  minorValue: MinorUnitAmount;
  currency: CurrencyCode;
  showCode?: boolean;
}

export function CurrencyText({ minorValue, currency, showCode = false, locale, browserLocales, currencyDisplay, className, ...props }: CurrencyTextProps) {
  const options = { locale, browserLocales, currencyDisplay };
  const visible = formatCurrency({ minorValue, currency }, options);
  const exact = formatCurrency({ minorValue, currency }, { ...options, currencyDisplay: "code" });
  return (
    <data aria-label={exact} className={cn("financial-value whitespace-normal break-words", className)} data-financial-value title={exact} value={`${currency} ${minorValue}`} {...props}>
      {visible}{showCode ? ` ${currency}` : ""}
    </data>
  );
}

type DateDisplayValue = Date | ISODate | ISODateTime | number;
export interface DateTextProps extends HTMLAttributes<HTMLTimeElement>, DateTimeFormatOptions {
  value: DateDisplayValue;
  format?: "date" | "date-time";
  exactAlternative?: boolean;
}

export function DateText({ value, format = "date", exactAlternative = true, locale, browserLocales, timeZone, className, ...props }: DateTextProps) {
  const options = { locale, browserLocales, timeZone };
  let visible: string;
  let exact: string;
  let dateTime: string;
  try {
    visible = format === "date-time" ? formatDateTime(value, options) : formatDate(value, options);
    exact = formatExactTime(value, options);
    dateTime = value instanceof Date ? value.toISOString() : typeof value === "number" ? new Date(value).toISOString() : value;
  } catch {
    return <span {...props} className={className}>{String(value)}</span>;
  }
  return <time {...props} className={className} dateTime={dateTime} title={exactAlternative ? exact : undefined} aria-label={exactAlternative ? exact : undefined}>{visible}</time>;
}
