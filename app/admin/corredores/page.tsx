import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CorredoresTable } from "@/components/admin/corredores-table";

export const metadata: Metadata = {
  title: "Corredores · Panel staff · LICIBA",
  robots: { index: false, follow: false },
};

export default function AdminCorredoresPage() {
  return (
    <AdminShell>
      <AdminPageHeader eyebrow="Panel staff" title="Corredores" />
      <CorredoresTable />
    </AdminShell>
  );
}
