import type { Metadata } from "next";
import Link from "next/link";
import { getEventsAdmin } from "@/lib/domain/events";
import { deleteEvent } from "@/lib/domain/events-actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export const instant = false;

export const metadata: Metadata = {
  title: "Eventos · Panel staff · LICIBA",
  robots: { index: false, follow: false },
};

export default async function AdminEventosPage() {
  const eventos = await getEventsAdmin();

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Panel staff"
        title="Eventos"
        actions={
          <Link
            href="/admin/eventos/nuevo"
            className="flex h-[38px] cursor-pointer items-center whitespace-nowrap border-0 bg-liciba-orange px-4 font-display text-[15px] font-extrabold uppercase tracking-wide text-liciba-ink no-underline"
          >
            + Nuevo evento
          </Link>
        }
      />
      <div className="flex-1 overflow-auto bg-white">
        {eventos.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-10 text-center text-sm text-liciba-muted">
            Todavía no hay eventos. Crea el primero con &quot;+ Nuevo evento&quot;.
          </div>
        ) : (
          <table className="w-full min-w-[760px] border-collapse font-sans text-[13px] font-medium">
            <thead>
              <tr className="sticky top-0 z-[2] bg-liciba-ink text-white">
                <th className="w-20 px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">FECHA</th>
                <th className="px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">EVENTO</th>
                <th className="w-32 px-3.5 py-2.5 text-left font-mono text-[11px] font-semibold">ESTADO</th>
                <th className="w-40 px-3.5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {eventos.map((e) => (
                <tr key={e.slug} className="border-b border-liciba-border-soft hover:bg-[#FAF9F6]">
                  <td className="whitespace-nowrap px-3.5 py-3 font-mono text-[13px] text-liciba-muted">
                    {e.dia} {e.mes}
                  </td>
                  <td className="px-3.5 py-3">
                    <Link
                      href={`/admin/eventos/${e.slug}/editar`}
                      className="font-sans text-[15px] font-semibold text-liciba-ink no-underline hover:text-liciba-blue"
                    >
                      {e.title}
                    </Link>
                    <div className="text-xs text-liciba-muted">{e.venue}</div>
                  </td>
                  <td className="px-3.5 py-3">
                    <span
                      className="font-display text-xs font-bold uppercase tracking-wide px-1.5 py-1"
                      style={{
                        background: e.status === "published" ? "#1E6B43" : "#FFE6C7",
                        color: e.status === "published" ? "#fff" : "#8A3D00",
                      }}
                    >
                      {e.status === "published" ? "Publicado" : "Borrador"}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/eventos/${e.slug}/editar`}
                        className="font-display text-xs font-bold uppercase tracking-wide text-liciba-ink no-underline"
                      >
                        Editar
                      </Link>
                      <form action={deleteEvent.bind(null, e.slug)}>
                        <button
                          type="submit"
                          className="cursor-pointer border-0 bg-transparent p-0 font-display text-xs font-bold uppercase tracking-wide text-[#B23A0B]"
                        >
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
