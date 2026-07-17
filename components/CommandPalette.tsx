"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Ctrl/Cmd-K jump menu for the dashboard.
const COMMANDS: { label: string; href: string; icon: string }[] = [
  { label: "Overview", href: "/dashboard", icon: "📊" },
  { label: "Calls", href: "/dashboard/calls", icon: "📞" },
  { label: "Appointments", href: "/dashboard/appointments", icon: "📅" },
  { label: "Orders", href: "/dashboard/orders", icon: "🍽️" },
  { label: "Action items", href: "/dashboard/tasks", icon: "✅" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "📈" },
  { label: "Knowledge editor", href: "/dashboard/settings", icon: "🧠" },
  { label: "Try the demo", href: "/demo", icon: "🎙️" },
  { label: "Add a business", href: "/onboard", icon: "✨" },
];

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  const matches = COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 pt-32 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && matches[0]) go(matches[0].href);
          }}
          placeholder="Jump to…"
          className="w-full border-b border-slate-800 bg-transparent px-4 py-3 text-sm outline-none"
        />
        <ul className="max-h-72 overflow-y-auto p-2">
          {matches.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-500">No matches</li>
          )}
          {matches.map((c) => (
            <li key={c.href}>
              <button
                onClick={() => go(c.href)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-white/5"
              >
                <span>{c.icon}</span>
                {c.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-slate-800 px-4 py-2 text-[11px] text-slate-600">
          ⌘K / Ctrl-K to toggle · Enter to open · Esc to close
        </div>
      </div>
    </div>
  );
}
