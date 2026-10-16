import type { Metadata } from "next";
import Link from "next/link";
import { getLeagueData } from "@/lib/domain/queries";
import { createLeagueDataAccessors } from "@/lib/domain/accessors";
import { getSeasonsAdmin } from "@/lib/domain/seasons";
import { closeSeason, activateSeason } from "@/lib/domain/season-actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export const instant = false;

export const metadata: Metadata = {
  title: "Temporadas · Panel staff · LICIBA",
  robots: { index: false, follow: false },
};

export default async function AdminTemporadasPage() {
  const [leagueData, seasons] = await Promise.all([getLeagueData(), getSeasonsAdmin()]);
  const { CARRERAS } = createLeagueDataAccessors(leagueData);

  const rows = seasons.map((s) => {
    const races = CARRERAS.filter((c) => c.temporada === s.year);
    const corridas = races.filter((c) => c.estado === "finalizada").length;
    return { ...s, total: races.length, corridas };
  });

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Panel staff"
        title="Temporadas"
        actions={
          <Link
            href="/admin/temporadas/nueva"
            className="flex h-[38px] cursor-pointer items-center whitespace-nowrap border-0 bg-liciba-orange px-4 font-display text-[15px] font-extrabold uppercase tracking-wide text-liciba-ink no-underline"
          >
            + Nueva temporada
          </Link>
        }
      />
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full min-w-[620px] border-collapse font-sans text-[13px] font-medium">
          <thead>
            <tr className="sticky top-0 z-[2] bg-liciba-ink text-white">
              <th className="px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">TEMPORADA</th>
              <th className="w-32 px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">ESTADO</th>
              <th className="w-40 px-3.5 py-2.5 text-right font-mono text-[11px] font-semibold">FECHAS CORRIDAS</th>
              <th className="w-28 px-3.5 py-2.5 text-right font-mono text-[11px] font-semibold">TOTAL</th>
              <th className="w-36 px-3.5 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-liciba-border-soft">
                <td className="px-3.5 py-3 font-display text-lg font-bold">{r.name}</td>
                <td className="px-3.5 py-3">
                  <span
                    className="font-display text-xs font-bold uppercase tracking-wide px-1.5 py-1"
                    style={{ background: r.isActive ? "#1E6B43" : "#E2E6E3", color: r.isActive ? "#fff" : "#34403A" }}
                  >
                    {r.isActive ? "Activa" : "Cerrada"}
                  </span>
                </td>
                <td className="px-3.5 py-3 text-right font-mono">
                  {r.corridas} / {r.total}
                </td>
                <td className="px-3.5 py-3 text-right font-mono">{r.total}</td>
                <td className="px-3.5 py-3 text-right">
                  {r.isActive ? (
                    <form action={closeSeason.bind(null, r.id)}>
                      <button
                        type="submit"
                        className="cursor-pointer border-0 bg-transparent p-0 font-display text-xs font-bold uppercase tracking-wide text-[#B23A0B]"
                      >
                        Cerrar temporada
                      </button>
                    </form>
                  ) : (
                    <form action={activateSeason.bind(null, r.id)}>
                      <button
                        type="submit"
                        className="cursor-pointer border-0 bg-transparent p-0 font-display text-xs font-bold uppercase tracking-wide text-liciba-ink"
                      >
                        Reactivar
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
