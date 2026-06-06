"use client";

import { useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";

const NEXT: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" };
const ICON: Record<Theme, string> = { system: "🌗", light: "☀️", dark: "🌙" };
const LABEL: Record<Theme, string> = { system: "Auto", light: "Light", dark: "Dark" };

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    try {
      const t = localStorage.getItem("sw-theme") as Theme | null;
      setTheme(t === "light" || t === "dark" ? t : "system");
    } catch {}
  }, []);

  function apply(t: Theme) {
    setTheme(t);
    try {
      if (t === "system") {
        delete document.documentElement.dataset.theme;
        localStorage.removeItem("sw-theme");
      } else {
        document.documentElement.dataset.theme = t;
        localStorage.setItem("sw-theme", t);
      }
    } catch {}
  }

  return (
    <button
      className="link-btn theme-btn"
      onClick={() => apply(NEXT[theme])}
      title={`Theme: ${LABEL[theme]}`}
      aria-label={`Theme: ${LABEL[theme]} (tap to change)`}
    >
      {ICON[theme]}
    </button>
  );
}
