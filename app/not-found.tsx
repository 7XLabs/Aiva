import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="animate-floaty text-6xl">📵</div>
        <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight">
          This line doesn&apos;t exist.
        </h1>
        <p className="mt-3 max-w-md text-slate-400">
          The page you dialed was disconnected or never existed. AIVA would
          normally offer to transfer you — here&apos;s the next best thing.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/" className="btn-primary">
            Back home
          </Link>
          <Link href="/demo" className="btn-secondary">
            Talk to AIVA
          </Link>
        </div>
      </main>
    </>
  );
}
