"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
            {active && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
