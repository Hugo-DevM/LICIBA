import { buildRaceInfo } from "@/lib/domain/race-info";
import type { CarreraDecorada } from "@/lib/domain/types";

export function InfoTab({ c }: { c: CarreraDecorada }) {
  const { tiles, catsSalida, cuotas } = buildRaceInfo(c);

  return (
    <div className="flex-1 overflow-auto bg-[#FAF9F6] p-5">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <section className="grid gap-px border border-liciba-border bg-liciba-border" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
          {tiles.map((t) => (
            <div key={t.k} className="flex flex-col gap-1 bg-white p-3.5">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">{t.k}</span>
              <span className="font-display text-xl font-bold uppercase leading-tight">{t.v}</span>
              <span className="text-xs leading-snug text-liciba-muted">{t.s}</span>
            </div>
          ))}
        </section>

        <section className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))" }}>
          <div className="flex flex-col gap-2">
            <h2 className="m-0 font-display text-base font-bold uppercase tracking-wide text-liciba-muted">
              Categorías y horarios de salida
            </h2>
            <div className="flex flex-col border border-liciba-border bg-white">
              {catsSalida.map((k) => (
                <div key={k.id} className="flex items-center gap-2.5 border-b border-liciba-border-soft px-3.5 py-2.5 last:border-0">
                  <span className="h-2.5 w-2.5 flex-none" style={{ background: k.color }} />
                  <span className="flex-1 text-sm font-semibold">{k.nombre}</span>
                  <span className="font-mono text-[13px] text-liciba-muted">{k.salida}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="m-0 font-display text-base font-bold uppercase tracking-wide text-liciba-muted">Cuotas</h2>
            <div className="flex flex-col border border-liciba-border bg-white">
              {cuotas.map((q) => (
                <div key={q.k} className="flex items-baseline gap-2.5 border-b border-liciba-border-soft px-3.5 py-2.5 last:border-0">
                  <span className="flex-1 text-sm font-semibold leading-snug">
                    {q.k}
                    <span className="block text-xs font-normal text-liciba-muted">{q.s}</span>
                  </span>
                  <span className="font-mono text-sm font-semibold">{q.v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
