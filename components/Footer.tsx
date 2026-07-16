import Link from "next/link";
import Logo from "./Logo";

const COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: "Product",
    links: [
      ["/#features", "Features"],
      ["/#open-source", "Open source"],
      ["/demo", "Live demo"],
      ["/onboard", "AI onboarding"],
    ],
  },
  {
    title: "Industries",
    links: [
      ["/#industries", "Clinics"],
      ["/#industries", "Salons"],
      ["/#industries", "Restaurants"],
      ["/#industries", "Hotels"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["/dashboard", "Dashboard"],
      ["/dashboard/analytics", "Analytics"],
      ["https://github.com/7XLabs/aiva", "GitHub"],
      ["https://github.com/7XLabs/aiva/blob/main/docs/API.md", "API docs"],
      ["https://github.com/7XLabs/aiva/blob/main/docs/ARCHITECTURE.md", "Architecture"],
      ["https://github.com/7XLabs/aiva/blob/main/docs/FAQ.md", "FAQ"],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/20">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5 text-xl font-bold">
            <Logo size={28} />
            <span className="font-display tracking-tight">AIVA</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            The AI receptionist that answers every call, in every language,
            around the clock.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold text-slate-200">{col.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              {col.links.map(([href, label], i) => (
                <li key={`${href}-${i}`}>
                  {href.startsWith("http") ? (
                    <a href={href} target="_blank" rel="noreferrer" className="transition hover:text-white">
                      {label}
                    </a>
                  ) : (
                    <Link href={href} className="transition hover:text-white">
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 py-6">
        <p className="container-page text-center text-xs text-slate-500">
          © {new Date().getFullYear()} AIVA by 7XLabs. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
