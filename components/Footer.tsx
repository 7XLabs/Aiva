import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/60 py-10">
      <div className="container-page flex flex-col items-center justify-between gap-4 text-sm text-slate-400 md:flex-row">
        <p>© {new Date().getFullYear()} AIVA by 7XLabs. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/demo" className="hover:text-white">Demo</Link>
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <a
            href="https://github.com/7XLabs/aiva"
            className="hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
