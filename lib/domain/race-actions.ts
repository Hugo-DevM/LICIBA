"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/domain/require-auth";

const COMBINING_MARKS = new RegExp("[̀-ͯ]", "g");

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Las carreras de la liga son en Puerto Vallarta: se asume siempre horario
// del centro de México (UTC-6, sin horario de verano desde 2022).
function toTimestamptz(datetimeLocal: string) {
  const withSeconds = datetimeLocal.length === 16 ? `${datetimeLocal}:00` : datetimeLocal;
  return `${withSeconds}-06:00`;
}

export async function createRace(formData: FormData) {
  await requireStaff();

  const name = String(formData.get("name") || "").trim();
  const raceDate = String(formData.get("race_date") || "").trim();
  const venue = String(formData.get("venue") || "").trim();
  const discipline = String(formData.get("discipline") || "").trim();
  const type = formData.get("type") === "circuito" ? "circuito" : "ruta";
  const detail = String(formData.get("detail") || "").trim();
  const distanceKm = String(formData.get("distance_km") || "").trim();
  const laps = String(formData.get("laps") || "").trim();
  const status = String(formData.get("status") || "draft");
  const fee = String(formData.get("fee") || "0").trim();
  const capacity = String(formData.get("capacity") || "0").trim();
  const coverImage = String(formData.get("cover_image") || "").trim();
  const seasonYear = Number(formData.get("season_year"));
  const categoryCodes = formData.getAll("categories").map(String);

  if (!name || !raceDate || !venue || !discipline || !seasonYear) {
    throw new Error("Faltan campos obligatorios (nombre, fecha, sede, disciplina, temporada).");
  }
  if (categoryCodes.length === 0) {
    throw new Error("Selecciona al menos una categoría.");
  }

  const admin = createAdminClient();

  const { data: season, error: seasonError } = await admin.from("seasons").select("id").eq("year", seasonYear).single();
  if (seasonError || !season) throw new Error("No se encontró la temporada seleccionada.");

  const { data: categories, error: categoriesError } = await admin.from("categories").select("id, code").in("code", categoryCodes);
  if (categoriesError) throw new Error(categoriesError.message);

  const { data: lastRace } = await admin
    .from("races")
    .select("fecha_n")
    .eq("season_id", season.id)
    .order("fecha_n", { ascending: false })
    .limit(1)
    .maybeSingle();
  const fechaN = (lastRace?.fecha_n ?? 0) + 1;

  const base = slugify(name) || "carrera";
  const { data: existing } = await admin.from("races").select("slug").like("slug", `${base}%`);
  const taken = new Set((existing ?? []).map((r) => r.slug));
  let slug = base;
  let n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;

  const { data: race, error } = await admin
    .from("races")
    .insert({
      season_id: season.id,
      slug,
      name,
      race_date: toTimestamptz(raceDate),
      venue,
      discipline,
      type,
      detail: detail || null,
      distance_km: distanceKm ? Number(distanceKm) : null,
      laps: laps ? Number(laps) : null,
      status,
      fee: Number(fee) || 0,
      capacity: Number(capacity) || 0,
      fecha_n: fechaN,
      cover_image: coverImage || null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const { error: catsError } = await admin
    .from("race_categories")
    .insert((categories ?? []).map((c) => ({ race_id: race.id, category_id: c.id })));
  if (catsError) throw new Error(catsError.message);

  revalidatePath("/carreras");
  revalidatePath("/admin/carreras");
  redirect(`/admin/carreras/${slug}`);
}
