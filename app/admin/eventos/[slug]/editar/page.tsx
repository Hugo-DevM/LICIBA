import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventAdminBySlug } from "@/lib/domain/events";
import { updateEvent, deleteEvent } from "@/lib/domain/events-actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EventoForm } from "@/components/admin/evento-form";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const evento = await getEventAdminBySlug(slug);
  return { title: evento ? `${evento.title} · Panel staff · LICIBA` : "Evento · Panel staff · LICIBA", robots: { index: false, follow: false } };
}

export default async function EditarEventoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const evento = await getEventAdminBySlug(slug);
  if (!evento) notFound();

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Eventos"
        title={evento.title}
        actions={
          <form action={deleteEvent.bind(null, slug)}>
            <button
              type="submit"
              className="h-[38px] cursor-pointer whitespace-nowrap border border-[#D6D3CA] bg-white px-3.5 font-sans text-[13px] font-semibold text-[#B23A0B]"
            >
              Eliminar evento
            </button>
          </form>
        }
      />
      <div className="flex-1 overflow-auto bg-[#FAF9F6]">
        <EventoForm action={updateEvent.bind(null, slug)} evento={evento} submitLabel="Guardar cambios" />
      </div>
    </AdminShell>
  );
}
