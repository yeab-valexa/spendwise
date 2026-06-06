import { DEFAULT_CURRENCY, WORD_TO_CURRENCY } from "./currency";
import { inferCategory } from "./categories";
import type { Kind, ParsedEntry } from "./types";

const FILLER = new Set(["to", "for", "on", "a", "the", "at", "in", "of"]);

/**
 * Turn a free-text line into a structured entry.
 *   "10 birr gum"               -> expense, 10 ETB, "gum", Food
 *   "108 usd claude subscription" -> expense, 108 USD, "claude subscription", Subscriptions
 *   "$108 claude"               -> expense, 108 USD, "claude", Subscriptions
 *   "lent 500 birr to abebe"    -> loan, 500 ETB, person "abebe"
 * Returns null if no usable amount could be found.
 */
export function parseEntry(raw: string): ParsedEntry | null {
  const text = (raw || "").trim();
  if (!text) return null;

  // Split glued amounts/currencies: "$108" -> "$ 108", "108usd" -> "108 usd"
  let work = text
    .replace(/([0-9])([a-zA-Z$€£])/g, "$1 $2")
    .replace(/([$€£])([0-9])/g, "$1 $2");

  let kind: Kind = "expense";
  let person = "";

  // Loan only when it starts with a lend keyword, so "10 birr to gum" stays an expense.
  const loanMatch = /^(lent|loaned|loan)\b\s*/i.exec(work);
  if (loanMatch) {
    kind = "loan";
    work = work.slice(loanMatch[0].length);
  }

  let tokens = work.split(/\s+/).filter(Boolean);

  // For loans, peel off "to <name>" first.
  if (kind === "loan") {
    const toIdx = tokens.findIndex((t) => t.toLowerCase() === "to");
    if (toIdx >= 0) {
      person = tokens.slice(toIdx + 1).join(" ");
      tokens = tokens.slice(0, toIdx);
    }
  }

  // Currency
  let currency = DEFAULT_CURRENCY;
  let curIdx = -1;
  tokens.forEach((t, i) => {
    if (curIdx >= 0) return;
    const key = t.toLowerCase().replace(/[.,]/g, "");
    if (WORD_TO_CURRENCY[key]) {
      currency = WORD_TO_CURRENCY[key];
      curIdx = i;
    }
  });

  // Amount: first number-looking token that isn't the currency.
  let amount: number | null = null;
  let amtIdx = -1;
  tokens.forEach((t, i) => {
    if (amount !== null || i === curIdx) return;
    if (/^\d[\d,]*\.?\d*$/.test(t)) {
      amount = parseFloat(t.replace(/,/g, ""));
      amtIdx = i;
    }
  });

  // Remaining tokens -> note (drop leading filler words like "to"/"for").
  const noteTokens = tokens.filter((_, i) => i !== curIdx && i !== amtIdx);
  while (noteTokens.length && FILLER.has(noteTokens[0].toLowerCase())) noteTokens.shift();
  const note = noteTokens.join(" ");

  if (amount === null || isNaN(amount) || amount <= 0) return null;
  if (kind === "expense" && !note) return null;

  return {
    kind,
    amount,
    currency,
    note,
    person: person.trim(),
    category: kind === "expense" ? inferCategory(note) : "",
  };
}
