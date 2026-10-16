import type { Metadata } from "next";
import { getLeagueData } from "@/lib/domain/queries";
import { createLeagueDataAccessors } from "@/lib/domain/accessors";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export const instant = false;

export const metadata: Metadata = {
  title: "Categorías · Panel staff · LICIBA",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriasPage() {
  const { CATEGORIAS, CORREDORES } = createLeagueDataAccessors(await getLeagueData());
  const rows = CATEGORIAS.map((cat) => ({
    ...cat,
    n: CORREDORES.filter((r) => r.cat === cat.id).length,
  }));

  return (
    <AdminShell>
      <AdminPageHeader eyebrow="Panel staff" title="Categorías" />
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full min-w-[480px] border-collapse font-sans text-[13px] font-medium">
          <thead>
            <tr className="sticky top-0 z-[2] bg-liciba-ink text-white">
              <th className="px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">CATEGORÍA</th>
              <th className="w-28 px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">CORTO</th>
              <th className="w-32 px-3.5 py-2.5 text-right font-mono text-[11px] font-semibold">CORREDORES</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-b border-liciba-border-soft">
                <td className="px-3.5 py-3">
                  <span className="inline-flex items-center gap-2.5 text-sm font-semibold">
                    <span className="h-2.5 w-2.5 flex-none" style={{ background: c.color }} />
                    {c.nombre}
                  </span>
                </td>
                <td className="px-3.5 py-3">
                  <span className="font-display text-xs font-bold tracking-wide text-white px-1.5 py-1" style={{ background: c.color }}>
                    {c.corto}
                  </span>
                </td>
                <td className="px-3.5 py-3 text-right font-mono">{c.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
