export type Kind = "expense" | "loan";

export interface Txn {
  id: string;
  at: number; // creation timestamp (ms) — used for stable sorting
  kind: Kind;
  amount: number;
  currency: string; // ISO-ish code, e.g. "ETB", "USD"
  note: string;
  person?: string; // for loans: who you lent to
  category?: string; // for expenses
  date: string; // YYYY-MM-DD
  settled?: boolean; // for loans: repaid?
}

export interface ParsedEntry {
  kind: Kind;
  amount: number;
  currency: string;
  note: string;
  person: string;
  category: string;
}
