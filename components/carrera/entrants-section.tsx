"use client";

import { useMemo, useState } from "react";
import { useLeagueData } from "@/lib/domain/league-data-context";
import type { CarreraDecorada } from "@/lib/domain/types";

export function EntrantsSection({ c }: { c: CarreraDecorada }) {
  const { inscritos } = useLeagueData();
  const [catId, setCatId] = useState(c.cats[0]);
  const [q, setQ] = useState("");

  const inscAll = useMemo(() => inscritos(c.slug), [c.slug]);

  const ql = q.toLowerCase();
  const ins = inscAll
    .filter((x) => x.cat === catId && (!ql || (x.nombre + x.club).toLowerCase().includes(ql)))
    .map((x) => ({
      ...x,
      et: x.pagado ? "PAGADO" : "PENDIENTE",
      eb: x.pagado ? "#E1F0E6" : "#FFE6C7",
      ef: x.pagado ? "#1E6B43" : "#8A3D00",
    }));

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-wide text-liciba-green">
            {inscAll.length} confirmados · dorsales se asignan el jueves previo
          </div>
          <h2 className="m-0 font-sans text-[40px] italic font-extrabold uppercase leading-[0.9] md:text-[56px]">
            Inscritos
          </h2>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar corredor o club"
          className="min-h-11 w-[260px] max-w-full border-2 border-liciba-ink bg-white px-3.5 font-sans text-[15px] font-medium outline-none"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {c.catsB.map((k) => (
          <button
            key={k.id}
            onClick={() => setCatId(k.id)}
            className="min-h-10 flex-none cursor-pointer px-3 font-display text-sm font-bold uppercase tracking-wide"
            style={{
              border: `1px solid ${k.id === catId ? "#13201B" : "#D6D3CA"}`,
              background: k.id === catId ? "#13201B" : "#fff",
              color: k.id === catId ? "#fff" : "#13201B",
            }}
          >
            {k.nombre} <span className="opacity-60">{inscAll.filter((x) => x.cat === k.id).length}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-px bg-liciba-border border border-liciba-border" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))" }}>
        {ins.map((r) => (
          <div key={r.id} className="flex items-center gap-3 bg-white px-3.5 py-3">
            <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-[#DCE3DE] font-sans text-[13px] font-bold text-liciba-green">
              {r.iniciales}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-sans text-[15px] font-semibold leading-tight">{r.nombre}</span>
              <span className="block text-xs text-liciba-muted">{r.club}</span>
            </span>
            <span className="font-mono text-[11px] font-semibold px-1.5 py-1" style={{ background: r.eb, color: r.ef }}>
              {r.et}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
