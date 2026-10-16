"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLeagueData } from "@/lib/domain/league-data-context";
import type { CategoriaId } from "@/lib/domain/types";

const PODIUM = [
  { bg: "#13201B", fg: "#fff", numC: "#FFB21E" },
  { bg: "#fff", fg: "#13201B", numC: "#8A968F" },
  { bg: "#fff", fg: "#13201B", numC: "#C9773E" },
];

export function RankingClient() {
  const { CARRERAS, CATEGORIAS, TEMPORADAS, ranking } = useLeagueData();
  const params = useSearchParams();
  const [year, setYear] = useState(Number(params.get("year")) || 2026);
  const [catId, setCatId] = useState<CategoriaId>((params.get("cat") as CategoriaId) || "elite_varonil");

  const all = useMemo(() => ranking(year, catId), [year, catId]);
  const top3 = all.slice(0, 3).map((r, i) => ({ ...r, ...PODIUM[i] }));
  const rows = all.slice(3).map((r) => ({
    ...r,
    pc: r.pos <= 3 ? "#F2661C" : "#13201B",
    tc: r.trendDir === "up" ? "#1E6B43" : r.trendDir === "down" ? "#B23A0B" : "#8A968F",
    tb: r.trendDir === "up" ? "#E1F0E6" : r.trendDir === "down" ? "#FDE8DC" : "#F0EFEA",
  }));

  const corridas = CARRERAS.filter((c) => c.temporada === year && c.estado === "finalizada").length;
  const fechasTxt = year === 2026 ? `${corridas} de 11 fechas` : "Temporada cerrada";

  return (
    <>
      <section className="bg-liciba-blue text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-[22px] px-5 pt-11">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="mb-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-[#CFE4F2]">
                Clasificación general · {fechasTxt}
              </div>
              <h1 className="m-0 font-sans text-[52px] italic font-extrabold uppercase leading-[0.86] md:text-[96px]">
                Ranking <span className="text-liciba-amber">{year}</span>
              </h1>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-[#CFE4F2]">
                Temporada
              </span>
              <div className="flex border-2 border-white">
                {TEMPORADAS.map((y) => (
                  <button
                    key={y}
                    onClick={() => setYear(y)}
                    className="min-h-[52px] cursor-pointer border-0 px-[22px] font-sans text-[26px] italic font-extrabold"
                    style={{ background: y === year ? "#fff" : "transparent", color: y === year ? "#0A5A8C" : "#fff" }}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="-mx-5 flex gap-0.5 overflow-x-auto px-5">
            {CATEGORIAS.map((c) => (
              <button
                key={c.id}
                onClick={() => setCatId(c.id)}
                className="min-h-12 flex-none cursor-pointer border-0 px-4 font-display text-base font-extrabold uppercase tracking-wide"
                style={{
                  background: c.id === catId ? "#F5F4EF" : "rgba(255,255,255,.1)",
                  color: c.id === catId ? "#13201B" : "#fff",
                  boxShadow: `inset 0 4px 0 ${c.id === catId ? c.color : "transparent"}`,
                }}
              >
                {c.nombre}
              </button>
            ))}
          </div>
        </div>
      </section>

      {all.length === 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-9">
          <div className="flex flex-col items-center gap-2 border-2 border-dashed border-[#D6D3CA] px-5 py-14 text-center">
            <div className="font-sans text-2xl italic font-extrabold uppercase">Sin ranking todavía</div>
            <p className="m-0 text-liciba-muted">Aún no hay resultados registrados para esta temporada y categoría.</p>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 pt-7">
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))" }}>
          {top3.map((r) => (
            <Link
              key={r.id}
              href={`/corredores/${r.id}`}
              className="relative flex items-center gap-3.5 overflow-hidden border border-liciba-border p-4 no-underline transition-transform hover:-translate-y-0.5"
              style={{ background: r.bg, color: r.fg }}
            >
              <span className="font-sans text-7xl italic font-extrabold leading-[0.8]" style={{ color: r.numC }}>
                {r.pos}
              </span>
              <span className="flex h-14 w-14 flex-none items-center justify-center overflow-hidden rounded-full bg-[#DCE3DE] font-sans text-sm font-bold text-liciba-green">
                {r.iniciales}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[22px] font-extrabold uppercase leading-tight">{r.nombre}</span>
                <span className="mt-0.5 block text-[13px] opacity-75">{r.club}</span>
              </span>
              <span className="text-right">
                <span className="block font-mono text-2xl font-semibold">{r.pts}</span>
                <span className="mt-1 block font-mono text-[11px] font-semibold opacity-70">PTS</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-[72px] pt-5">
        <div className="hidden border border-liciba-border bg-white md:block">
          <div
            className="grid gap-3 border-b-2 border-liciba-ink px-[18px] py-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted"
            style={{ gridTemplateColumns: "56px 64px minmax(0,1.6fr) minmax(0,1fr) 90px 90px 90px" }}
          >
            <span>Pos</span>
            <span>Tend.</span>
            <span>Corredor</span>
            <span>Club</span>
            <span className="text-right">Carreras</span>
            <span className="text-right">Puntos</span>
            <span className="text-right">Al líder</span>
          </div>
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/corredores/${r.id}`}
              className="grid items-center gap-3 border-b border-liciba-border-soft px-[18px] py-3 text-liciba-ink no-underline hover:bg-liciba-cream"
              style={{ gridTemplateColumns: "56px 64px minmax(0,1.6fr) minmax(0,1fr) 90px 90px 90px" }}
            >
              <span className="font-sans text-[28px] italic font-extrabold leading-none" style={{ color: r.pc }}>
                {r.pos}
              </span>
              <span className="justify-self-start font-mono text-xs font-semibold px-1.5 py-1" style={{ color: r.tc, background: r.tb }}>
                {r.trendTxt}
              </span>
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#DCE3DE] font-sans text-[13px] font-bold text-liciba-green">
                  {r.iniciales}
                </span>
                <span className="font-sans text-base font-semibold leading-tight">{r.completo}</span>
              </span>
              <span className="text-sm text-liciba-muted">{r.club}</span>
              <span className="text-right font-mono text-sm font-medium text-liciba-muted">{r.carreras}</span>
              <span className="text-right font-mono text-lg font-semibold">{r.pts}</span>
              <span className="text-right font-mono text-[13px] font-medium text-liciba-muted">{r.diff}</span>
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2 md:hidden">
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/corredores/${r.id}`}
              className="grid items-center gap-x-3 gap-y-1 border border-liciba-border bg-white px-3.5 py-3 text-liciba-ink no-underline"
              style={{ gridTemplateColumns: "44px minmax(0,1fr) auto" }}
            >
              <span className="row-span-2 font-sans text-[34px] italic font-extrabold leading-none" style={{ color: r.pc }}>
                {r.pos}
              </span>
              <span className="min-w-0 font-sans text-base font-semibold leading-tight">{r.nombre}</span>
              <span className="text-right font-mono text-lg font-semibold">{r.pts}</span>
              <span className="text-xs text-liciba-muted">
                {r.club} · {r.carreras} carreras
              </span>
              <span className="text-right font-mono text-[11px] font-semibold" style={{ color: r.tc }}>
                {r.trendTxt}
              </span>
            </Link>
          ))}
        </div>

        <p className="m-0 mt-4 text-[13px] leading-relaxed text-liciba-muted">
          Puntos por posición: 50 · 45 · 40 · 36 · 32 · 29 · 26 · 23 · 20 · 18… Elite puntúa doble. Tendencia
          comparada contra la fecha anterior. Empates se definen por mejor resultado en la fecha más reciente.
        </p>
      </section>
    </>
  );
}
