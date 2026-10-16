"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLeagueData } from "@/lib/domain/league-data-context";
import type { CategoriaId } from "@/lib/domain/types";

export function RankingPanel() {
  const { CATEGORIAS, cat, ranking, TEMPORADAS } = useLeagueData();
  const [year, setYear] = useState(2026);
  const [catId, setCatId] = useState<CategoriaId>("elite_varonil");

  const rows = useMemo(() => {
    return ranking(year, catId)
      .slice(0, 6)
      .map((r) => ({
        ...r,
        posColor: r.pos === 1 ? "#F2661C" : "#13201B",
        tc: r.trendDir === "up" ? "#1E6B43" : r.trendDir === "down" ? "#C2410C" : "#8A968F",
      }));
  }, [year, catId]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-[72px]">
      <div className="grid items-start gap-x-12 gap-y-8" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))" }}>
        <div className="flex flex-col gap-[18px]">
          <div className="font-mono text-xs font-semibold uppercase tracking-wide text-liciba-green">
            Clasificación general
          </div>
          <h2 className="m-0 font-sans text-[40px] italic font-extrabold uppercase leading-[0.9] md:text-[68px]">
            Ranking de la liga <span className="text-liciba-orange">{year}</span>
          </h2>
          <p className="m-0 max-w-[420px] text-base leading-relaxed text-liciba-muted">
            Puntos acumulados en todas las fechas de la temporada. Elite puntúa doble y está abierta a
            corredores de cualquier categoría.
          </p>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">
              Temporada
            </span>
            <div className="flex self-start border-2 border-liciba-ink">
              {TEMPORADAS.map((y) => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className="min-h-11 cursor-pointer border-0 px-[18px] font-display text-lg font-extrabold"
                  style={{ background: y === year ? "#13201B" : "#fff", color: y === year ? "#fff" : "#13201B" }}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">
              Categoría
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIAS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCatId(c.id)}
                  className="min-h-10 cursor-pointer px-3 font-display text-sm font-bold uppercase tracking-wide"
                  style={{
                    border: `1px solid ${c.id === catId ? "#13201B" : "#D6D3CA"}`,
                    background: c.id === catId ? "#13201B" : "#fff",
                    color: c.id === catId ? "#fff" : "#13201B",
                  }}
                >
                  {c.nombre}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-liciba-border bg-white">
          <div
            className="grid gap-2.5 border-b-2 border-liciba-ink px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted"
            style={{ gridTemplateColumns: "44px minmax(0,1fr) 64px 56px" }}
          >
            <span>Pos</span>
            <span>Corredor</span>
            <span className="text-right">Pts</span>
            <span className="text-right">Tend.</span>
          </div>
          {rows.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-liciba-muted">Aún no hay ranking para esta temporada.</div>
          )}
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/corredores/${r.id}`}
              className="grid items-center gap-2.5 border-b border-liciba-border-soft px-4 py-3 text-liciba-ink no-underline hover:bg-liciba-cream"
              style={{ gridTemplateColumns: "44px minmax(0,1fr) 64px 56px" }}
            >
              <span className="font-sans text-[28px] italic font-extrabold leading-none" style={{ color: r.posColor }}>
                {r.pos}
              </span>
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#DCE3DE] font-sans text-[13px] font-bold text-liciba-green">
                  {r.iniciales}
                </span>
                <span className="min-w-0">
                  <span className="block overflow-hidden text-ellipsis whitespace-nowrap font-sans text-[15px] font-semibold leading-tight">
                    {r.nombre}
                  </span>
                  <span className="block text-xs text-liciba-muted">
                    {r.club} · {r.carreras} carreras
                  </span>
                </span>
              </span>
              <span className="text-right font-mono text-base font-semibold">{r.pts}</span>
              <span className="text-right font-mono text-xs font-semibold" style={{ color: r.tc }}>
                {r.trendTxt}
              </span>
            </Link>
          ))}
          <Link
            href="/ranking"
            className="flex min-h-[52px] items-center justify-center font-display text-[15px] font-extrabold uppercase tracking-wide text-liciba-ink no-underline hover:bg-liciba-ink hover:text-white"
          >
            Ranking completo {cat(catId).nombre} →
          </Link>
        </div>
      </div>
    </section>
  );
}
