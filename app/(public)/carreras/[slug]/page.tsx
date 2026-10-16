import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeagueData } from "@/lib/domain/queries";
import { createLeagueDataAccessors } from "@/lib/domain/accessors";
import { buildRaceInfo } from "@/lib/domain/race-info";
import { raceImage } from "@/lib/domain/race-images";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { ResultsSection } from "@/components/carrera/results-section";
import { EntrantsSection } from "@/components/carrera/entrants-section";
import { RegistrationAside } from "@/components/carrera/registration-aside";
import { MobileStickyCta } from "@/components/carrera/mobile-sticky-cta";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { carrera } = createLeagueDataAccessors(await getLeagueData());
  const c = carrera(slug);
  return { title: `${c.nombre} · LICIBA` };
}

export default async function CarreraPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { carrera, decorar } = createLeagueDataAccessors(await getLeagueData());
  const raw = carrera(slug);
  if (raw.slug !== slug) notFound();
  const c = decorar(raw);

  const { tiles, catsSalida, cuotas } = buildRaceInfo(c);

  return (
    <>
      <section className="relative flex min-h-[420px] bg-liciba-ink text-white md:min-h-[520px]">
        <ImagePlaceholder
          label={`Portada · ${c.nombre}`}
          src={raceImage(c.slug)}
          sizes="100vw"
          priority
          dark
          className="absolute inset-0"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(0deg, rgba(19,32,27,.92) 0%, rgba(19,32,27,.5) 55%, rgba(19,32,27,.15) 100%)" }}
        />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col justify-between gap-6 px-5 pb-9 pt-10">
          <div className="flex gap-2 font-mono text-xs uppercase tracking-wide">
            <Link href="/carreras" className="text-[#CFE7D8]">
              Carreras
            </Link>
            <span className="text-liciba-muted-dark">/</span>
            <span className="text-white">{c.temporada}</span>
          </div>
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-wrap gap-2">
              <span
                className="font-display text-[13px] font-bold uppercase tracking-wide px-2.5 py-1.5"
                style={{ background: c.badge.bg, color: c.badge.fg }}
              >
                {c.badge.label}
              </span>
              <span className="bg-white/[0.14] font-display text-[13px] font-bold uppercase tracking-wide px-2.5 py-1.5">
                Fecha {c.fecha_n} · {c.disciplina}
              </span>
            </div>
            <h1 className="m-0 max-w-[14ch] font-sans text-[48px] italic font-extrabold uppercase leading-[0.86] md:text-[96px]">
              {c.nombre}
            </h1>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 font-sans text-base font-medium text-[#E6EBE8] md:text-[17px]">
              <span>{c.fechaLarga}</span>
              <span>{c.sede}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl items-start gap-8 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-10">
          <section className="grid gap-px border-2 border-liciba-border bg-liciba-border" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
            {tiles.map((t) => (
              <div key={t.k} className="flex flex-col gap-1.5 bg-white p-4">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">{t.k}</span>
                <span className="font-sans text-[32px] italic font-extrabold uppercase leading-[0.95]">{t.v}</span>
                <span className="text-[13px] leading-snug text-liciba-muted">{t.s}</span>
              </div>
            ))}
          </section>

          <section className="flex flex-col gap-3.5">
            <h2 className="m-0 font-sans text-4xl italic font-extrabold uppercase leading-[0.95]">Recorrido</h2>
            <ImagePlaceholder label={`Mapa del recorrido + perfil altimétrico (${c.detalle})`} className="aspect-[21/9] min-h-[200px]" />
          </section>

          <section className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))" }}>
            <div className="flex flex-col gap-3">
              <h2 className="m-0 font-sans text-4xl italic font-extrabold uppercase leading-[0.95]">Categorías</h2>
              <div className="flex flex-col border border-liciba-border bg-white">
                {catsSalida.map((k) => (
                  <div key={k.id} className="flex items-center gap-2.5 border-b border-liciba-border-soft px-3.5 py-2.5">
                    <span className="h-2.5 w-2.5 flex-none" style={{ background: k.color }} />
                    <span className="flex-1 font-sans text-[15px] font-semibold leading-tight">{k.nombre}</span>
                    <span className="font-mono text-[13px] font-medium text-liciba-muted">{k.salida}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="m-0 font-sans text-4xl italic font-extrabold uppercase leading-[0.95]">Cuotas</h2>
              <div className="flex flex-col border border-liciba-border bg-white">
                {cuotas.map((q) => (
                  <div key={q.k} className="flex items-baseline gap-2.5 border-b border-liciba-border-soft px-3.5 py-3">
                    <span className="flex-1 font-sans text-[15px] font-semibold leading-snug">
                      {q.k}
                      <span className="block font-sans text-[13px] font-normal text-liciba-muted">{q.s}</span>
                    </span>
                    <span className="font-mono text-base font-semibold">{q.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {c.finalizada && (
            <div id="resultados">
              <ResultsSection c={c} />
            </div>
          )}
          {c.proxima && <EntrantsSection c={c} />}
        </div>

        <RegistrationAside c={c} />
      </div>

      <MobileStickyCta c={c} />
    </>
  );
}
