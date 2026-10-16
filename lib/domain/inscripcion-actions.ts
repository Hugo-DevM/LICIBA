"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getOptionalUser } from "@/lib/domain/require-auth";
import type { PagoId } from "@/lib/domain/payment-info";

export interface DorsalAsignado {
  categoria: string;
  letra: string;
  numero: number;
  dorsal: string;
}

export type SubmitInscripcionResult =
  | { ok: true; folio: string; dorsales: DorsalAsignado[] }
  | { ok: false; error: string };

type AdminClient = ReturnType<typeof createAdminClient>;

// El dorsal es por TEMPORADA (liga), no por carrera: si el corredor ya
// corrió esa categoría esta temporada conserva su número; si es su primera
// vez, toma el siguiente consecutivo libre. Reintenta si otra inscripción
// se adelantó (el unique constraint de rider_category_bibs es lo que
// realmente evita el choque). Una liga nueva usa otro season_id, así que
// la numeración puede reiniciar sin tocar esta lógica.
async function obtenerOAsignarDorsal(
  admin: AdminClient,
  seasonId: string,
  categoryId: string,
  riderId: string,
): Promise<number> {
  const { data: existente } = await admin
    .from("rider_category_bibs")
    .select("bib")
    .eq("season_id", seasonId)
    .eq("category_id", categoryId)
    .eq("rider_id", riderId)
    .maybeSingle();
  if (existente) return existente.bib;

  for (let intento = 0; intento < 5; intento++) {
    const { data: ultimo } = await admin
      .from("rider_category_bibs")
      .select("bib")
      .eq("season_id", seasonId)
      .eq("category_id", categoryId)
      .order("bib", { ascending: false })
      .limit(1)
      .maybeSingle();
    const siguiente = (ultimo?.bib ?? 0) + 1;

    const { error } = await admin
      .from("rider_category_bibs")
      .insert({ season_id: seasonId, category_id: categoryId, rider_id: riderId, bib: siguiente });
    if (!error) return siguiente;
    if (error.code === "23505") continue; // alguien más tomó ese número justo ahora; reintenta.
    throw new Error(error.message);
  }
  throw new Error("No se pudo asignar un dorsal, intenta de nuevo.");
}

export async function submitInscripcion(
  _prevState: SubmitInscripcionResult | null,
  formData: FormData,
): Promise<SubmitInscripcionResult> {
  const str = (k: string) => String(formData.get(k) ?? "");
  const input = {
    raceSlug: str("raceSlug"),
    nombre: str("nombre"),
    apellidos: str("apellidos"),
    nac: str("nac"),
    sexo: str("sexo"),
    email: str("email"),
    tel: str("tel"),
    club: str("club"),
    talla: str("talla"),
    categoryCode: str("categoryCode"),
    elite: str("elite") === "true",
    eNombre: str("eNombre"),
    eRel: str("eRel"),
    eTel: str("eTel"),
    sangre: str("sangre"),
    salud: str("salud"),
    pago: str("pago") as PagoId,
  };

  const user = await getOptionalUser();
  const admin = createAdminClient();

  const initials = `${input.nombre.charAt(0)}${input.apellidos.charAt(0)}`.toUpperCase();
  const riderFields = {
    full_name: `${input.nombre} ${input.apellidos}`,
    first_name: input.nombre,
    last_name: input.apellidos,
    initials,
    birth_date: input.nac || null,
    gender: input.sexo === "Femenil" ? "F" : "M",
    email: input.email || null,
    phone: input.tel || null,
    club: input.club || null,
    shirt_size: input.talla || null,
    emergency_contact_name: input.eNombre || null,
    emergency_contact_relationship: input.eRel || null,
    emergency_phone: input.eTel || null,
    blood_type: input.sangre || null,
    health_notes: input.salud || null,
  };

  // Con cuenta: se guarda/actualiza su perfil para la próxima vez. Sin
  // cuenta (invitado): se crea un corredor nuevo en cada inscripción, sin
  // ligarlo a ningún login — no hay nada que autorrellenar después.
  const { data: rider, error: riderError } = user
    ? await admin.from("riders").upsert({ user_id: user.id, ...riderFields }, { onConflict: "user_id" }).select("id").single()
    : await admin.from("riders").insert(riderFields).select("id").single();
  if (riderError || !rider) return { ok: false, error: "No se pudo guardar tu perfil." };

  const { data: race } = await admin
    .from("races")
    .select("id, status, season_id")
    .eq("slug", input.raceSlug)
    .maybeSingle();
  if (!race) return { ok: false, error: "Carrera no encontrada." };
  if (race.status !== "open") return { ok: false, error: "La inscripción para esta carrera ya no está abierta." };

  const { data: category } = await admin.from("categories").select("id, name, bib_prefix").eq("code", input.categoryCode).maybeSingle();
  if (!category) return { ok: false, error: "Categoría inválida." };

  const categoriasPuntuadas = [category];
  const eliteCode = input.sexo === "Femenil" ? "elite_femenil" : "elite_varonil";
  if (input.elite && input.categoryCode !== eliteCode) {
    const { data: eliteCat } = await admin.from("categories").select("id, name, bib_prefix").eq("code", eliteCode).maybeSingle();
    if (eliteCat) categoriasPuntuadas.push(eliteCat);
  }

  const { data: entry, error: entryError } = await admin
    .from("entries")
    .insert({
      race_id: race.id,
      rider_id: rider.id,
      category_id: category.id,
      scored_category_ids: categoriasPuntuadas.map((c) => c.id),
      status: "pending_payment",
      payment_method: input.pago,
    })
    .select("id")
    .single();

  if (entryError) {
    if (entryError.code === "23505") return { ok: false, error: "Ya estás inscrito en esta carrera." };
    return { ok: false, error: entryError.message };
  }

  const dorsales: DorsalAsignado[] = [];
  for (const cat of categoriasPuntuadas) {
    const numero = await obtenerOAsignarDorsal(admin, race.season_id, cat.id, rider.id);
    dorsales.push({ categoria: cat.name, letra: cat.bib_prefix, numero, dorsal: `${cat.bib_prefix}-${numero}` });
  }
  // entries.bib se mantiene como el dorsal de la categoría principal, por
  // compatibilidad con el resto del admin que todavía lo lee como número.
  await admin.from("entries").update({ bib: dorsales[0].numero }).eq("id", entry.id);

  return { ok: true, folio: `LICIBA-${entry.id.slice(0, 8).toUpperCase()}`, dorsales };
}
