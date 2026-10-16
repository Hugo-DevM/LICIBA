import type { Evento } from "@/lib/domain/events";
import { toDatetimeLocalValue } from "@/lib/domain/events";

const inputClass = "min-h-12 w-full border-2 border-[#D6D3CA] bg-white px-3.5 font-sans text-base font-medium text-liciba-ink";
const labelClass = "font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted";

export function EventoForm({
  action,
  evento,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  evento?: Evento;
  submitLabel: string;
}) {
  return (
    <form action={action} className="mx-auto flex max-w-2xl flex-col gap-5 p-5">
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Título</span>
        <input name="title" defaultValue={evento?.title} placeholder="Rodada Nocturna Malecón" required className={inputClass} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Fecha y hora</span>
          <input
            type="datetime-local"
            name="event_date"
            defaultValue={evento ? toDatetimeLocalValue(evento.fecha) : undefined}
            required
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Sede</span>
          <input name="venue" defaultValue={evento?.venue} placeholder="Malecón, Centro" required className={inputClass} />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Descripción</span>
        <textarea
          name="description"
          defaultValue={evento?.description}
          rows={5}
          placeholder="De qué trata el evento, qué llevar, punto de reunión…"
          className="w-full resize-y border-2 border-[#D6D3CA] bg-white px-3.5 py-3 font-sans text-base leading-snug text-liciba-ink"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>URL de imagen de portada (opcional)</span>
        <input
          name="cover_image"
          defaultValue={evento?.coverImage ?? ""}
          placeholder="https://…"
          className={inputClass}
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <span className={labelClass}>Estado</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-liciba-ink">
            <input type="radio" name="status" value="draft" defaultChecked={!evento || evento.status === "draft"} />
            Borrador
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-liciba-ink">
            <input type="radio" name="status" value="published" defaultChecked={evento?.status === "published"} />
            Publicado
          </label>
        </div>
      </fieldset>

      <button
        type="submit"
        className="mt-2 min-h-12 w-fit cursor-pointer border-0 bg-liciba-orange px-5 font-display text-base font-extrabold uppercase tracking-wide text-liciba-ink"
      >
        {submitLabel}
      </button>
    </form>
  );
}
