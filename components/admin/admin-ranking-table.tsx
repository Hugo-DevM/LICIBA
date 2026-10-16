"use client";

import { useState } from "react";
import Link from "next/link";
import { useLeagueData } from "@/lib/domain/league-data-context";
import type { CategoriaId } from "@/lib/domain/types";

export function AdminRankingTable() {
  const { CATEGORIAS, TEMPORADAS, ranking } = useLeagueData();
  const [year, setYear] = useState(2026);
  const [catId, setCatId] = useState<CategoriaId>("elite_varonil");

  const rows = ranking(year, catId);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 border-b border-liciba-border bg-[#FAF9F6] px-5 py-3">
        <div className="flex border border-liciba-ink">
          {TEMPORADAS.map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className="h-[30px] cursor-pointer whitespace-nowrap border-0 px-3 font-sans text-xs font-semibold"
              style={{ background: y === year ? "#13201B" : "#fff", color: y === year ? "#fff" : "#13201B" }}
            >
              {y}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {CATEGORIAS.map((k) => (
            <button
              key={k.id}
              onClick={() => setCatId(k.id)}
              className="flex h-[30px] cursor-pointer items-center gap-1.5 whitespace-nowrap px-2.5 font-sans text-xs font-semibold"
              style={{
                border: `1px solid ${catId === k.id ? "#13201B" : "#D6D3CA"}`,
                background: catId === k.id ? "#13201B" : "#fff",
                color: catId === k.id ? "#fff" : "#13201B",
              }}
            >
              <span className="h-2 w-2" style={{ background: k.color }} />
              {k.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full min-w-[640px] border-collapse font-sans text-[13px] font-medium">
          <thead>
            <tr className="sticky top-0 z-[2] bg-liciba-ink text-white">
              <th className="w-12 px-3.5 py-2.5 text-right font-mono text-[11px] font-semibold">POS</th>
              <th className="px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">CORREDOR</th>
              <th className="w-40 px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">CLUB</th>
              <th className="w-20 px-3.5 py-2.5 text-right font-mono text-[11px] font-semibold">CARRERAS</th>
              <th className="w-20 px-3.5 py-2.5 text-right font-mono text-[11px] font-semibold">PUNTOS</th>
              <th className="w-20 px-3.5 py-2.5 text-right font-mono text-[11px] font-semibold">TEND.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-liciba-border-soft hover:bg-[#FAF9F6]">
                <td className="px-3.5 py-2.5 text-right font-display text-base font-bold" style={{ color: r.pos <= 3 ? "#F2661C" : "#13201B" }}>
                  {r.pos}
                </td>
                <td className="whitespace-nowrap px-3.5 py-2.5">
                  <Link href={`/corredores/${r.id}`} className="text-liciba-ink no-underline hover:text-liciba-blue">
                    {r.completo}
                  </Link>
                </td>
                <td className="px-3.5 py-2.5 text-liciba-muted">{r.club}</td>
                <td className="px-3.5 py-2.5 text-right font-mono text-liciba-muted">{r.carreras}</td>
                <td className="px-3.5 py-2.5 text-right font-mono font-semibold">{r.pts}</td>
                <td
                  className="px-3.5 py-2.5 text-right font-mono text-xs"
                  style={{ color: r.trendDir === "up" ? "#1E6B43" : r.trendDir === "down" ? "#B23A0B" : "#8A968F" }}
                >
                  {r.trendTxt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
