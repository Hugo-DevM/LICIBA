import Link from "next/link";
import type { CarreraDecorada } from "@/lib/domain/types";

export function RegistrationAside({ c }: { c: CarreraDecorada }) {
  const barColor = c.cerrada ? "#F2661C" : "#1E6B43";
  const lugaresTxt = c.cerrada ? "Cupo lleno" : `Quedan ${c.lugares}`;

  return (
    <aside className="order-first flex flex-col border border-liciba-border bg-white shadow-[0_12px_30px_rgba(19,32,27,0.08)] lg:sticky lg:top-[90px] lg:order-last">
      <div className="flex h-[5px]">
        <div className="flex-[3] bg-liciba-green" />
        <div className="flex-[2] bg-liciba-blue" />
        <div className="flex-1 bg-liciba-orange" />
      </div>
      <div className="flex flex-col gap-3.5 p-5">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">
            Cuota general
          </span>
          <span className="font-sans text-4xl italic font-extrabold">{c.cuotaTxt}</span>
        </div>

        {c.proxima && (
          <div className="flex flex-col gap-1.5">
            <div className="h-2 bg-liciba-border-soft">
              <div className="h-full" style={{ width: c.pct, background: barColor }} />
            </div>
            <div className="flex justify-between font-mono text-xs font-semibold text-liciba-muted">
              <span>{c.cupoTxt} inscritos</span>
              <span>{lugaresTxt}</span>
            </div>
          </div>
        )}

        {c.abierta && (
          <>
            <Link
              href={c.inscHref}
              className="flex min-h-[60px] items-center justify-center bg-liciba-orange font-display text-[22px] font-extrabold uppercase tracking-wide text-liciba-ink no-underline hover:bg-liciba-amber"
            >
              Inscribirme
            </Link>
            <span className="text-[13px] leading-normal text-liciba-muted">
              Inscripción cierra <strong className="text-liciba-ink">{c.cierre}, 23:59 h</strong> o al llenarse el
              cupo.
            </span>
          </>
        )}

        {c.cerrada && (
          <>
            <button
              disabled
              className="min-h-[60px] cursor-not-allowed border-0 bg-liciba-border-soft font-display text-[22px] font-extrabold uppercase tracking-wide text-liciba-muted-dark"
            >
              Inscripción cerrada
            </button>
            <div className="bg-[#FFE6C7] p-3 text-sm leading-normal text-[#8A3D00]">
              Se llenó el cupo de {c.cupo} corredores.{" "}
              <a href="#" className="font-bold text-[#8A3D00]">
                Únete a la lista de espera
              </a>{" "}
              y te avisamos si se libera un lugar.
            </div>
          </>
        )}

        {c.finalizada && (
          <>
            <div className="bg-[#E2E6E3] p-3 text-sm leading-normal text-[#34403A]">
              Carrera finalizada con {c.inscritos} corredores. Resultados oficiales publicados.
            </div>
            <a
              href="#resultados"
              className="flex min-h-[52px] items-center justify-center bg-liciba-ink font-display text-lg font-extrabold uppercase tracking-wide text-white no-underline"
            >
              ↓ Ver resultados
            </a>
          </>
        )}

        <div className="flex flex-col gap-1.5 border-t border-liciba-border-soft pt-3 text-[13px] text-liciba-muted">
          <span>Incluye chip, seguro, playera y avituallamiento.</span>
          <a href="#" className="font-semibold">
            Reglamento de la carrera (PDF)
          </a>
        </div>
      </div>
    </aside>
  );
}
