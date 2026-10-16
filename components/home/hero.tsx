import Link from "next/link";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { HERO_IMAGE } from "@/lib/domain/race-images";

export function Hero() {
  return (
    <section className="relative flex min-h-[600px] overflow-hidden bg-liciba-ink text-white md:min-h-[720px]">
      <ImagePlaceholder
        label="FOTO / VIDEO HERO — pelotón en la carretera costera a Mismaloya"
        src={HERO_IMAGE}
        sizes="100vw"
        priority
        dark
        className="absolute inset-0"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(19,32,27,.88) 0%, rgba(19,32,27,.55) 50%, rgba(19,32,27,.05) 100%)",
        }}
      />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col justify-end gap-5 px-5 pb-32 pt-24">
        <div className="flex flex-wrap gap-2">
          <span className="bg-liciba-green px-2.5 py-1.5 font-display text-[13px] font-bold uppercase tracking-wide text-white">
            Temporada 2026
          </span>
          <span className="bg-white/15 px-2.5 py-1.5 font-display text-[13px] font-bold uppercase tracking-wide text-white">
            7 de 11 fechas corridas
          </span>
        </div>

        <h1 className="m-0 flex flex-col gap-1.5 uppercase">
          <span className="font-sans text-[22px] italic font-extrabold leading-none tracking-wide text-liciba-amber md:text-[34px]">
            Liga de Ciclismo · Puerto Vallarta
          </span>
          <span
            className="origin-left font-sans text-[88px] italic font-black leading-[0.8] tracking-tight md:text-[160px] lg:text-[210px]"
            style={{ transform: "scaleX(1.12)" }}
          >
            LICIBA
          </span>
        </h1>

        <p className="m-0 max-w-[520px] text-[17px] font-medium leading-relaxed text-[#E6EBE8] md:text-xl">
          Ruta y montaña entre la Sierra Madre y el Pacífico. Once fechas al año, ocho categorías
          y un solo ranking para toda la bahía.
        </p>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/carreras"
            className="inline-flex min-h-[52px] items-center gap-2.5 bg-liciba-orange px-6 font-display text-lg font-extrabold uppercase tracking-wide text-liciba-ink no-underline hover:bg-liciba-amber"
          >
            Ver próximas carreras →
          </Link>
          <Link
            href="/inscripcion"
            className="inline-flex min-h-[52px] items-center border-2 border-white px-6 font-display text-lg font-extrabold uppercase tracking-wide text-white no-underline hover:bg-white hover:text-liciba-ink"
          >
            Inscribirme
          </Link>
        </div>
      </div>
    </section>
  );
}
