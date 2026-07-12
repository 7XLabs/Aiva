"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)]" : ""
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="group flex items-center gap-2.5 text-xl font-bold">
          <span className="transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
            <Logo />
          </span>
          <span className="font-display tracking-tight">AIVA</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          {[
            ["/#features", "Features"],
            ["/#industries", "Industries"],
            ["/#pricing", "Pricing"],
            ["/onboard", "Add your business"],
            ["/dashboard", "Dashboard"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="relative py-1 transition-colors hover:text-white after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-brand-400 after:to-purple-400 after:transition-transform after:duration-300 hover:after:scale-x-100"
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/demo" className="btn-primary !px-4 !py-2 text-sm">
          Try the demo
        </Link>
      </div>
    </header>
  );
}
