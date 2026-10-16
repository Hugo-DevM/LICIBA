import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminRankingTable } from "@/components/admin/admin-ranking-table";

export const metadata: Metadata = {
  title: "Ranking · Panel staff · LICIBA",
  robots: { index: false, follow: false },
};

export default function AdminRankingPage() {
  return (
    <AdminShell>
      <AdminPageHeader eyebrow="Clasificación general" title="Ranking" />
      <AdminRankingTable />
    </AdminShell>
  );
}
