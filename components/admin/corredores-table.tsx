"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLeagueData } from "@/lib/domain/league-data-context";
import type { CategoriaId } from "@/lib/domain/types";
import { Pagination } from "./pagination";

const PAGE_SIZE = 50;

export function CorredoresTable() {
  const { TEMPORADAS, CATEGORIAS, CARRERAS, cat: getCat, inscritos } = useLeagueData();
  const [seasonFilter, setSeasonFilter] = useState<number>(TEMPORADAS[0]);
  const [catFilter, setCatFilter] = useState<"all" | CategoriaId>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const racesInSeason = useMemo(() => CARRERAS.filter((c) => c.temporada === seasonFilter), [CARRERAS, seasonFilter]);

  const roster = useMemo(() => {
    const byId = new Map<string, ReturnType<typeof inscritos>[number]>();
    for (const race of racesInSeason) {
      for (const entry of inscritos(race.slug)) {
        if (!byId.has(entry.id)) byId.set(entry.id, entry);
      }
    }
    return Array.from(byId.values());
  }, [racesInSeason, inscritos]);

  const ql = q.toLowerCase();
  const rows = roster
    .filter((r) => (catFilter === "all" || r.cat === catFilter) && (!ql || (r.completo + r.club).toLowerCase().includes(ql)))
    .sort((a, b) => a.dorsal - b.dorsal);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageRows = useMemo(() => rows.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE), [rows, pageSafe]);

  const counts: Record<string, number> = {};
  roster.forEach((r) => (counts[r.cat] = (counts[r.cat] || 0) + 1));
  const catF = [{ id: "all" as const, nombre: "Todas", color: "#13201B", n: roster.length }, ...CATEGORIAS.map((c) => ({ ...c, n: counts[c.id] || 0 }))];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-liciba-border-soft bg-[#FAF9F6] px-5 py-2.5">
        <span className="mr-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">Temporada</span>
        {TEMPORADAS.map((year) => (
          <button
            key={year}
            onClick={() => {
              setSeasonFilter(year);
              setCatFilter("all");
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
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 border-b border-liciba-border bg-[#FAF9F6] px-5 py-3">
        <div className="flex flex-wrap gap-1">
          {catF.map((k) => (
            <button
              key={k.id}
              onClick={() => {
                setCatFilter(k.id);
                setPage(1);
              }}
              className="flex h-[30px] cursor-pointer items-center gap-1.5 whitespace-nowrap px-2.5 font-sans text-xs font-semibold"
              style={{
                border: `1px solid ${catFilter === k.id ? "#13201B" : "#D6D3CA"}`,
                background: catFilter === k.id ? "#13201B" : "#fff",
                color: catFilter === k.id ? "#fff" : "#13201B",
              }}
            >
              <span className="h-2 w-2" style={{ background: k.color }} />
              {k.nombre} <span className="opacity-70">{k.n}</span>
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Corredor o club…"
          className="h-[30px] w-[200px] border border-[#D6D3CA] bg-white px-2.5 font-sans text-[13px] font-medium"
        />
        <span className="ml-auto font-mono text-xs text-liciba-muted">{rows.length} corredores</span>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full min-w-[700px] border-collapse font-sans text-[13px] font-medium">
          <thead>
            <tr className="sticky top-0 z-[2] bg-liciba-ink text-white">
              <th className="w-16 px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">DORSAL</th>
              <th className="px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">CORREDOR</th>
              <th className="w-36 px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">CATEGORÍA</th>
              <th className="w-40 px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">CLUB</th>
              <th className="w-16 px-3.5 py-2.5 text-right font-mono text-[11px] font-semibold">EDAD</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr key={r.id} className="border-b border-liciba-border-soft hover:bg-[#FAF9F6]">
                <td className="px-3.5 py-2.5 font-mono text-[13px]">{r.dorsal}</td>
                <td className="whitespace-nowrap px-3.5 py-2.5">
                  <Link href={`/corredores/${r.id}`} className="text-liciba-ink no-underline hover:text-liciba-blue">
                    {r.completo}
                  </Link>
                </td>
                <td className="px-3.5 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-xs text-liciba-muted">
                    <span className="h-2 w-2" style={{ background: getCat(r.cat).color }} />
                    {getCat(r.cat).nombre}
                  </span>
                </td>
                <td className="px-3.5 py-2.5 text-liciba-muted">{r.club}</td>
                <td className="px-3.5 py-2.5 text-right font-mono text-liciba-muted">{r.edad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={pageSafe} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
