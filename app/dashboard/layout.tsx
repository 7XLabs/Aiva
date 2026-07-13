import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};
import Sidebar from "@/components/Sidebar";
import { BusinessProvider, BusinessSelect } from "@/components/BusinessFilter";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BusinessProvider>
      <Navbar />
      <div className="container-page flex gap-8 py-8">
        <aside className="hidden w-52 shrink-0 md:block">
          <div className="sticky top-24">
            <div className="mb-4">
              <BusinessSelect />
            </div>
            <Sidebar />
          </div>
        </aside>
        <main className="min-w-0 flex-1 animate-fade-up">{children}</main>
      </div>
    </BusinessProvider>
  );
}
