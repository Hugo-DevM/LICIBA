"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLeagueData } from "@/lib/domain/league-data-context";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { RIDER_IMAGE } from "@/lib/domain/race-images";
import { EvolutionChart } from "./evolution-chart";

export function RiderProfile({ id }: { id: string }) {
  const { cat, corredor, historial, ranking } = useLeagueData();
  const [year, setYear] = useState(2026);

  const r = corredor(id);
  const k = cat(r.cat);

  const hist = useMemo(
    () => historial(id, year).map((h) => ({ ...h, pc: h.podio ? "#F2661C" : "#13201B" })),
    [id, year],
  );
  const totalPts = hist.reduce((s, h) => s + h.pts, 0);
  const rk = useMemo(() => ranking(year, r.cat).find((x) => x.id === id), [year, r.cat, id]);

  const stats = [
    { k: `Ranking ${year}`, v: rk ? `${rk.pos}º` : "—", c: "#FFB21E" },
    { k: "Puntos", v: String(totalPts), c: "#fff" },
    { k: "Carreras", v: String(hist.length), c: "#fff" },
    { k: "Podios", v: String(hist.filter((h) => h.podio).length), c: "#fff" },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-liciba-ink text-white">
        <div
          className="pointer-events-none absolute -right-10 -top-7 font-sans text-[200px] italic font-extrabold leading-none text-white/5 md:text-[320px]"
          aria-hidden
        >
          #{r.dorsal}
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-wrap items-end gap-7 px-5 py-10">
          <div className="relative aspect-[4/5] w-[120px] flex-none bg-[#26352F] shadow-[8px_8px_0_#F2661C] md:w-[184px]">
            <ImagePlaceholder
              label="Foto corredor"
              src={r.foto ?? RIDER_IMAGE}
              sizes="184px"
              dark
              className="absolute inset-0"
            />
          </div>
          <div className="flex min-w-0 flex-1 basis-[300px] flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="font-display text-[13px] font-bold uppercase tracking-wide px-2.5 py-1.5 text-white"
                style={{ background: k.color, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.3)" }}
              >
                {k.nombre}
              </span>
              <span className="font-mono text-xs font-semibold text-liciba-muted-dark">
                Dorsal #{r.dorsal} · {r.edad} años
              </span>
            </div>
            <h1 className="m-0 max-w-[16ch] font-sans text-[48px] italic font-extrabold uppercase leading-[0.86] md:text-[80px]">
              {r.completo}
            </h1>
            <div className="font-sans text-base font-medium text-[#E6EBE8] md:text-[17px]">
              {r.club} · Puerto Vallarta, Jal.
            </div>
          </div>
        </div>
        <div className="relative mx-auto max-w-7xl px-5 pb-7">
          <div className="grid gap-px bg-white/10" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))" }}>
            {stats.map((s) => (
              <div key={s.k} className="bg-[#1C2D26] px-4 py-3.5">
                <div className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted-dark">{s.k}</div>
                <div className="mt-1.5 font-sans text-4xl italic font-extrabold" style={{ color: s.c }}>
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-5 py-9">
        <section className="flex flex-col gap-3.5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-wide text-liciba-green">
                Posición en el ranking {k.nombre} tras cada fecha
              </div>
              <h2 className="m-0 font-sans text-[36px] italic font-extrabold uppercase leading-[0.9] md:text-[52px]">
                Evolución {year}
              </h2>
            </div>
            <div className="flex border-2 border-liciba-ink">
              {[2026, 2025].map((y) => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className="min-h-10 cursor-pointer border-0 px-4 font-display text-[17px] font-extrabold"
                  style={{ background: y === year ? "#13201B" : "#fff", color: y === year ? "#fff" : "#13201B" }}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
          <div className="border border-liciba-border bg-white px-3 pb-2 pt-4">
            <EvolutionChart hist={hist} />
          </div>
        </section>

        <section className="flex flex-col gap-3.5">
          <h2 className="m-0 font-sans text-[36px] italic font-extrabold uppercase leading-[0.9] md:text-[52px]">
            Historial de carreras
          </h2>
          <div className="border border-liciba-border bg-white">
            <div className="hidden grid-cols-[minmax(0,2fr)_100px_60px_100px_70px_50px] gap-3 border-b-2 border-liciba-ink px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted md:grid">
              <span>Carrera</span>
              <span>Tipo</span>
              <span className="text-right">Pos</span>
              <span className="text-right">Tiempo</span>
              <span className="text-right">Dif.</span>
              <span className="text-right">Pts</span>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_40px_78px_34px] gap-3 border-b-2 border-liciba-ink px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted md:hidden">
              <span>Carrera</span>
              <span className="text-right">Pos</span>
              <span className="text-right">Tiempo</span>
              <span />
            </div>

            {hist.map((h) => (
              <Link
                key={h.slug}
                href={`/carreras/${h.slug}`}
                className="grid items-center gap-3 border-b border-liciba-border-soft px-4 py-3 text-liciba-ink no-underline hover:bg-liciba-cream grid-cols-[minmax(0,1fr)_40px_78px_34px] md:grid-cols-[minmax(0,2fr)_100px_60px_100px_70px_50px]"
              >
                <span className="min-w-0">
                  <span className="block font-sans text-[15px] font-semibold leading-tight">{h.carrera}</span>
                  <span className="block font-mono text-xs font-medium text-liciba-muted">{h.fechaTxt}</span>
                </span>
                <span className="hidden text-sm text-liciba-muted md:block">{h.tipo}</span>
                <span className="text-right font-sans text-2xl italic font-extrabold leading-none" style={{ color: h.pc }}>
                  {h.posTxt}
                </span>
                <span className="text-right font-mono text-sm font-medium">{h.tiempo}</span>
                <span className="hidden text-right font-mono text-[13px] font-medium text-liciba-muted md:block">{h.gap}</span>
                <span className="text-right font-mono text-sm font-semibold text-liciba-green">{h.pts}</span>
              </Link>
            ))}

            <div className="grid grid-cols-[minmax(0,1fr)_40px_78px_34px] gap-3 bg-liciba-cream px-4 py-3 font-sans font-bold md:grid-cols-[minmax(0,2fr)_100px_60px_100px_70px_50px]">
              <span>Total temporada</span>
              <span className="hidden md:block" />
              <span />
              <span className="hidden md:block" />
              <span className="hidden md:block" />
              <span className="text-right font-mono text-[15px] font-semibold">{totalPts}</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
