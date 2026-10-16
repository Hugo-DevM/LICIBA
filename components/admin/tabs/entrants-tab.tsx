"use client";

import { useMemo, useState } from "react";
import { useLeagueData } from "@/lib/domain/league-data-context";
import type { CarreraDecorada, CategoriaId } from "@/lib/domain/types";

export function EntrantsTab({ c }: { c: CarreraDecorada }) {
  const { cat: getCat, inscritos } = useLeagueData();
  const base = useMemo(() => inscritos(c.slug), [c.slug, inscritos]);
  const [paidOverride, setPaidOverride] = useState<Record<string, boolean>>({});
  const [catFilter, setCatFilter] = useState<"all" | CategoriaId>("all");
  const [q, setQ] = useState("");

  const all = base.map((r) => ({ ...r, pagado: paidOverride[r.id] ?? r.pagado }));
  const ql = q.toLowerCase();
  const rows = all.filter(
    (r) => (catFilter === "all" || r.cat === catFilter) && (!ql || (r.nombre + r.club).toLowerCase().includes(ql)),
  );

  const counts: Record<string, number> = {};
  all.forEach((r) => (counts[r.cat] = (counts[r.cat] || 0) + 1));
  const catF = [{ id: "all" as const, nombre: "Todas", color: "#13201B", n: all.length }, ...c.cats.map((id) => ({ ...getCat(id), n: counts[id] || 0 }))];

  const togglePaid = (id: string, current: boolean) => setPaidOverride((s) => ({ ...s, [id]: !current }));

  const pagados = all.filter((r) => r.pagado).length;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 border-b border-liciba-border bg-[#FAF9F6] px-5 py-3">
        <div className="flex flex-wrap gap-1">
          {catF.map((k) => (
            <button
              key={k.id}
              onClick={() => setCatFilter(k.id)}
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
          onChange={(e) => setQ(e.target.value)}
          placeholder="Corredor o club…"
          className="h-[30px] w-[200px] border border-[#D6D3CA] bg-white px-2.5 font-sans text-[13px] font-medium"
        />
        <span className="ml-auto font-mono text-xs text-liciba-muted">
          {pagados} / {all.length} pagados
        </span>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full min-w-[640px] border-collapse font-sans text-[13px] font-medium">
          <thead>
            <tr className="sticky top-0 z-[2] bg-liciba-ink text-white">
              <th className="w-16 px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">DORSAL</th>
              <th className="px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">CORREDOR</th>
              <th className="w-32 px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">CATEGORÍA</th>
              <th className="w-32 px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">CLUB</th>
              <th className="w-28 px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">PAGO</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-liciba-border-soft">
                <td className="px-3.5 py-2.5 font-mono text-[13px]">{r.dorsal}</td>
                <td className="whitespace-nowrap px-3.5 py-2.5">{r.nombre}</td>
                <td className="px-3.5 py-2.5 text-liciba-muted">{getCat(r.cat).nombre}</td>
                <td className="px-3.5 py-2.5 text-liciba-muted">{r.club}</td>
                <td className="px-3.5 py-2.5">
                  <button
                    onClick={() => togglePaid(r.id, r.pagado)}
                    className="cursor-pointer whitespace-nowrap border-0 font-mono text-[11px] font-semibold px-2 py-1"
                    style={{ background: r.pagado ? "#E1F0E6" : "#FFE6C7", color: r.pagado ? "#1E6B43" : "#8A3D00" }}
                  >
                    {r.pagado ? "PAGADO" : "PENDIENTE"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
