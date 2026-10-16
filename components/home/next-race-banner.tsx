import Link from "next/link";
import type { CarreraDecorada } from "@/lib/domain/types";
import { Countdown } from "./countdown";

export function NextRaceBanner({ next }: { next: CarreraDecorada }) {
  return (
    <section className="relative mx-auto max-w-7xl px-5" style={{ marginTop: "-84px" }}>
      <div className="flex flex-wrap items-stretch bg-white shadow-[0_18px_40px_rgba(19,32,27,0.16)]">
        <div
          className="flex flex-none flex-col items-center justify-center bg-liciba-orange text-liciba-ink"
          style={{ minWidth: 112, padding: "18px 22px" }}
        >
          <span className="font-sans text-[64px] italic font-extrabold leading-[0.8]">{next.dia}</span>
          <span className="mt-1.5 font-display text-xl font-extrabold tracking-wide">{next.mes}</span>
        </div>

        <div
          className="flex min-w-0 flex-col gap-2"
          style={{ flex: "1 1 300px", padding: "20px 22px" }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-green">
              Próxima fecha · {next.disciplina}
            </span>
            <span
              className="font-display text-xs font-bold uppercase tracking-wide px-2 py-1"
              style={{ background: next.badge.bg, color: next.badge.fg }}
            >
              {next.badge.corto}
            </span>
          </div>
          <Link
            href={next.href}
            className="font-sans text-[34px] italic font-extrabold uppercase leading-[0.95] text-liciba-ink no-underline"
          >
            {next.nombre}
          </Link>
          <div className="text-[15px] text-liciba-muted">
            {next.sede} · {next.detalle}
          </div>
          <div className="mt-1 flex items-center gap-2.5">
            <div className="h-1.5 flex-1 bg-liciba-border-soft" style={{ maxWidth: 260 }}>
              <div className="h-full bg-liciba-green" style={{ width: next.pct }} />
            </div>
            <span className="font-mono text-xs font-semibold text-liciba-muted">
              {next.cupoTxt} · quedan {next.lugares}
            </span>
          </div>
        </div>

        <div
          className="flex flex-col justify-center gap-2 border-l border-liciba-border-soft"
          style={{ flex: "1 1 280px", padding: "18px 22px" }}
        >
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">
            Arranque en
          </span>
          <Countdown targetIso={next.fecha} />
        </div>

        <div
          className="flex flex-col justify-center gap-2"
          style={{ flex: "1 1 200px", padding: "18px 22px" }}
        >
          <Link
            href={next.inscHref}
            className="flex min-h-14 items-center justify-center bg-liciba-orange font-display text-xl font-extrabold uppercase tracking-wide text-liciba-ink no-underline hover:bg-liciba-amber"
          >
            Inscribirme
          </Link>
          <span className="text-center text-[13px] text-liciba-muted">
            {next.cuotaTxt} · cierre {next.cierre}
          </span>
        </div>
      </div>
    </section>
  );
}
