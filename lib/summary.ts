import { currentMonthKey, monthKey, todayStr } from "./dates";
import { expensesOf, loansOf } from "./selectors";
import type { Txn } from "./types";

const r2 = (n: number) => Math.round(n * 100) / 100;
function roundMap(m: Record<string, number>) {
  const o: Record<string, number> = {};
  for (const k in m) o[k] = r2(m[k]);
  return o;
}
function roundNested(m: Record<string, Record<string, number>>) {
  const o: Record<string, Record<string, number>> = {};
  for (const k in m) o[k] = roundMap(m[k]);
  return o;
}

/**
 * Collapses all transactions into a small aggregate object. This is what gets
 * sent to the AI instead of every raw row — a few hundred tokens instead of
 * thousands, which keeps the per-analysis cost tiny.
 */
export function buildSummary(txns: Txn[]) {
  const exp = expensesOf(txns);
  const loans = loansOf(txns);
  const cm = currentMonthKey();

  const allTime: Record<string, number> = {};
  const thisMonth: Record<string, number> = {};
  const byMonth: Record<string, Record<string, number>> = {};
  const byCategory: Record<string, Record<string, number>> = {};

  for (const t of exp) {
    allTime[t.currency] = (allTime[t.currency] || 0) + t.amount;
    const mk = monthKey(t.date);
    if (mk === cm) thisMonth[t.currency] = (thisMonth[t.currency] || 0) + t.amount;
    byMonth[mk] = byMonth[mk] || {};
    byMonth[mk][t.currency] = (byMonth[mk][t.currency] || 0) + t.amount;
    const cat = t.category || "Other";
    byCategory[t.currency] = byCategory[t.currency] || {};
    byCategory[t.currency][cat] = (byCategory[t.currency][cat] || 0) + t.amount;
  }

  // Keep only the last 12 months to bound the payload.
  const recentMonths = Object.keys(byMonth).sort().reverse().slice(0, 12);
  const last12: Record<string, Record<string, number>> = {};
  for (const m of recentMonths) last12[m] = roundMap(byMonth[m]);

  const outstandingByPerson: Record<string, Record<string, number>> = {};
  const lent: Record<string, number> = {};
  const outstanding: Record<string, number> = {};
  const repaid: Record<string, number> = {};
  for (const t of loans) {
    lent[t.currency] = (lent[t.currency] || 0) + t.amount;
    if (t.settled) {
      repaid[t.currency] = (repaid[t.currency] || 0) + t.amount;
    } else {
      outstanding[t.currency] = (outstanding[t.currency] || 0) + t.amount;
      const p = t.person || "Someone";
      outstandingByPerson[p] = outstandingByPerson[p] || {};
      outstandingByPerson[p][t.currency] = (outstandingByPerson[p][t.currency] || 0) + t.amount;
    }
  }

  return {
    today: todayStr(),
    currentMonth: cm,
    expenses: {
      count: exp.length,
      allTimeByCurrency: roundMap(allTime),
      thisMonthByCurrency: roundMap(thisMonth),
      last12MonthsByCurrency: last12,
      allTimeByCategoryByCurrency: roundNested(byCategory),
    },
    loans: {
      count: loans.length,
      lentByCurrency: roundMap(lent),
      outstandingByCurrency: roundMap(outstanding),
      repaidByCurrency: roundMap(repaid),
      outstandingByPerson: roundNested(outstandingByPerson),
    },
  };
}

export type FinanceSummary = ReturnType<typeof buildSummary>;
