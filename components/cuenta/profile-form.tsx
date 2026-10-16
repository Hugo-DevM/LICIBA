import type { RiderProfile } from "@/lib/domain/profile";
import { PhotoField } from "@/components/cuenta/photo-upload";

const inputClass = "min-h-12 w-full border-2 border-[#D6D3CA] bg-white px-3.5 font-sans text-base font-medium text-liciba-ink";
const labelClass = "font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted";
const SEXOS = ["Varonil", "Femenil"];
const TALLAS = ["XS", "S", "M", "L", "XL", "XXL"];
const SANGRES = ["O+", "O−", "A+", "A−", "B+", "B−", "AB+", "AB−", "No sé"];

function Label({ children }: { children: React.ReactNode }) {
  return <span className={labelClass}>{children}</span>;
}

export function ProfileForm({
  action,
  profile,
}: {
  action: (formData: FormData) => void | Promise<void>;
  profile: RiderProfile | null;
}) {
  const sexoValue = profile?.gender === "F" ? "Femenil" : profile?.gender === "M" ? "Varonil" : "";

  return (
    <form action={action} className="flex flex-col gap-6">
      <PhotoField photoUrl={profile?.photo_url ?? null} />

      <section className="flex flex-col gap-4 border border-liciba-border bg-white p-5">
        <h2 className="m-0 font-display text-base font-bold uppercase tracking-wide text-liciba-muted">
          Datos del corredor
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <Label>Nombre(s)</Label>
            <input name="nombre" defaultValue={profile?.first_name} required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <Label>Apellidos</Label>
            <input name="apellidos" defaultValue={profile?.last_name} required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <Label>Fecha de nacimiento</Label>
            <input type="date" name="nac" defaultValue={profile?.birth_date ?? ""} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <Label>Rama</Label>
            <select name="sexo" defaultValue={sexoValue} className={inputClass}>
              <option value="">—</option>
              {SEXOS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <Label>Correo</Label>
            <input type="email" name="email" defaultValue={profile?.email ?? ""} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <Label>Celular (WhatsApp)</Label>
            <input type="tel" name="tel" defaultValue={profile?.phone ?? ""} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <Label>Club / equipo</Label>
            <input name="club" defaultValue={profile?.club ?? ""} placeholder="Independiente" className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <Label>Talla de playera</Label>
            <select name="talla" defaultValue={profile?.shirt_size ?? ""} className={inputClass}>
              <option value="">—</option>
              {TALLAS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-4 border border-liciba-border bg-white p-5">
        <h2 className="m-0 font-display text-base font-bold uppercase tracking-wide text-liciba-muted">
          Emergencia y salud
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <Label>Contacto de emergencia</Label>
            <input name="eNombre" defaultValue={profile?.emergency_contact_name ?? ""} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <Label>Parentesco</Label>
            <input name="eRel" defaultValue={profile?.emergency_contact_relationship ?? ""} placeholder="Esposa, padre…" className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <Label>Teléfono de emergencia</Label>
            <input type="tel" name="eTel" defaultValue={profile?.emergency_phone ?? ""} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <Label>Tipo de sangre</Label>
            <select name="sangre" defaultValue={profile?.blood_type ?? ""} className={inputClass}>
              <option value="">—</option>
              {SANGRES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1.5">
          <Label>Alergias, medicamentos o condiciones</Label>
          <textarea
            name="salud"
            defaultValue={profile?.health_notes ?? ""}
            rows={3}
            placeholder="Opcional. Solo lo verá el equipo médico."
            className="w-full resize-y border-2 border-[#D6D3CA] bg-white px-3.5 py-3 font-sans text-base leading-snug text-liciba-ink"
          />
        </label>
      </section>

      <button
        type="submit"
        className="min-h-12 w-fit cursor-pointer border-0 bg-liciba-orange px-5 font-display text-base font-extrabold uppercase tracking-wide text-liciba-ink"
      >
        Guardar datos
      </button>
    </form>
  );
}
