"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ActionItem } from "@/lib/types";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/calls", label: "Calls", icon: "📞" },
  { href: "/dashboard/appointments", label: "Appointments", icon: "📅" },
  { href: "/dashboard/orders", label: "Orders", icon: "🍽️" },
  { href: "/dashboard/tasks", label: "Action items", icon: "✅" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📈" },
  { href: "/dashboard/settings", label: "Knowledge", icon: "🧠" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openTasks, setOpenTasks] = useState(0);

  useEffect(() => {
    let active = true;
    async function poll() {
      try {
        const tasks: ActionItem[] = await fetch("/api/tasks").then((r) => r.json());
        if (active) setOpenTasks(tasks.filter((t) => !t.done).length);
      } catch {}
    }
    poll();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") poll();
    }, 10_000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  return (
    <nav className="sticky top-24 space-y-1">
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 ${
              active
                ? "bg-gradient-to-r from-brand-500/20 to-purple-500/10 font-medium text-white shadow-[inset_0_0_0_1px_rgba(84,100,251,0.3)]"
                : "text-slate-400 hover:translate-x-1 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <span className={active ? "" : "opacity-70 transition group-hover:opacity-100"}>
              {item.icon}
            </span>
            {item.label}
            {item.href === "/dashboard/tasks" && openTasks > 0 && (
              <span className="ml-auto rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                {openTasks}
              </span>
            )}
            {active && item.href !== "/dashboard/tasks" && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
