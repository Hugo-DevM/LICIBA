import type { Metadata } from "next";
import { createEvent } from "@/lib/domain/events-actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EventoForm } from "@/components/admin/evento-form";

export const metadata: Metadata = {
  title: "Nuevo evento · Panel staff · LICIBA",
  robots: { index: false, follow: false },
};

export default function NuevoEventoPage() {
  return (
    <AdminShell>
      <AdminPageHeader eyebrow="Eventos" title="Nuevo evento" />
      <div className="flex-1 overflow-auto bg-[#FAF9F6]">
        <EventoForm action={createEvent} submitLabel="Crear evento" />
      </div>
    </AdminShell>
  );
}
