export const INR_CURRENCY = "inr" as const;
export const INR_MINOR_UNITS = 100;

/** Convert an input/display rupee amount to authoritative paise. */
export function toMinorUnits(amount: number): number {
  if (!Number.isFinite(amount)) throw new Error("Money amount must be finite");
  const minor = Math.round(amount * INR_MINOR_UNITS);
  if (!Number.isSafeInteger(minor) || minor < 0) throw new Error("Money amount is out of range");
  return minor;
}

export function fromMinorUnits(amountMinor: number): number {
  if (!Number.isSafeInteger(amountMinor)) throw new Error("Minor money amount must be an integer");
  return amountMinor / INR_MINOR_UNITS;
}

export function formatInr(amountMinor: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(fromMinorUnits(amountMinor));
}

export function assertMinorAmount(amount: number, field = "amount"): number {
  if (!Number.isSafeInteger(amount) || amount < 0) throw new Error(`${field} must be a non-negative integer minor amount`);
  return amount;
}
