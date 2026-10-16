import Link from "next/link";
import type { Evento } from "@/lib/domain/events";
import { ImagePlaceholder } from "@/components/image-placeholder";

export function EventoCard({ evento }: { evento: Evento }) {
  return (
    <article className="flex flex-col border border-liciba-border bg-white transition-transform duration-150 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(19,32,27,0.12)]">
      <div className="relative aspect-[16/10]">
        <ImagePlaceholder
          label={`Foto · ${evento.title}`}
          src={evento.coverImage ?? undefined}
          sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 90vw"
          className="absolute inset-0"
        />
        <div
          className="pointer-events-none absolute left-3.5 flex items-baseline gap-1.5 bg-liciba-ink px-2.5 py-2 text-white"
          style={{ bottom: -20, transform: "skewX(-10deg)" }}
        >
          <span className="font-sans text-[30px] italic font-extrabold leading-[0.8]">{evento.dia}</span>
          <span className="font-display text-[15px] font-extrabold tracking-wide text-liciba-amber">{evento.mes}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-4 pb-4 pt-8">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-blue">Evento</div>
        <Link
          href={`/eventos/${evento.slug}`}
          className="font-sans text-[28px] italic font-extrabold uppercase leading-[0.95] text-liciba-ink no-underline"
        >
          {evento.title}
        </Link>
        <div className="text-sm leading-relaxed text-liciba-muted">{evento.venue}</div>
        <div className="mt-auto flex items-center justify-between gap-2.5 border-t border-liciba-border-soft pt-3">
          <span className="font-mono text-xs font-semibold text-liciba-muted">{evento.fechaTxt}</span>
          <Link
            href={`/eventos/${evento.slug}`}
            className="py-2.5 font-display text-[15px] font-extrabold uppercase tracking-wide text-liciba-ink no-underline hover:text-liciba-orange"
          >
            Ver evento →
          </Link>
        </div>
      </div>
    </article>
  );
}
