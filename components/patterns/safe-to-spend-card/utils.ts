import { formatCurrency } from "@/lib/formatters/locale";

export function formatMinor(minorValue: number, currency: string): string {
  return formatCurrency({ minorValue, currency });
}
