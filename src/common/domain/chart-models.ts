import { getCategoryDefinition } from "./categories";
import { formatCurrency, formatDate, formatPercentage, type LocaleOptions } from "../formatters/locale";
import type { ChartModel, CurrencyCode, ResolvedPeriod, Transaction } from "./types";

export const TREND_CHART_TITLE = "Income and spending trend";
export const CATEGORY_CHART_TITLE = "Spending by category";

export interface ChartModelBuildOptions extends LocaleOptions {
  period: ResolvedPeriod;
  currency: CurrencyCode;
}

function periodLabel(period: ResolvedPeriod, options: LocaleOptions): string {
  const start = formatDate(period.start, options);
  const end = formatDate(period.end, options);
  return period.start === period.end ? start : `${start} – ${end}`;
}

function formattedCurrencyValues(
  values: readonly number[],
  currency: CurrencyCode,
  options: LocaleOptions,
): readonly string[] {
  return values.map((minorValue) => formatCurrency({ minorValue, currency }, options));
}

function baseChart(
  title: string,
  { period, currency, ...formatting }: ChartModelBuildOptions,
): Omit<ChartModel, "state" | "series" | "rows"> {
  return {
    title,
    periodLabel: periodLabel(period, formatting),
    unit: "currency",
    unitLabel: currency,
    currency,
  };
}

/** Builds a chart state for a valid subset that has no recorded transactions. */
export function buildEmptyChartModel(
  title: string,
  options: ChartModelBuildOptions,
): ChartModel {
  return { ...baseChart(title, options), state: "empty", series: [], rows: [] };
}

/** Builds a chart failure state without misrepresenting unavailable data as empty data. */
export function buildErrorChartModel(
  title: string,
  options: ChartModelBuildOptions,
  errorMessage: string,
): ChartModel {
  return {
    ...buildEmptyChartModel(title, options),
    state: "error",
    errorMessage,
  };
}

/**
 * Builds the time-series chart from the reporting subset selected by the
 * dashboard query. It intentionally does not apply a second period filter.
 */
export function buildTrendChartModel(
  activeRecords: readonly Transaction[],
  options: ChartModelBuildOptions,
): ChartModel {
  if (activeRecords.length === 0) {
    return buildEmptyChartModel(TREND_CHART_TITLE, options);
  }

  const totalsByDate = new Map<string, { income: number; spending: number }>();
  for (const record of activeRecords) {
    const date = record.occurredOn.slice(0, 10);
    const totals = totalsByDate.get(date) ?? { income: 0, spending: 0 };
    if (record.type === "income") totals.income += record.amountMinor;
    else totals.spending += record.amountMinor;
    totalsByDate.set(date, totals);
  }

  const { currency, ...formatting } = options;
  const rows = Array.from(totalsByDate.entries())
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([date, totals]) => ({
      key: date,
      label: formatDate(date, formatting),
      values: [totals.income, totals.spending],
      formattedValues: formattedCurrencyValues(
        [totals.income, totals.spending],
        currency,
        formatting,
      ),
    }));
  const incomeMinor = rows.reduce((total, row) => total + row.values[0], 0);
  const spendingMinor = rows.reduce((total, row) => total + row.values[1], 0);

  return {
    ...baseChart(TREND_CHART_TITLE, options),
    state: "ready",
    interpretation: `Recorded income of ${formatCurrency({ minorValue: incomeMinor, currency }, formatting)} and spending of ${formatCurrency({ minorValue: spendingMinor, currency }, formatting)} across ${rows.length} day${rows.length === 1 ? "" : "s"}.`,
    series: [
      { id: "income", label: "Income", semanticToken: "category-income", symbol: "star" },
      { id: "spending", label: "Spending", semanticToken: "danger", symbol: "circle" },
    ],
    rows,
  };
}

/**
 * Builds the category distribution from the same active reporting subset as
 * the trend. Unknown persisted categories intentionally share the "Other"
 * registry definition so every consumer has one deterministic fallback.
 */
export function buildCategoryChartModel(
  activeRecords: readonly Transaction[],
  options: ChartModelBuildOptions,
): ChartModel {
  const totalsByCategory = new Map<string, number>();
  for (const record of activeRecords) {
    if (record.type !== "expense") continue;
    const category = getCategoryDefinition(record.categoryId);
    totalsByCategory.set(
      category.id,
      (totalsByCategory.get(category.id) ?? 0) + record.amountMinor,
    );
  }
  if (totalsByCategory.size === 0) {
    return buildEmptyChartModel(CATEGORY_CHART_TITLE, options);
  }

  const { currency, ...formatting } = options;
  const totalSpendingMinor = Array.from(totalsByCategory.values()).reduce(
    (total, amountMinor) => total + amountMinor,
    0,
  );
  const rows = Array.from(totalsByCategory.entries())
    .map(([categoryId, amountMinor]) => ({
      category: getCategoryDefinition(categoryId),
      amountMinor,
    }))
    .sort(
      (first, second) =>
        second.amountMinor - first.amountMinor || first.category.label.localeCompare(second.category.label),
    )
    .map(({ category, amountMinor }) => {
      const share = totalSpendingMinor === 0 ? 0 : amountMinor / totalSpendingMinor;
      return {
        key: category.id,
        label: category.label,
        values: [amountMinor],
        formattedValues: formattedCurrencyValues([amountMinor], currency, formatting),
        percentages: [share],
        formattedPercentages: [formatPercentage(share, formatting)],
        semanticToken: category.semanticToken,
        symbol: category.symbol,
      };
    });
  const largest = rows[0];

  return {
    ...baseChart(CATEGORY_CHART_TITLE, options),
    state: "ready",
    interpretation: `${largest.label} is the largest spending category at ${largest.formattedValues[0]} (${largest.formattedPercentages?.[0]} of recorded spending).`,
    series: [{ id: "spending", label: "Spending", semanticToken: "danger", symbol: "circle" }],
    rows,
  };
}
