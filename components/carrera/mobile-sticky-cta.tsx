import Link from "next/link";
import type { CarreraDecorada } from "@/lib/domain/types";

export function MobileStickyCta({ c }: { c: CarreraDecorada }) {
  if (!c.abierta) return null;
  const lugaresTxt = c.cerrada ? "Cupo lleno" : `Quedan ${c.lugares}`;

  return (
    <div className="sticky bottom-0 z-30 flex items-center gap-3 bg-liciba-ink px-4 py-2.5 shadow-[0_-8px_20px_rgba(0,0,0,0.2)] lg:hidden">
      <span className="flex-1 font-sans text-[13px] font-semibold leading-tight text-white">
        {c.cuotaTxt}
        <span className="block font-mono text-[11px] font-semibold text-liciba-amber">{lugaresTxt}</span>
      </span>
      <Link
        href={c.inscHref}
        className="flex min-h-12 items-center bg-liciba-orange px-[22px] font-display text-lg font-extrabold uppercase tracking-wide text-liciba-ink no-underline"
      >
        Inscribirme
      </Link>
    </div>
  );
}
