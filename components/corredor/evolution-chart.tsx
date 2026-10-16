import type { HistorialFila } from "@/lib/domain/types";

export function EvolutionChart({ hist }: { hist: HistorialFila[] }) {
  const maxR = Math.max(6, ...hist.map((h) => h.rk));
  const n = hist.length;
  const VW = 640;
  const X = (i: number) => (n < 2 ? VW / 2 : 56 + i * ((VW - 84) / (n - 1)));
  const Y = (v: number) => 24 + (v - 1) * (176 / (maxR - 1));

  const grid = [1, 3, 5, maxR]
    .filter((v, i, a) => a.indexOf(v) === i && v <= maxR)
    .map((v) => ({ y: Y(v), ty: Y(v) + 4, l: v + "º" }));

  const dots = hist.map((h) => ({
    x: X(hist.indexOf(h)),
    y: Y(h.rk),
    ty: Y(h.rk) + 5,
    rk: h.rk,
    fill: h.rk === 1 ? "#F2661C" : "#13201B",
    tc: h.rk === 1 ? "#13201B" : "#fff",
    lbl: h.fechaTxt.split(" ").slice(1, 2).join(" ").toUpperCase(),
  }));

  if (n === 0) {
    return <div className="p-6 text-sm text-liciba-muted">Sin carreras registradas en esta temporada.</div>;
  }

  return (
    <svg viewBox={`0 0 ${VW} 244`} className="block h-auto w-full overflow-visible">
      {grid.map((g, i) => (
        <g key={i}>
          <line x1={44} x2={VW - 16} y1={g.y} y2={g.y} stroke="#ECEAE3" />
          <text x={30} y={g.ty} textAnchor="end" fontFamily="IBM Plex Mono, monospace" fontSize={11} fill="#8A968F">
            {g.l}
          </text>
        </g>
      ))}
      <polyline
        points={dots.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke="#1E6B43"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {dots.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={15} fill={p.fill} />
          <text x={p.x} y={p.ty} textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight={800} fontSize={16} fill={p.tc}>
            {p.rk}º
          </text>
          <text x={p.x} y={238} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize={11} fill="#56625C">
            {p.lbl}
          </text>
        </g>
      ))}
    </svg>
  );
}
