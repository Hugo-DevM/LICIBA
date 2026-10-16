import type { Categoria } from "@/lib/domain/types";
import type { Season } from "@/lib/domain/seasons";

const inputClass = "min-h-12 w-full border-2 border-[#D6D3CA] bg-white px-3.5 font-sans text-base font-medium text-liciba-ink";
const labelClass = "font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted";

const STATUS_OPTIONS = [
  { value: "draft", label: "Borrador" },
  { value: "open", label: "Inscripción abierta" },
  { value: "closed", label: "Inscripción cerrada" },
  { value: "running", label: "En curso" },
  { value: "finished", label: "Terminada" },
  { value: "published", label: "Resultados publicados" },
];

export function RaceForm({
  action,
  seasons,
  categorias,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  seasons: Season[];
  categorias: Categoria[];
  submitLabel: string;
}) {
  const defaultSeason = seasons.find((s) => s.isActive) ?? seasons[0];

  return (
    <form action={action} className="mx-auto flex max-w-2xl flex-col gap-5 p-5">
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Nombre de la carrera</span>
        <input name="name" placeholder="Subida a El Tuito" required className={inputClass} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Fecha y hora</span>
          <input type="datetime-local" name="race_date" required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Temporada</span>
          <select name="season_year" required className={inputClass} defaultValue={defaultSeason?.year}>
            {seasons.map((s) => (
              <option key={s.id} value={s.year}>
                {s.name}
                {s.isActive ? " (activa)" : " (cerrada)"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Sede</span>
        <input name="venue" placeholder="Boca de Tomatlán → El Tuito" required className={inputClass} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Disciplina</span>
          <input name="discipline" placeholder="Ruta, Montaña…" required className={inputClass} />
        </label>
        <fieldset className="flex flex-col gap-2">
          <span className={labelClass}>Tipo</span>
          <div className="flex h-12 items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-liciba-ink">
              <input type="radio" name="type" value="ruta" defaultChecked />
              Punto a punto
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-liciba-ink">
              <input type="radio" name="type" value="circuito" />
              Circuito
            </label>
          </div>
        </fieldset>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Detalle (opcional)</span>
        <input name="detail" placeholder="Punto a punto · 38 km · +1,050 m" className={inputClass} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Distancia (km, opcional)</span>
          <input type="number" name="distance_km" min={0} step="0.1" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Vueltas (opcional)</span>
          <input type="number" name="laps" min={0} step={1} className={inputClass} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Cupo</span>
          <input type="number" name="capacity" min={0} step={1} defaultValue={150} required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Cuota (MXN)</span>
          <input type="number" name="fee" min={0} step="0.01" defaultValue={0} required className={inputClass} />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Estado</span>
        <select name="status" defaultValue="draft" className={inputClass}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="flex flex-col gap-2">
        <span className={labelClass}>Categorías</span>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
          {categorias.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 text-sm font-semibold text-liciba-ink">
              <input type="checkbox" name="categories" value={cat.id} defaultChecked />
              {cat.corto}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>URL de imagen de portada (opcional)</span>
        <input name="cover_image" placeholder="https://…" className={inputClass} />
      </label>

      <button
        type="submit"
        className="mt-2 min-h-12 w-fit cursor-pointer border-0 bg-liciba-orange px-5 font-display text-base font-extrabold uppercase tracking-wide text-liciba-ink"
      >
        {submitLabel}
      </button>
    </form>
  );
}
