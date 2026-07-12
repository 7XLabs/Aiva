import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

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
          <Sidebar />
        </aside>
        <main className="min-w-0 flex-1 animate-fade-up">{children}</main>
      </div>
    </>
  );
}
