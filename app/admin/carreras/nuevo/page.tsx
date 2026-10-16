import type { Metadata } from "next";
import Link from "next/link";
import { getLeagueData } from "@/lib/domain/queries";
import { createLeagueDataAccessors } from "@/lib/domain/accessors";
import { getSeasonsAdmin } from "@/lib/domain/seasons";
import { createRace } from "@/lib/domain/race-actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { RaceForm } from "@/components/admin/race-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Nueva carrera · Panel staff · LICIBA",
  robots: { index: false, follow: false },
};

export default async function NuevaCarreraPage() {
  const [{ CATEGORIAS }, seasons] = await Promise.all([
    getLeagueData().then(createLeagueDataAccessors),
    getSeasonsAdmin(),
  ]);

  if (seasons.length === 0) {
    return (
      <AdminShell>
        <AdminPageHeader eyebrow="Carreras" title="Nueva carrera" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
          <p className="text-sm text-liciba-muted">Primero crea una temporada antes de agregar carreras.</p>
          <Link
            href="/admin/temporadas/nueva"
            className="flex h-[38px] cursor-pointer items-center whitespace-nowrap border-0 bg-liciba-orange px-4 font-display text-[15px] font-extrabold uppercase tracking-wide text-liciba-ink no-underline"
          >
            + Nueva temporada
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <AdminPageHeader eyebrow="Carreras" title="Nueva carrera" />
      <div className="flex-1 overflow-auto bg-[#FAF9F6]">
        <RaceForm action={createRace} seasons={seasons} categorias={CATEGORIAS} submitLabel="Crear carrera" />
      </div>
    </AdminShell>
  );
}
