"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLeagueData } from "@/lib/domain/league-data-context";
import { Pagination } from "./pagination";

const PAGE_SIZE = 20;

export function ResultadosTable() {
  const { TEMPORADAS, CARRERAS, decorar } = useLeagueData();
  const [seasonFilter, setSeasonFilter] = useState<number>(TEMPORADAS[0]);
  const [page, setPage] = useState(1);

  const races = useMemo(
    () =>
      CARRERAS.map(decorar)
        .filter((c) => c.finalizada && c.temporada === seasonFilter)
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [CARRERAS, decorar, seasonFilter],
  );

  const totalPages = Math.max(1, Math.ceil(races.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageRaces = useMemo(() => races.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE), [races, pageSafe]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-liciba-border-soft bg-[#FAF9F6] px-5 py-2.5">
        <span className="mr-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">Temporada</span>
        {TEMPORADAS.map((year) => (
          <button
            key={year}
            onClick={() => {
              setSeasonFilter(year);
              setPage(1);
            }}
            className="h-[30px] cursor-pointer whitespace-nowrap px-2.5 font-sans text-xs font-semibold"
            style={{
              border: `1px solid ${seasonFilter === year ? "#13201B" : "#D6D3CA"}`,
              background: seasonFilter === year ? "#13201B" : "#fff",
              color: seasonFilter === year ? "#fff" : "#13201B",
            }}
          >
            {year}
          </button>
        ))}
        <span className="ml-auto font-mono text-xs text-liciba-muted">{races.length} carreras finalizadas</span>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full min-w-[640px] border-collapse font-sans text-[13px] font-medium">
          <thead>
            <tr className="sticky top-0 z-[2] bg-liciba-ink text-white">
              <th className="w-20 px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">FECHA</th>
              <th className="px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">CARRERA</th>
              <th className="w-28 px-3.5 py-2.5 text-right font-mono text-[11px] font-semibold">CORREDORES</th>
              <th className="w-20 px-3.5 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {pageRaces.map((c) => (
              <tr key={c.slug} className="border-b border-liciba-border-soft hover:bg-[#FAF9F6]">
                <td className="whitespace-nowrap px-3.5 py-3 font-mono text-[13px] text-liciba-muted">
                  {c.dia} {c.mes} {c.temporada}
                </td>
                <td className="px-3.5 py-3">
                  <Link href={`/admin/carreras/${c.slug}`} className="font-sans text-[15px] font-semibold text-liciba-ink no-underline hover:text-liciba-blue">
                    {c.nombre}
                  </Link>
                </td>
                <td className="px-3.5 py-3 text-right font-mono">{c.inscritos}</td>
                <td className="px-3.5 py-3 text-right">
                  <Link href={`/admin/carreras/${c.slug}`} className="font-display text-xs font-bold uppercase tracking-wide text-liciba-ink no-underline">
                    Ver →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={pageSafe} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
