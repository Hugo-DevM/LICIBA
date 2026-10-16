import Link from "next/link";
import type { CarreraDecorada } from "@/lib/domain/types";
import { RaceCard } from "@/components/race-card";

export function UpcomingRaces({ races }: { races: CarreraDecorada[] }) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-10 pt-[72px]">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-liciba-green">
            Calendario 2026
          </div>
          <h2 className="m-0 font-sans text-[40px] italic font-extrabold uppercase leading-[0.9] md:text-[68px]">
            Próximas carreras
          </h2>
        </div>
        <Link
          href="/carreras"
          className="border-b-[3px] border-liciba-orange pb-1 font-display text-base font-extrabold uppercase tracking-wide text-liciba-ink no-underline"
        >
          Calendario completo →
        </Link>
      </div>

      {races.length === 0 ? (
        <div className="flex flex-col items-center gap-2 border-2 border-dashed border-[#D6D3CA] px-5 py-14 text-center">
          <div className="font-sans text-2xl italic font-extrabold uppercase">Aún no hay carreras programadas</div>
          <p className="m-0 text-liciba-muted">Vuelve pronto para ver el calendario de la temporada.</p>
        </div>
      ) : (
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
          {races.map((r) => (
            <RaceCard key={r.slug} race={r} />
          ))}
        </div>
      )}
    </section>
  );
}
