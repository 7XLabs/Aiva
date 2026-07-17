"use client";

import { useEffect, useState } from "react";

// Persisted light/dark toggle. Defaults to dark (the brand look) but honors a
// saved choice. Sets data-theme on <html> which globals.css keys off of.
export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = (localStorage.getItem("aiva.theme") as "dark" | "light") ?? "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("aiva.theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle color theme"
      title={theme === "dark" ? "Switch to light" : "Switch to dark"}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/80 text-lg transition hover:border-slate-500"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
