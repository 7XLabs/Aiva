import Link from "next/link";
import Navbar from "@/components/Navbar";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/calls", label: "Calls", icon: "📞" },
  { href: "/dashboard/appointments", label: "Appointments", icon: "📅" },
  { href: "/dashboard/orders", label: "Orders", icon: "🍽️" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="container-page flex gap-8 py-8">
        <aside className="hidden w-52 shrink-0 md:block">
          <nav className="sticky top-24 space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </>
  );
}
