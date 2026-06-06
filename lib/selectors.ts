import { monthKey } from "./dates";
import type { Txn } from "./types";

export function sortByDateDesc(list: Txn[]): Txn[] {
  return [...list].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : b.at - a.at
  );
}

/** Sum amounts grouped by currency code. */
export function sumByCurrency(list: Txn[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of list) out[t.currency] = (out[t.currency] || 0) + t.amount;
  return out;
}

/** Distinct YYYY-MM keys present in the data, newest first. */
export function knownMonths(list: Txn[]): string[] {
  return [...new Set(list.map((t) => monthKey(t.date)))]
    .filter(Boolean)
    .sort()
    .reverse();
}

export const expensesOf = (list: Txn[]) => list.filter((t) => t.kind === "expense");
export const loansOf = (list: Txn[]) => list.filter((t) => t.kind === "loan");
