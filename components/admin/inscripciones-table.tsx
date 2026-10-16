"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLeagueData } from "@/lib/domain/league-data-context";
import { Pagination } from "./pagination";

const PAGE_SIZE = 50;

export function InscripcionesTable() {
  const { TEMPORADAS, CARRERAS, cat: getCat, decorar, inscritos } = useLeagueData();
  const [seasonFilter, setSeasonFilter] = useState<number>(TEMPORADAS[0]);
  const races = useMemo(
    () => CARRERAS.filter((c) => c.temporada === seasonFilter).map(decorar).sort((a, b) => a.fecha.localeCompare(b.fecha)),
    [CARRERAS, decorar, seasonFilter],
  );
  const [raceFilter, setRaceFilter] = useState<"all" | string>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const all = useMemo(
    () => races.flatMap((c) => inscritos(c.slug).map((r) => ({ ...r, carrera: c.nombre, slug: c.slug }))),
    [races],
  );

  const ql = q.toLowerCase();
  const rows = all.filter(
    (r) => (raceFilter === "all" || r.slug === raceFilter) && (!ql || (r.nombre + r.club).toLowerCase().includes(ql)),
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageRows = useMemo(() => rows.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE), [rows, pageSafe]);

  const counts: Record<string, number> = {};
  all.forEach((r) => (counts[r.slug] = (counts[r.slug] || 0) + 1));

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-liciba-border-soft bg-[#FAF9F6] px-5 py-2.5">
        <span className="mr-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">Temporada</span>
        {TEMPORADAS.map((year) => (
          <button
            key={year}
            onClick={() => {
              setSeasonFilter(year);
              setRaceFilter("all");
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
          <button
            onClick={() => {
              setRaceFilter("all");
              setPage(1);
            }}
            className="h-[30px] cursor-pointer whitespace-nowrap px-2.5 font-sans text-xs font-semibold"
            style={{
              border: `1px solid ${raceFilter === "all" ? "#13201B" : "#D6D3CA"}`,
              background: raceFilter === "all" ? "#13201B" : "#fff",
              color: raceFilter === "all" ? "#fff" : "#13201B",
            }}
          >
            Todas <span className="opacity-70">{all.length}</span>
          </button>
          {races.map((c) => (
            <button
              key={c.slug}
              onClick={() => {
                setRaceFilter(c.slug);
                setPage(1);
              }}
              className="h-[30px] cursor-pointer whitespace-nowrap px-2.5 font-sans text-xs font-semibold"
              style={{
                border: `1px solid ${raceFilter === c.slug ? "#13201B" : "#D6D3CA"}`,
                background: raceFilter === c.slug ? "#13201B" : "#fff",
                color: raceFilter === c.slug ? "#fff" : "#13201B",
              }}
            >
              {c.nombre} <span className="opacity-70">{counts[c.slug] || 0}</span>
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
        <span className="ml-auto font-mono text-xs text-liciba-muted">{rows.length} inscripciones</span>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full min-w-[760px] border-collapse font-sans text-[13px] font-medium">
          <thead>
            <tr className="sticky top-0 z-[2] bg-liciba-ink text-white">
              <th className="w-16 px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">DORSAL</th>
              <th className="px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">CORREDOR</th>
              <th className="w-44 px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">CARRERA</th>
              <th className="w-32 px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">CATEGORÍA</th>
              <th className="w-28 px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">PAGO</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r, i) => (
              <tr key={`${r.slug}-${r.id}-${i}`} className="border-b border-liciba-border-soft">
                <td className="px-3.5 py-2.5 font-mono text-[13px]">{r.dorsal}</td>
                <td className="whitespace-nowrap px-3.5 py-2.5">{r.nombre}</td>
                <td className="px-3.5 py-2.5 text-liciba-muted">
                  <Link href={`/admin/carreras/${r.slug}`} className="text-liciba-muted no-underline hover:text-liciba-blue">
                    {r.carrera}
                  </Link>
                </td>
                <td className="px-3.5 py-2.5 text-liciba-muted">{getCat(r.cat).nombre}</td>
                <td className="px-3.5 py-2.5">
                  <span
                    className="font-mono text-[11px] font-semibold px-2 py-1"
                    style={{ background: r.pagado ? "#E1F0E6" : "#FFE6C7", color: r.pagado ? "#1E6B43" : "#8A3D00" }}
                  >
                    {r.pagado ? "PAGADO" : "PENDIENTE"}
                  </span>
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
