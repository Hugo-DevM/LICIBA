"use client";

import { useEffect, useState } from "react";

function unidades(targetIso: string, now: number) {
  const s = Math.max(0, Math.floor((new Date(targetIso).getTime() - now) / 1000));
  const p2 = (n: number) => String(n).padStart(2, "0");
  return [
    { v: p2(Math.floor(s / 86400)), l: "DÍAS" },
    { v: p2(Math.floor((s % 86400) / 3600)), l: "HRS" },
    { v: p2(Math.floor((s % 3600) / 60)), l: "MIN" },
    { v: p2(s % 60), l: "SEG" },
  ];
}

export function Countdown({ targetIso }: { targetIso: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const u =
    now === null
      ? [
          { v: "--", l: "DÍAS" },
          { v: "--", l: "HRS" },
          { v: "--", l: "MIN" },
          { v: "--", l: "SEG" },
        ]
      : unidades(targetIso, now);

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {u.map((x) => (
        <div key={x.l} className="bg-liciba-ink px-1 py-2 text-center text-white">
          <div className="font-mono text-[26px] font-semibold leading-none">{x.v}</div>
          <div className="mt-1 font-display text-[11px] font-bold uppercase tracking-wide text-liciba-amber">
            {x.l}
          </div>
        </div>
      ))}
    </div>
  );
}
