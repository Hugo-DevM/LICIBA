"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLeagueData } from "@/lib/domain/league-data-context";
import { Pagination } from "./pagination";

const PAGE_SIZE = 20;

export function CarrerasTable() {
  const { CARRERAS, decorar } = useLeagueData();
  const races = useMemo(() => CARRERAS.map(decorar).sort((a, b) => a.fecha.localeCompare(b.fecha)), [CARRERAS, decorar]);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(races.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageRaces = useMemo(() => races.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE), [races, pageSafe]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full min-w-[760px] border-collapse font-sans text-[13px] font-medium">
          <thead>
            <tr className="sticky top-0 z-[2] bg-liciba-ink text-white">
              <th className="w-20 px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">FECHA</th>
              <th className="px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">CARRERA</th>
              <th className="w-28 px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">DISCIPLINA</th>
              <th className="w-32 px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">ESTADO</th>
              <th className="w-32 px-3.5 py-2.5 text-right font-mono text-[11px] font-semibold">INSCRITOS</th>
              <th className="w-10 px-3.5 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {pageRaces.map((c) => (
              <tr key={c.slug} className="border-b border-liciba-border-soft hover:bg-[#FAF9F6]">
                <td className="whitespace-nowrap px-3.5 py-3 font-mono text-[13px] text-liciba-muted">
                  {c.dia} {c.mes}
                </td>
                <td className="px-3.5 py-3">
                  <Link href={`/admin/carreras/${c.slug}`} className="font-sans text-[15px] font-semibold text-liciba-ink no-underline hover:text-liciba-blue">
                    {c.nombre}
                  </Link>
                  <div className="text-xs text-liciba-muted">{c.sede}</div>
                </td>
                <td className="px-3.5 py-3 text-liciba-muted">
                  {c.disciplina} · {c.tipoTxt}
                </td>
                <td className="px-3.5 py-3">
                  <span
                    className="font-display text-xs font-bold uppercase tracking-wide px-1.5 py-1"
                    style={{ background: c.badge.bg, color: c.badge.fg }}
                  >
                    {c.badge.corto}
                  </span>
                </td>
                <td className="px-3.5 py-3 text-right font-mono text-[13px]">{c.cupoTxt}</td>
                <td className="px-3.5 py-3 text-right">
                  <Link href={`/admin/carreras/${c.slug}`} className="font-display text-xs font-bold uppercase tracking-wide text-liciba-ink no-underline">
                    →
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
