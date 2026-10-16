import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventPublicBySlug } from "@/lib/domain/events";
import { ImagePlaceholder } from "@/components/image-placeholder";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const evento = await getEventPublicBySlug(slug);
  return { title: evento ? `${evento.title} · LICIBA` : "Evento · LICIBA" };
}

export default async function EventoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const evento = await getEventPublicBySlug(slug);
  if (!evento) notFound();

  const hora = new Date(evento.fecha).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Mexico_City",
  });

  return (
    <>
      <section className="relative flex min-h-[360px] bg-liciba-ink text-white md:min-h-[440px]">
        <ImagePlaceholder label={`Portada · ${evento.title}`} src={evento.coverImage ?? undefined} sizes="100vw" priority dark className="absolute inset-0" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(0deg, rgba(19,32,27,.92) 0%, rgba(19,32,27,.5) 55%, rgba(19,32,27,.15) 100%)" }}
        />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col justify-between gap-6 px-5 pb-9 pt-10">
          <div className="flex gap-2 font-mono text-xs uppercase tracking-wide">
            <Link href="/eventos" className="text-[#CFE4F2]">
              Eventos
            </Link>
          </div>
          <div className="flex flex-col gap-3.5">
            <span className="w-fit bg-white/[0.14] font-display text-[13px] font-bold uppercase tracking-wide px-2.5 py-1.5">
              {evento.fechaTxt} · {hora} h
            </span>
            <h1 className="m-0 max-w-[16ch] font-sans text-[44px] italic font-extrabold uppercase leading-[0.86] md:text-[80px]">
              {evento.title}
            </h1>
            <div className="text-base font-medium text-[#E6EBE8] md:text-[17px]">{evento.venue}</div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[760px] px-5 py-10">
        {evento.description ? (
          <p className="m-0 whitespace-pre-line text-[17px] leading-relaxed text-[#2E3B35]">{evento.description}</p>
        ) : (
          <p className="m-0 text-liciba-muted">Más información pronto.</p>
        )}
      </div>
    </>
  );
}
