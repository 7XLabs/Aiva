import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm">
            📞
          </span>
          AIVA
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <Link href="/#features" className="hover:text-white">Features</Link>
          <Link href="/#industries" className="hover:text-white">Industries</Link>
          <Link href="/#how-it-works" className="hover:text-white">How it works</Link>
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
        </nav>
        <Link href="/demo" className="btn-primary !px-4 !py-2 text-sm">
          Try the demo
        </Link>
      </div>
    </header>
  );
}
