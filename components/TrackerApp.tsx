"use client";

import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useTransactions } from "@/hooks/useTransactions";
import { useToast } from "./Toast";
import Summary from "./Summary";
import AddTab from "./AddTab";
import SpendingTab from "./SpendingTab";
import LendingTab from "./LendingTab";
import ExportTab from "./ExportTab";
import EditSheet from "./EditSheet";
import ThemeToggle from "./ThemeToggle";
import TabBar, { type TabKey } from "./TabBar";
import type { Txn } from "@/lib/types";

interface Props {
  supabase: SupabaseClient;
  email: string;
}

export default function TrackerApp({ supabase, email }: Props) {
  const { txns, loaded, add, update, removeLocal, restore, commitDelete, toggleSettled } =
    useTransactions(supabase);
  const toast = useToast();
  const [active, setActive] = useState<TabKey>("add");
  const [range, setRange] = useState<"month" | "all">("month");
  const [editing, setEditing] = useState<Txn | null>(null);

  function handleDelete(id: string) {
    const removed = removeLocal(id);
    if (!removed) return;
    toast.show("Entry deleted", {
      actionLabel: "Undo",
      onUndo: () => restore(removed),
      onCommit: () => commitDelete(id),
    });
  }

  function changeTab(t: TabKey) {
    setActive(t);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <div className="hero">
        <header className="app-header">
          <div className="header-row">
            <div>
              <h1>Spendwise</h1>
              <p className="tagline">Know where your money goes.</p>
            </div>
            <div className="header-actions">
              <ThemeToggle />
              <button className="link-btn" onClick={() => supabase.auth.signOut()} title={email}>
                Sign out
              </button>
            </div>
          </div>
        </header>

        <Summary
          txns={txns}
          range={range}
          onToggleRange={() => setRange(range === "month" ? "all" : "month")}
        />
      </div>

      <main>
        <div className={`tab-panel ${active === "add" ? "active" : ""}`}>
          <AddTab
            txns={txns}
            loaded={loaded}
            add={add}
            onDelete={handleDelete}
            onEdit={setEditing}
            onToggleSettle={toggleSettled}
          />
        </div>
        <div className={`tab-panel ${active === "spending" ? "active" : ""}`}>
          <SpendingTab txns={txns} loaded={loaded} onDelete={handleDelete} onEdit={setEditing} />
        </div>
        <div className={`tab-panel ${active === "lending" ? "active" : ""}`}>
          <LendingTab
            txns={txns}
            loaded={loaded}
            add={add}
            onDelete={handleDelete}
            onEdit={setEditing}
            onToggleSettle={toggleSettled}
          />
        </div>
        <div className={`tab-panel ${active === "export" ? "active" : ""}`}>
          <ExportTab txns={txns} />
        </div>
      </main>

      <TabBar active={active} onChange={changeTab} />

      {editing && (
        <EditSheet
          txn={editing}
          onClose={() => setEditing(null)}
          onDelete={() => {
            handleDelete(editing.id);
            setEditing(null);
          }}
          onSave={(patch) => {
            update(editing.id, patch);
            setEditing(null);
            toast.show("Saved ✓");
          }}
        />
      )}
    </>
  );
}
