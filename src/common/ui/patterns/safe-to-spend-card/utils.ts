import { formatCurrency } from "@/src/common/formatters/locale";

export function formatMinor(minorValue: number, currency: string): string {
  return formatCurrency({ minorValue, currency });
}
