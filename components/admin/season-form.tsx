const inputClass = "min-h-12 w-full border-2 border-[#D6D3CA] bg-white px-3.5 font-sans text-base font-medium text-liciba-ink";
const labelClass = "font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted";

export function SeasonForm({
  action,
  defaultYear,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultYear: number;
}) {
  return (
    <form action={action} className="mx-auto flex max-w-md flex-col gap-5 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Año</span>
          <input type="number" name="year" defaultValue={defaultYear} required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Nombre</span>
          <input name="name" defaultValue={`Temporada ${defaultYear}`} required className={inputClass} />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-liciba-ink">
        <input type="checkbox" name="is_active" />
        Marcar como temporada activa (cierra la temporada activa actual)
      </label>

      <button
        type="submit"
        className="mt-2 min-h-12 w-fit cursor-pointer border-0 bg-liciba-orange px-5 font-display text-base font-extrabold uppercase tracking-wide text-liciba-ink"
      >
        Crear temporada
      </button>
    </form>
  );
}
