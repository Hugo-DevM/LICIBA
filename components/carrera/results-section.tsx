"use client";

import Link from "next/link";
import { useState } from "react";
import { useLeagueData } from "@/lib/domain/league-data-context";
import type { CarreraDecorada } from "@/lib/domain/types";

export function ResultsSection({ c }: { c: CarreraDecorada }) {
  const { cat, resultados } = useLeagueData();
  const [catId, setCatId] = useState(c.cats[0]);

  const res = resultados(c.slug, catId).map((r, i) => ({
    ...r,
    pc: i < 3 ? "#F2661C" : "#13201B",
    bg: i < 3 ? "#FFF8EE" : "#fff",
  }));

  const descargar = () => {
    const rows: (string | number)[][] = [["Categoria", "Pos", "Dorsal", "Corredor", "Club", "Tiempo", "Diferencia", "Puntos"]];
    c.cats.forEach((k) => resultados(c.slug, k).forEach((r) => rows.push([cat(k).nombre, r.pos, r.dorsal, r.completo, r.club, r.tiempo, r.gap, r.pts])));
    const blob = new Blob(["﻿" + rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `resultados-${c.slug}.csv`;
    a.click();
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-wide text-liciba-green">
            Oficiales · cronometraje por chip
          </div>
          <h2 className="m-0 font-sans text-[40px] italic font-extrabold uppercase leading-[0.9] md:text-[56px]">
            Resultados
          </h2>
        </div>
        <button
          onClick={descargar}
          className="min-h-11 cursor-pointer border-2 border-liciba-ink bg-white px-4 font-display text-[15px] font-extrabold uppercase tracking-wide hover:bg-liciba-ink hover:text-white"
        >
          ↓ Descargar tiempos (CSV)
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {c.catsB.map((k) => (
          <button
            key={k.id}
            onClick={() => setCatId(k.id)}
            className="min-h-10 flex-none cursor-pointer px-3 font-display text-sm font-bold uppercase tracking-wide"
            style={{
              border: `1px solid ${k.id === catId ? "#13201B" : "#D6D3CA"}`,
              background: k.id === catId ? "#13201B" : "#fff",
              color: k.id === catId ? "#fff" : "#13201B",
            }}
          >
            {k.nombre}
          </button>
        ))}
      </div>

      <div className="border border-liciba-border bg-white">
        <div className="hidden grid-cols-[44px_64px_minmax(0,1.4fr)_minmax(0,1fr)_92px_64px_44px] gap-2.5 border-b-2 border-liciba-ink px-3.5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted md:grid">
          <span>Pos</span>
          <span>Dorsal</span>
          <span>Corredor</span>
          <span>Club</span>
          <span className="text-right">Tiempo</span>
          <span className="text-right">Dif.</span>
          <span className="text-right">Pts</span>
        </div>
        <div className="grid grid-cols-[34px_minmax(0,1fr)_auto_36px] gap-2.5 border-b-2 border-liciba-ink px-3.5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted md:hidden">
          <span>Pos</span>
          <span>Corredor</span>
          <span className="text-right">Tiempo</span>
          <span />
        </div>

        {res.map((r) => (
          <Link
            key={r.id}
            href={`/corredores/${r.id}`}
            className="grid grid-cols-[34px_minmax(0,1fr)_auto_36px] items-center gap-2.5 border-b border-liciba-border-soft px-3.5 py-2.5 text-liciba-ink no-underline hover:bg-liciba-cream md:grid-cols-[44px_64px_minmax(0,1.4fr)_minmax(0,1fr)_92px_64px_44px]"
            style={{ background: r.bg }}
          >
            <span className="font-sans text-2xl italic font-extrabold leading-none" style={{ color: r.pc }}>
              {r.pos}
            </span>
            <span className="hidden font-mono text-[13px] font-semibold text-liciba-muted md:block">#{r.dorsal}</span>
            <span className="min-w-0 font-sans text-[15px] font-semibold leading-tight">
              {r.nombre}
              <span className="block font-sans text-xs font-normal text-liciba-muted md:hidden">
                #{r.dorsal} · {r.club}
              </span>
            </span>
            <span className="hidden text-sm text-liciba-muted md:block">{r.club}</span>
            <span className="text-right font-mono text-sm font-medium leading-tight">
              {r.tiempo}
              <span className="block text-[11px] text-liciba-muted md:hidden">{r.gap}</span>
            </span>
            <span className="hidden text-right font-mono text-[13px] font-medium text-liciba-muted md:block">{r.gap}</span>
            <span className="text-right font-mono text-sm font-semibold text-liciba-green">{r.pts}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
