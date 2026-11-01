import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats whole minor units: 5575 -> "MVR 55.75", or "$55.75" for a one-character symbol. */
export function formatCurrency(minorUnits: number, currency: string) {
  const amount = (minorUnits / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency.length === 1 ? `${currency}${amount}` : `${currency} ${amount}`;
}

/** The one totals calculation, used for the live cart and again on the server. */
export function calcTotals(subtotal: number, taxPercent: number) {
  const taxAmount = Math.round((subtotal * taxPercent) / 100);
  return { subtotal, taxAmount, total: subtotal + taxAmount };
}

/** Likely amounts a customer hands over: the exact total, then the next round notes. */
export function cashSuggestions(total: number) {
  const rounded = [10, 50, 100, 500, 1000].map((note) => Math.ceil(total / (note * 100)) * note * 100);
  return [...new Set([total, ...rounded])].filter((amount) => amount >= total).slice(0, 5);
}
