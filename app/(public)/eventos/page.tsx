import type { Metadata } from "next";
import { getEventsPublic } from "@/lib/domain/events";
import { EventoCard } from "@/components/evento-card";

export const instant = false;

export const metadata: Metadata = {
  title: "Eventos · LICIBA",
};

export default async function EventosPage() {
  const eventos = await getEventsPublic();
  const now = Date.now();
  const proximos = eventos.filter((e) => new Date(e.fecha).getTime() >= now);
  const pasados = eventos
    .filter((e) => new Date(e.fecha).getTime() < now)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <>
      <section className="bg-liciba-blue text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-5 pb-10 pt-12">
          <div>
            <div className="mb-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-[#CFE4F2]">
              Fuera de competencia
            </div>
            <h1 className="m-0 font-sans text-[52px] italic font-extrabold uppercase leading-[0.86] md:text-[96px]">
              Eventos
            </h1>
          </div>
          <p className="m-0 max-w-[380px] text-base leading-normal text-[#E3F0E8]">
            Rodadas sociales, talleres y actividades recreativas de la liga. Sin categorías ni resultados, solo para
            disfrutar la bici.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-[72px] pt-9">
        {eventos.length === 0 && (
          <div className="flex flex-col items-center gap-3 border-2 border-dashed border-[#D6D3CA] px-5 py-14 text-center">
            <div className="font-sans text-[32px] italic font-extrabold uppercase">Sin eventos por ahora</div>
            <p className="m-0 text-liciba-muted">Vuelve pronto, publicamos las próximas actividades aquí.</p>
          </div>
        )}

        {proximos.length > 0 && (
          <div className="flex flex-col gap-5">
            <h2 className="m-0 font-sans text-3xl italic font-extrabold uppercase leading-none">Próximos</h2>
            <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))" }}>
              {proximos.map((e) => (
                <EventoCard key={e.slug} evento={e} />
              ))}
            </div>
          </div>
        )}

        {pasados.length > 0 && (
          <div className="mt-12 flex flex-col gap-5">
            <h2 className="m-0 font-sans text-3xl italic font-extrabold uppercase leading-none">Pasados</h2>
            <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))" }}>
              {pasados.map((e) => (
                <EventoCard key={e.slug} evento={e} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
