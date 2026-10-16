import Link from "next/link";
import type { RiderEntry } from "@/lib/domain/profile";
import { PAGOS } from "@/lib/domain/payment-info";
import { DorsalToggle } from "./dorsal-toggle";

const STATUS_BADGE: Record<string, { label: string; bg: string; fg: string }> = {
  pending_payment: { label: "Pendiente de pago", bg: "#FFE6C7", fg: "#8A3D00" },
  confirmed: { label: "Confirmado", bg: "#E1F0E6", fg: "#1E6B43" },
  dns: { label: "No se presentó", bg: "#E2E6E3", fg: "#34403A" },
  dnf: { label: "No terminó", bg: "#E2E6E3", fg: "#34403A" },
  dsq: { label: "Descalificado", bg: "#FDE8DC", fg: "#8A3D00" },
};

function fechaCorta(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Mexico_City" });
}

export function MyEntries({ entries }: { entries: RiderEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <section className="mb-6 flex flex-col gap-3">
      <h2 className="m-0 font-sans text-2xl italic font-extrabold uppercase leading-none">Mis inscripciones</h2>
      <div className="flex flex-col gap-3">
        {entries.map((e) => {
          const badge = STATUS_BADGE[e.status] ?? STATUS_BADGE.pending_payment;
          const pago = e.paymentMethod ? PAGOS[e.paymentMethod] : null;
          return (
            <div key={e.id} className="border border-liciba-border bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2.5">
                <div>
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">
                    Folio {e.folio}
                  </span>
                  <Link
                    href={`/carreras/${e.raceSlug}`}
                    className="block font-sans text-xl font-extrabold uppercase leading-tight text-liciba-ink no-underline hover:text-liciba-blue"
                  >
                    {e.raceName}
                  </Link>
                  <span className="text-sm text-liciba-muted">
                    {fechaCorta(e.raceDate)} · {e.categoryName}
                  </span>
                </div>
                <span
                  className="font-display text-xs font-bold uppercase tracking-wide px-2 py-1.5"
                  style={{ background: badge.bg, color: badge.fg }}
                >
                  {badge.label}
                </span>
              </div>

              <div className="mt-3.5">
                <DorsalToggle dorsales={e.dorsales} />
              </div>

              {e.status === "pending_payment" && (
                <div className="mt-3.5 flex flex-wrap items-center gap-[18px] bg-liciba-ink p-4 text-white">
                  <div className="flex flex-1 basis-[220px] flex-col gap-1">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-amber">
                      {pago ? pago.titulo : "Falta elegir método de pago"}
                    </span>
                    {pago && (
                      <>
                        <span className="break-all font-mono text-lg font-semibold tracking-wide">{pago.referencia}</span>
                        <span className="text-xs text-liciba-muted-dark">{pago.instrucciones(e.montoTotal)}</span>
                      </>
                    )}
                  </div>
                  <span className="font-mono text-2xl font-semibold text-liciba-amber">
                    ${e.montoTotal.toLocaleString("es-MX")}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
