import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CarrerasTable } from "@/components/admin/carreras-table";

export const metadata: Metadata = {
  title: "Carreras · Panel staff · LICIBA",
  robots: { index: false, follow: false },
};

export default function AdminCarrerasPage() {
  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="2026 / Carreras"
        title="Carreras de la temporada"
        actions={
          <Link
            href="/admin/carreras/nuevo"
            className="flex h-[38px] cursor-pointer items-center whitespace-nowrap border-0 bg-liciba-orange px-4 font-display text-[15px] font-extrabold uppercase tracking-wide text-liciba-ink no-underline"
          >
            + Nueva carrera
          </Link>
        }
      />
      <CarrerasTable />
    </AdminShell>
  );
}
