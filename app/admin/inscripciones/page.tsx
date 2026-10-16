import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { InscripcionesTable } from "@/components/admin/inscripciones-table";

export const metadata: Metadata = {
  title: "Inscripciones · Panel staff · LICIBA",
  robots: { index: false, follow: false },
};

export default function AdminInscripcionesPage() {
  return (
    <AdminShell>
      <AdminPageHeader eyebrow="Panel staff" title="Inscripciones" />
      <InscripcionesTable />
    </AdminShell>
  );
}
