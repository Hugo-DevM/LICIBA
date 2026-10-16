"use client";

import { useState } from "react";
import { useLeagueData } from "@/lib/domain/league-data-context";
import type { CarreraDecorada, CategoriaId } from "@/lib/domain/types";
import { PTS, computePositions, type ComputedRow, type Edit } from "../capture-utils";

interface CaptureTabProps {
  c: CarreraDecorada;
  all: ComputedRow[];
  onEdit: (dorsal: number, key: keyof Edit, value: string) => void;
}

export function CaptureTab({ c, all, onEdit }: CaptureTabProps) {
  const { cat: getCat, fmtTiempo } = useLeagueData();
  const [catFilter, setCatFilter] = useState<"all" | CategoriaId>("all");
  const [q, setQ] = useState("");

  const posMap = computePositions(all);
  const ql = q.toLowerCase();
  const vis = all.filter(
    (r) => (catFilter === "all" || r.cat === catFilter) && (!ql || String(r.dorsal).includes(ql) || r.completo.toLowerCase().includes(ql)),
  );

  const rows = vis.map((r, i) => {
    const pos = posMap[r.dorsal];
    const k = getCat(r.cat);
    const empty = r.estado === "OK" && !r.ll;
    return {
      ...r,
      i: i + 1,
      color: k.color,
      catN: k.nombre,
      salida: fmtTiempo(r.sal),
      tiempo: pos ? fmtTiempo((r.secs ?? 0) - r.sal) : r.estado !== "OK" ? r.estado : "—",
      posTxt: pos ? `${pos}º` : "—",
      posC: pos && pos <= 3 ? "#F2661C" : "#13201B",
      pts: pos ? (PTS[pos - 1] || 8) * (r.cat === "elite_varonil" || r.cat === "elite_femenil" ? 2 : 1) : "",
      bg: r.bad && !empty ? "#FDE8DC" : empty ? "#FFF8EE" : r.estado !== "OK" ? "#F5F4EF" : "#fff",
      inBg: r.bad && !empty ? "#FBD5C0" : empty ? "#FFEFD6" : "transparent",
      esFg: r.estado === "OK" ? "#1E6B43" : "#B23A0B",
    };
  });

  const done = all.filter((r) => !r.bad).length;
  const pend = all.filter((r) => r.bad && !r.ll).length;
  const err = all.filter((r) => r.bad && r.ll).length;
  const counts: Record<string, number> = {};
  all.forEach((r) => (counts[r.cat] = (counts[r.cat] || 0) + 1));
  const catF = [{ id: "all" as const, nombre: "Todas", color: "#13201B" }, ...c.cats.map(getCat)].map((k) => ({
    ...k,
    n: k.id === "all" ? all.length : counts[k.id],
  }));

  const handleKey = (rowIndex: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const target = rowIndex + (e.key === "ArrowUp" ? -1 : 1);
      const el = document.querySelector<HTMLInputElement>(`input[data-row="${target}"]`);
      el?.focus();
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {all.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-10 text-center text-sm text-liciba-muted">
          Sin inscritos todavía para esta carrera.
        </div>
      ) : (
        <>
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
              placeholder="Dorsal o nombre…"
              className="h-[30px] w-[180px] border border-[#D6D3CA] bg-white px-2.5 font-sans text-[13px] font-medium"
            />
            <div className="ml-auto flex items-center gap-2.5 font-mono text-xs text-liciba-muted">
              <div className="h-1.5 w-[120px] bg-liciba-border">
                <div className="h-full bg-liciba-green" style={{ width: `${Math.round((done / all.length) * 100)}%` }} />
              </div>
              <span>
                {done} / {all.length} capturados
              </span>
              <span className="text-[#B23A0B]">{[pend ? `${pend} sin tiempo` : "", err ? `${err} con error` : ""].filter(Boolean).join(" · ")}</span>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-white">
            <table className="w-full min-w-[960px] border-collapse font-sans text-[13px] font-medium">
              <thead>
                <tr className="sticky top-0 z-[2] bg-liciba-ink text-white">
                  <th className="w-11 px-2.5 py-2 text-right font-mono text-[11px] font-semibold text-liciba-muted-dark">#</th>
                  <th className="w-[70px] px-2.5 py-2 text-left font-mono text-[11px] font-semibold">DORSAL</th>
                  <th className="px-2.5 py-2 text-left font-mono text-[11px] font-semibold">CORREDOR</th>
                  <th className="w-[120px] px-2.5 py-2 text-left font-mono text-[11px] font-semibold">CATEGORÍA</th>
                  <th className="w-24 px-2.5 py-2 text-left font-mono text-[11px] font-semibold">SALIDA</th>
                  <th className="w-[120px] px-2.5 py-2 text-left font-mono text-[11px] font-semibold text-liciba-amber">LLEGADA ✎</th>
                  <th className="w-24 px-2.5 py-2 text-right font-mono text-[11px] font-semibold">TIEMPO</th>
                  <th className="w-24 px-2.5 py-2 text-left font-mono text-[11px] font-semibold text-liciba-amber">ESTADO ✎</th>
                  <th className="w-[70px] px-2.5 py-2 text-right font-mono text-[11px] font-semibold">POS CAT</th>
                  <th className="w-14 px-2.5 py-2 text-right font-mono text-[11px] font-semibold">PTS</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.dorsal} className="border-b border-liciba-border-soft" style={{ background: r.bg }}>
                    <td className="px-2.5 text-right font-mono text-[11px] text-liciba-muted-dark">{r.i}</td>
                    <td className="px-2.5 font-mono text-[13px] font-semibold">{r.dorsal}</td>
                    <td className="whitespace-nowrap px-2.5">{r.completo}</td>
                    <td className="px-2.5">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span className="h-2 w-2" style={{ background: r.color }} />
                        {r.catN}
                      </span>
                    </td>
                    <td className="px-2.5 font-mono text-[13px] text-liciba-muted">{r.salida}</td>
                    <td className="border-x border-liciba-border-soft p-0">
                      <input
                        value={r.ll}
                        onChange={(e) => onEdit(r.dorsal, "ll", e.target.value)}
                        onKeyDown={handleKey(r.i)}
                        data-row={r.i}
                        placeholder="h:mm:ss"
                        className="h-[34px] w-full border-0 px-2.5 font-mono text-[13px] font-semibold text-liciba-ink"
                        style={{ background: r.inBg }}
                      />
                    </td>
                    <td className="px-2.5 text-right font-mono text-[13px] font-semibold">{r.tiempo}</td>
                    <td className="border-x border-liciba-border-soft p-0">
                      <select
                        value={r.estado}
                        onChange={(e) => onEdit(r.dorsal, "estado", e.target.value)}
                        className="h-[34px] w-full border-0 bg-transparent px-2 font-mono text-xs font-semibold"
                        style={{ color: r.esFg }}
                      >
                        <option>OK</option>
                        <option>DNF</option>
                        <option>DNS</option>
                        <option>DSQ</option>
                      </select>
                    </td>
                    <td className="px-2.5 text-right font-display text-base font-bold" style={{ color: r.posC }}>
                      {r.posTxt}
                    </td>
                    <td className="px-2.5 text-right font-mono text-[13px] font-semibold text-liciba-green">{r.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-x-[18px] gap-y-1.5 border-t border-liciba-border bg-[#FAF9F6] px-5 py-2 font-mono text-[11px] text-liciba-muted">
            <span>Enter ↵ → siguiente fila</span>
            <span>Formato h:mm:ss o hmmss</span>
            <span>Tiempo = llegada − salida de manga</span>
          </div>
        </>
      )}
    </div>
  );
}
