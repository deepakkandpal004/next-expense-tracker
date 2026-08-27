import { Decimal } from "@prisma/client/runtime/library";

/**
 * Money helpers — safe conversion between Decimal/number and minor units (cents).
 * Previously code did `Math.round(amount * 100)` on Float, which drifts (0.1+0.2).
 * Now DB stores Decimal(15,2), so amount may be Decimal, number, or string.
 */

export type MoneyValue = number | string | Decimal;

export function toNumber(amount: MoneyValue): number {
  if (typeof amount === "number") return amount;
  if (typeof amount === "string") return Number(amount);
  // Prisma Decimal
  if (amount && typeof (amount as Decimal).toNumber === "function") {
    return (amount as Decimal).toNumber();
  }
  return Number(amount);
}

export function toMinorUnits(amount: MoneyValue): number {
  return Math.round(toNumber(amount) * 100);
}

export function fromMinorUnits(minor: number): number {
  return minor / 100;
}

export function decimalFromMinor(minor: number): Decimal {
  return new Decimal(fromMinorUnits(minor));
}

export function isValidMinor(minor: number): boolean {
  return Number.isSafeInteger(minor) && minor > 0 && minor <= 999_999_999 * 100;
}
