"use client";

import { useState } from "react";
import type { RiderDorsal } from "@/lib/domain/profile";

export function DorsalToggle({ dorsales }: { dorsales: RiderDorsal[] }) {
  const [tab, setTab] = useState(0);
  if (dorsales.length === 0) return null;
  const activo = dorsales[tab];

  return (
    <div className="flex flex-col items-start gap-1.5 border border-liciba-border-soft bg-[#FAF9F6] px-3.5 py-2.5">
      <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">
        {dorsales.length > 1 ? "Tus dorsales" : "Tu dorsal"}
      </span>
      {dorsales.length > 1 && (
        <div className="flex border border-liciba-ink">
          {dorsales.map((d, i) => (
            <button
              key={d.dorsal}
              onClick={() => setTab(i)}
              className="min-h-7 cursor-pointer whitespace-nowrap border-0 px-2.5 font-display text-[11px] font-bold uppercase tracking-wide"
              style={{ background: tab === i ? "#13201B" : "#fff", color: tab === i ? "#fff" : "#13201B" }}
            >
              {d.categoria}
            </button>
          ))}
        </div>
      )}
      <span className="font-sans text-2xl italic font-extrabold text-liciba-ink">{activo.dorsal}</span>
      <span className="text-xs text-liciba-muted">{activo.categoria}</span>
    </div>
  );
}
