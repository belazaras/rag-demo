// components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "About" },
  { href: "/rag", label: "RAG Demo" },
  { href: "/studio", label: "Podcast Studio" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-white/70 backdrop-blur dark:bg-neutral-950/70">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full gradient-bg" />
          <span className="text-sm font-semibold tracking-tight">
            Nico Belazaras
          </span>
        </Link>

        {/* Links */}
        <ul className="hidden gap-1 md:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "px-3 py-1.5 text-sm rounded-full",
                    active
                      ? "bg-white text-black dark:bg-white dark:text-black"
                      : "text-white/80 hover:text-white hover:bg-white/10",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="mailto:belazaras@live.com"
            className="text-sm text-white/80 hover:text-white underline decoration-white/30 hover:decoration-white"
          >
            Hire me
          </a>
        </div>

        {/* Mobile: simple menu link to email (keep it minimal) */}
        <div className="md:hidden">
          <a
            href="mailto:belazaras@live.com"
            className="text-sm rounded-full px-3 py-1.5 text-white bg-white/10 hover:bg-white/15"
          >
            Hire
          </a>
        </div>
      </nav>
    </header>
  );
}
