import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ResultadosTable } from "@/components/admin/resultados-table";

export const metadata: Metadata = {
  title: "Resultados · Panel staff · LICIBA",
  robots: { index: false, follow: false },
};

export default function AdminResultadosPage() {
  return (
    <AdminShell>
      <AdminPageHeader eyebrow="Panel staff" title="Resultados" />
      <ResultadosTable />
    </AdminShell>
  );
}
