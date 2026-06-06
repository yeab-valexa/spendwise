import { buildSummary } from "./summary";
import { todayStr } from "./dates";
import type { Txn } from "./types";

function esc(v: string | number | boolean | undefined | null): string {
  const s = v === undefined || v === null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const COLS = ["date", "kind", "amount", "currency", "note", "category", "person", "settled"];

export function toCSV(txns: Txn[]): string {
  const rows = txns.map((t) =>
    [
      t.date,
      t.kind,
      t.amount,
      t.currency,
      t.note,
      t.category ?? "",
      t.person ?? "",
      t.settled ? "yes" : "no",
    ]
      .map(esc)
      .join(",")
  );
  return [COLS.join(","), ...rows].join("\n");
}

/**
 * A ready-to-paste prompt for claude.ai: instructions + a precomputed summary
 * + the full transactions as CSV. Lets the user analyze on their Claude plan
 * with zero API cost.
 */
export function buildClaudePrompt(txns: Txn[]): string {
  const summary = buildSummary(txns);
  return `I track my expenses and money I lend out. I spend in multiple currencies — please keep each currency SEPARATE (never add or convert across currencies).

Please analyze my finances: where my money goes per currency, month-to-month trends, anything I should watch out for, money currently owed to me, and 3-5 practical tips. Always show amounts with their currency code.

QUICK SUMMARY (precomputed JSON):
${JSON.stringify(summary, null, 2)}

FULL TRANSACTIONS (CSV):
${toCSV(txns)}`;
}

export function exportFilename(ext: string): string {
  return `spendwise-${todayStr()}.${ext}`;
}
