import type { Metadata } from "next";
import { connection } from "next/server";
import { createSeason } from "@/lib/domain/season-actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SeasonForm } from "@/components/admin/season-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Nueva temporada · Panel staff · LICIBA",
  robots: { index: false, follow: false },
};

export default async function NuevaTemporadaPage() {
  await connection();

  return (
    <AdminShell>
      <AdminPageHeader eyebrow="Temporadas" title="Nueva temporada" />
      <div className="flex-1 overflow-auto bg-[#FAF9F6]">
        <SeasonForm action={createSeason} defaultYear={new Date().getFullYear() + 1} />
      </div>
    </AdminShell>
  );
}
