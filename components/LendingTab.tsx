"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CURRENCIES, formatMoney } from "@/lib/currency";
import { todayStr } from "@/lib/dates";
import { loansOf, sortByDateDesc } from "@/lib/selectors";
import type { NewTxn } from "@/hooks/useTransactions";
import type { Txn } from "@/lib/types";
import TxnItem from "./TxnItem";
import EmptyState from "./EmptyState";
import SkeletonList from "./Skeleton";
import { useToast } from "./Toast";

interface Props {
  txns: Txn[];
  loaded: boolean;
  add: (t: NewTxn) => void;
  onDelete: (id: string) => void;
  onEdit: (t: Txn) => void;
  onToggleSettle: (id: string) => void;
}

const emptyLoan = () => ({
  amount: "",
  currency: "ETB",
  person: "",
  note: "",
  date: todayStr(),
});

export default function LendingTab({ txns, loaded, add, onDelete, onEdit, onToggleSettle }: Props) {
  const [form, setForm] = useState(emptyLoan);
  const toast = useToast();

  function submit(e: FormEvent) {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0 || !form.person.trim()) return;
    const who = form.person.trim();
    add({
      kind: "loan",
      amount: amt,
      currency: form.currency,
      person: who,
      note: form.note.trim(),
      date: form.date || todayStr(),
    });
    setForm(emptyLoan());
    toast.show(`Loan to ${who} recorded 🤝`);
  }

  const loans = loansOf(txns);

  // Who owes you — unsettled loans, grouped by person then currency.
  const byPerson: Record<string, Record<string, number>> = {};
  for (const t of loans) {
    if (t.settled) continue;
    const name = t.person || "Someone";
    byPerson[name] = byPerson[name] || {};
    byPerson[name][t.currency] = (byPerson[name][t.currency] || 0) + t.amount;
  }
  const people = Object.entries(byPerson);

  const sorted = sortByDateDesc(loans);

  return (
    <>
      <div className="card">
        <h2>Lend money</h2>
        <p className="hint">Track money you&apos;ve lent out so you don&apos;t forget who owes you.</p>
        <form className="detail-form" onSubmit={submit} autoComplete="off">
          <label>
            Amount
            <input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </label>
          <label>
            Currency
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              {Object.entries(CURRENCIES).map(([code, info]) => (
                <option key={code} value={code}>
                  {code} — {info.name}
                </option>
              ))}
            </select>
          </label>
          <label className="full">
            Who did you lend to?
            <input
              type="text"
              placeholder="e.g. Abebe"
              required
              value={form.person}
              onChange={(e) => setForm({ ...form, person: e.target.value })}
            />
          </label>
          <label className="full">
            Note (optional)
            <input
              type="text"
              placeholder="e.g. for taxi"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </label>
          <label>
            Date
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>
          <button type="submit" className="btn primary full">
            Record loan
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Who owes you</h2>
        {!loaded ? (
          <SkeletonList rows={2} />
        ) : people.length ? (
          <div className="owed-summary">
            {people.map(([name, curs]) => (
              <div className="owed-row" key={name}>
                <span className="owed-name">{name}</span>
                <span className="owed-amt">
                  {Object.entries(curs)
                    .map(([c, a]) => formatMoney(a, c))
                    .join(" · ")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState emoji="🎉" title="All clear" sub="Nobody owes you right now." />
        )}
      </div>

      <div className="card">
        <h2>All loans</h2>
        {!loaded ? (
          <SkeletonList rows={3} />
        ) : sorted.length ? (
          <ul className="txn-list">
            {sorted.map((t) => (
              <TxnItem
                key={t.id}
                txn={t}
                onDelete={onDelete}
                onEdit={onEdit}
                showSettle
                onToggleSettle={onToggleSettle}
              />
            ))}
          </ul>
        ) : (
          <EmptyState emoji="🤝" title="No loans yet" sub="Record money you lend out above." />
        )}
      </div>
    </>
  );
}
