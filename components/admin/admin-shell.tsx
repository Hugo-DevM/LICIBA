"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { useLeagueData } from "@/lib/domain/league-data-context";
import { signOut } from "@/lib/domain/auth-actions";

const MOBILE_OPTIONS = [
  { label: "Carreras · Captura", href: "/admin/carreras" },
  { label: "Eventos", href: "/admin/eventos" },
  { label: "Temporadas", href: "/admin/temporadas" },
  { label: "Categorías", href: "/admin/categorias" },
  { label: "Corredores", href: "/admin/corredores" },
  { label: "Inscripciones", href: "/admin/inscripciones" },
  { label: "Resultados", href: "/admin/resultados" },
  { label: "Ranking", href: "/admin/ranking" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { CARRERAS, CATEGORIAS, CORREDORES, TEMPORADAS, inscritos } = useLeagueData();
  const pathname = usePathname();
  const router = useRouter();

  const NAV = [
    { label: "Temporadas", href: "/admin/temporadas", count: () => TEMPORADAS.length },
    { label: "Carreras", href: "/admin/carreras", count: () => CARRERAS.length },
    { label: "Eventos", href: "/admin/eventos", count: () => null },
    { label: "Categorías", href: "/admin/categorias", count: () => CATEGORIAS.length },
    { label: "Corredores", href: "/admin/corredores", count: () => CORREDORES.length },
    {
      label: "Inscripciones",
      href: "/admin/inscripciones",
      count: () => CARRERAS.reduce((s, c) => s + inscritos(c.slug).length, 0),
    },
    {
      label: "Resultados",
      href: "/admin/resultados",
      count: () => CARRERAS.filter((c) => c.estado === "finalizada").length,
    },
    { label: "Ranking", href: "/admin/ranking", count: () => null },
  ];

  return (
    <div className="flex min-h-screen font-sans text-liciba-ink">
      <nav className="sticky top-0 hidden h-screen w-56 flex-none flex-col bg-liciba-ink text-[#C9D1CC] lg:flex">
        <div className="flex h-1">
          <div className="flex-[3] bg-liciba-green" />
          <div className="flex-[2] bg-liciba-blue" />
          <div className="flex-1 bg-liciba-orange" />
        </div>
        <div className="flex items-center gap-2.5 border-b border-white/[0.08] p-4">
          <Logo tone="dark" height={40} />
          <span className="border-l border-white/20 pl-2.5 font-display text-[13px] font-bold uppercase tracking-wide text-white">
            Panel staff
          </span>
        </div>
        <div className="flex flex-col gap-px px-2 pb-1.5 pt-3">
          {NAV.map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href + "/");
            const count = n.count();
            return (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center justify-between px-2.5 py-2 font-sans text-sm font-semibold no-underline"
                style={{
                  color: active ? "#fff" : "#C9D1CC",
                  background: active ? "#26352F" : "transparent",
                  boxShadow: `inset 3px 0 0 ${active ? "#F2661C" : "transparent"}`,
                }}
              >
                {n.label}
                {count !== null && <span className="font-mono text-[11px] text-liciba-muted-dark">{count}</span>}
              </Link>
            );
          })}
        </div>
        <div className="mt-auto flex items-center gap-2.5 border-t border-white/[0.08] p-4 text-[13px]">
          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#26352F] font-sans text-xs font-bold text-liciba-amber">
            CA
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block font-semibold text-white">Claudia Arce</span>
            <span className="text-[12px]">Jueza de meta</span>
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="cursor-pointer border-0 bg-transparent p-0 font-sans text-xs font-semibold text-liciba-muted-dark hover:text-white"
            >
              Salir
            </button>
          </form>
        </div>
      </nav>

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2.5 bg-liciba-ink px-3.5 py-2.5 text-white lg:hidden">
          <Logo variant="mark" tone="dark" height={36} />
          <select
            value={MOBILE_OPTIONS.find((o) => pathname === o.href || pathname.startsWith(o.href + "/"))?.href ?? MOBILE_OPTIONS[0].href}
            onChange={(e) => router.push(e.target.value)}
            className="h-9 flex-1 bg-[#26352F] px-2 font-sans text-[13px] font-semibold text-white"
          >
            {MOBILE_OPTIONS.map((o) => (
              <option key={o.href} value={o.href}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {children}
      </main>
    </div>
  );
}
