import Link from "next/link";
import { Logo } from "./logo";

const SEDES = ["Malecón · Centro", "Marina Vallarta", "El Tuito · Cabo Corrientes", "San Sebastián del Oeste", "Bucerías · Nayarit"];
const SOCIAL = ["Instagram", "Facebook", "Strava"];

export function SiteFooter() {
  return (
    <footer className="mt-0 bg-liciba-ink font-sans text-[#C9D1CC]">
      <div className="mx-auto grid max-w-7xl gap-9 px-5 pb-7 pt-14 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
        <div className="flex flex-col gap-3.5">
          <Logo tone="dark" height={96} />
          <p className="m-0 max-w-[280px] text-sm leading-relaxed">
            LICIBA, Liga de Ciclismo de Puerto Vallarta: ruta y montaña amateur en Bahía de Banderas desde 2014.
            Afiliada a la Asociación Jalisciense de Ciclismo.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 text-sm">
          <div className="mb-1 font-display text-sm font-bold uppercase tracking-wide text-liciba-amber">Contacto</div>
          <a href="mailto:hola@liciba.mx" className="text-white no-underline">
            hola@liciba.mx
          </a>
          <a href="https://wa.me/523220000000" className="text-white no-underline">
            WhatsApp 322 000 0000
          </a>
          <span>Av. México 1150, Col. 5 de Diciembre, Puerto Vallarta, Jal.</span>
        </div>

        <div className="flex flex-col gap-2.5 text-sm">
          <div className="mb-1 font-display text-sm font-bold uppercase tracking-wide text-liciba-amber">Sedes</div>
          {SEDES.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>

        <div className="flex flex-col gap-2.5 text-sm">
          <div className="mb-1 font-display text-sm font-bold uppercase tracking-wide text-liciba-amber">Síguenos</div>
          <div className="flex flex-wrap gap-2">
            {SOCIAL.map((s) => (
              <a
                key={s}
                href="#"
                className="border border-white/25 px-3 py-2.5 text-[13px] font-semibold text-white no-underline hover:border-liciba-orange"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-7">
        <div className="mb-3 font-display text-xs font-bold uppercase tracking-wide text-liciba-muted-dark">
          Patrocinadores 2026
        </div>
        <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(120px,1fr))]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex h-[52px] items-center justify-center border border-dashed border-white/20 font-mono text-[11px] text-liciba-muted-dark"
            >
              logo
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-5 py-4 text-xs text-liciba-muted-dark">
          <span>© 2026 LICIBA · Liga de Ciclismo Puerto Vallarta A.C.</span>
          <div className="flex flex-wrap gap-[18px]">
            <Link href="#" className="text-liciba-muted-dark">
              Reglamento
            </Link>
            <Link href="#" className="text-liciba-muted-dark">
              Aviso de privacidad
            </Link>
            <Link href="/admin" className="text-liciba-muted-dark">
              Acceso staff
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
