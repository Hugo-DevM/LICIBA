"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./logo";

const NAV = [
  { id: "inicio", label: "Inicio", href: "/" },
  { id: "carreras", label: "Carreras", href: "/carreras" },
  { id: "eventos", label: "Eventos", href: "/eventos" },
  { id: "ranking", label: "Ranking", href: "/ranking" },
];

function activeFor(id: string, pathname: string, href: string) {
  if (id === "inicio") return pathname === "/";
  return pathname.startsWith(href);
}

export function SiteHeader({
  desktopAccountLink,
  mobileAccountLink,
}: {
  desktopAccountLink: React.ReactNode;
  mobileAccountLink: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-liciba-ink text-white font-sans">
      <div className="flex h-1.5">
        <div className="flex-[3] bg-liciba-green" />
        <div className="flex-[2] bg-liciba-blue" />
        <div className="flex-1 bg-liciba-orange" />
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5">
        <Link
          href="/"
          aria-label="LICIBA · Inicio"
          className="flex flex-none items-center gap-3 text-white no-underline"
        >
          <Logo tone="dark" height={54} />
          <div className="hidden md:flex flex-col border-l border-white/20 pl-3 font-display font-bold uppercase leading-[1.05] tracking-wide text-[13px]">
            <span>Liga de Ciclismo</span>
            <span className="text-liciba-amber">Puerto Vallarta</span>
          </div>
        </Link>

        <nav className="ml-auto hidden md:flex items-center gap-1">
          {NAV.map((n) => {
            const active = activeFor(n.id, pathname, n.href);
            return (
              <Link
                key={n.id}
                href={n.href}
                className={`relative px-3.5 py-5 font-display font-bold uppercase tracking-wide text-[15px] no-underline text-white ${
                  active ? "opacity-100" : "opacity-90 hover:opacity-100"
                } hover:text-liciba-amber`}
              >
                {n.label}
                {active && <span className="absolute inset-x-3.5 bottom-0 h-1 bg-liciba-orange" />}
              </Link>
            );
          })}
        </nav>

        <div className="ml-2 hidden items-center gap-4 md:flex">
          {desktopAccountLink}
          <Link
            href="/inscripcion"
            className="flex-none items-center bg-liciba-orange px-[18px] py-3 font-display font-extrabold uppercase tracking-wide text-liciba-ink no-underline hover:bg-liciba-amber inline-flex"
          >
            Inscribirme
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menú"
          aria-expanded={open}
          className="ml-auto flex h-11 w-11 flex-none flex-col items-center justify-center gap-1.5 border border-white/25 bg-transparent text-white md:hidden"
        >
          <span className="h-0.5 w-5 bg-white" />
          <span className="h-0.5 w-5 bg-white" />
          <span className="h-0.5 w-3.5 self-center bg-liciba-orange" />
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-0.5 border-t border-white/10 px-5 pb-5 pt-2 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.id}
              href={n.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between border-b border-white/8 py-3.5 font-display text-xl font-bold uppercase text-white no-underline"
            >
              {n.label}
              <span className="text-liciba-orange">→</span>
            </Link>
          ))}
          <Link
            href="/inscripcion"
            onClick={() => setOpen(false)}
            className="mt-3.5 bg-liciba-orange px-4 py-4 text-center font-display font-extrabold uppercase tracking-wide text-liciba-ink no-underline"
          >
            Inscribirme
          </Link>
          <div onClick={() => setOpen(false)}>{mobileAccountLink}</div>
        </nav>
      )}
    </header>
  );
}
