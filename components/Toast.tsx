"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";

interface ShowOpts {
  actionLabel?: string;
  onUndo?: () => void;
  onCommit?: () => void;
  duration?: number;
}

interface ToastApi {
  show: (msg: string, opts?: ShowOpts) => void;
}

const ToastCtx = createContext<ToastApi>({ show: () => {} });

export function useToast() {
  return useContext(ToastCtx);
}

interface Current {
  undo?: () => void;
  commit?: () => void;
  timer?: ReturnType<typeof setTimeout>;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<{ msg: string; actionLabel?: string; n: number } | null>(null);
  const cur = useRef<Current | null>(null);
  const seq = useRef(0);

  const finalize = useCallback((runCommit: boolean) => {
    const c = cur.current;
    if (!c) return;
    if (c.timer) clearTimeout(c.timer);
    cur.current = null;
    setView(null);
    if (runCommit && c.commit) c.commit();
  }, []);

  const show = useCallback(
    (msg: string, opts: ShowOpts = {}) => {
      finalize(true); // commit any previous pending action before showing the next
      const n = ++seq.current;
      const timer = setTimeout(() => finalize(true), opts.duration ?? 4500);
      cur.current = { undo: opts.onUndo, commit: opts.onCommit, timer };
      setView({ msg, actionLabel: opts.actionLabel, n });
    },
    [finalize]
  );

  const onAction = () => {
    const c = cur.current;
    if (c?.timer) clearTimeout(c.timer);
    cur.current = null;
    setView(null);
    if (c?.undo) c.undo();
  };

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      {view && (
        <div className="toast" key={view.n} role="status">
          <span>{view.msg}</span>
          {view.actionLabel && (
            <button className="toast-action" onClick={onAction}>
              {view.actionLabel}
            </button>
          )}
        </div>
      )}
    </ToastCtx.Provider>
  );
}
