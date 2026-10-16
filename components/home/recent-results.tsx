import Link from "next/link";
import type { CarreraDecorada, Categoria, ResultadoFila } from "@/lib/domain/types";

const MEDAL = ["#FFB21E", "#D5DCD8", "#E0915A"];

export interface Podio {
  cat: Categoria;
  top: (ResultadoFila & { medal: string })[];
}

export function RecentResults({ ult, podios }: { ult: CarreraDecorada; podios: Podio[] }) {
  return (
    <section className="mt-10 bg-liciba-ink text-white">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-liciba-amber">
              Resultados recientes · {ult.fechaTxt}
            </div>
            <h2 className="m-0 font-sans text-[40px] italic font-extrabold uppercase leading-[0.9] md:text-[68px]">
              {ult.nombre}
            </h2>
            <div className="mt-2.5 text-[15px] text-liciba-muted-dark">
              {ult.sede} · {ult.detalle} · {ult.inscritos} corredores
            </div>
          </div>
          <Link
            href={ult.href}
            className="inline-flex min-h-12 items-center border-2 border-white px-5 font-display text-base font-extrabold uppercase tracking-wide text-white no-underline hover:bg-white hover:text-liciba-ink"
          >
            Resultados completos →
          </Link>
        </div>

        <div
          className="grid snap-x snap-mandatory gap-3 overflow-x-auto pb-2"
          style={{ gridAutoFlow: "column", gridAutoColumns: "84%" }}
        >
          {podios.map((p) => (
            <div key={p.cat.id} className="flex flex-col gap-2.5 bg-[#1C2D26] p-4 snap-start">
              <div className="flex items-center justify-between">
                <span
                  className="font-display text-xs font-bold tracking-wide text-white px-1.5 py-1"
                  style={{ background: p.cat.color, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.25)" }}
                >
                  {p.cat.nombre}
                </span>
                <span className="font-mono text-[11px] font-medium text-liciba-muted-dark">TOP 3</span>
              </div>
              {p.top.map((t) => (
                <Link
                  key={t.id}
                  href={`/corredores/${t.id}`}
                  className="grid items-center gap-2.5 py-1.5 text-white no-underline border-t border-white/[0.07] hover:text-liciba-amber"
                  style={{ gridTemplateColumns: "28px minmax(0,1fr) auto" }}
                >
                  <span className="font-sans text-[28px] italic font-extrabold leading-none" style={{ color: t.medal }}>
                    {t.pos}
                  </span>
                  <span className="min-w-0">
                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap font-sans text-[15px] font-semibold leading-tight">
                      {t.nombre}
                    </span>
                    <span className="block text-xs text-liciba-muted-dark">{t.club}</span>
                  </span>
                  <span className="text-right font-mono text-[13px] font-medium leading-tight">
                    {t.tiempo}
                    <span className="block text-[11px] text-liciba-muted-dark">{t.gap}</span>
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
