import Link from "next/link";
import type { CarreraDecorada } from "@/lib/domain/types";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { raceImage } from "@/lib/domain/race-images";

interface RaceCardProps {
  race: CarreraDecorada;
  footerLeft?: string;
  footerCta?: string;
  eyebrow?: string;
}

export function RaceCard({ race: r, footerLeft, footerCta = "Ver carrera", eyebrow }: RaceCardProps) {
  return (
    <article className="flex flex-col border border-liciba-border bg-white transition-transform duration-150 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(19,32,27,0.12)]">
      <div className="relative aspect-[16/10]">
        <ImagePlaceholder
          label={`Foto · ${r.nombre}`}
          src={raceImage(r.slug)}
          sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 90vw"
          className="absolute inset-0"
        />
        <span
          className="pointer-events-none absolute right-3 top-3 font-display text-xs font-bold uppercase tracking-wide px-2 py-1.5"
          style={{ background: r.badge.bg, color: r.badge.fg }}
        >
          {r.badge.corto}
        </span>
        <div
          className="pointer-events-none absolute left-3.5 flex items-baseline gap-1.5 bg-liciba-ink px-2.5 py-2 text-white"
          style={{ bottom: -20, transform: "skewX(-10deg)" }}
        >
          <span className="font-sans text-[30px] italic font-extrabold leading-[0.8]">{r.dia}</span>
          <span className="font-display text-[15px] font-extrabold tracking-wide text-liciba-amber">{r.mes}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-4 pb-4 pt-8">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-blue">
          {eyebrow ?? `${r.disciplina} · ${r.tipoTxt}`}
        </div>
        <Link
          href={r.href}
          className="font-sans text-[28px] italic font-extrabold uppercase leading-[0.95] text-liciba-ink no-underline"
        >
          {r.nombre}
        </Link>
        <div className="text-sm leading-relaxed text-liciba-muted">
          {r.sede}
          <br />
          {r.detalle}
        </div>
        <div className="flex flex-wrap gap-1">
          {r.catsCortas.map((c) => (
            <span
              key={c.id}
              className="font-display text-[11px] font-bold tracking-wide text-white px-1.5 py-1"
              style={{ background: c.color }}
            >
              {c.corto}
            </span>
          ))}
          {r.catsMas && (
            <span className="font-display text-[11px] font-bold text-liciba-muted bg-liciba-border-soft px-1.5 py-1">
              {r.catsMas}
            </span>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2.5 border-t border-liciba-border-soft pt-3">
          <span className="font-mono text-xs font-semibold text-liciba-muted">{footerLeft ?? r.cupoTxt}</span>
          <Link
            href={r.href}
            className="py-2.5 font-display text-[15px] font-extrabold uppercase tracking-wide text-liciba-ink no-underline hover:text-liciba-orange"
          >
            {footerCta} →
          </Link>
        </div>
      </div>
    </article>
  );
}
