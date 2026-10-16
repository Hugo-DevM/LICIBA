import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOptionalUser } from "./require-auth";
import { CATS_MENORES } from "./category-rules";
import type { CategoriaId } from "./types";

export interface RiderProfile {
  id: string;
  user_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  initials: string;
  birth_date: string | null;
  gender: "M" | "F" | "X" | null;
  club: string | null;
  phone: string | null;
  email: string | null;
  shirt_size: string | null;
  emergency_contact_name: string | null;
  emergency_contact_relationship: string | null;
  emergency_phone: string | null;
  blood_type: string | null;
  health_notes: string | null;
  photo_url: string | null;
}

export const getMyProfile = cache(async (): Promise<RiderProfile | null> => {
  const user = await getOptionalUser();
  if (!user) return null;
  const admin = createAdminClient();
  const { data, error } = await admin.from("riders").select("*").eq("user_id", user.id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
});

export interface RiderDorsal {
  categoria: string;
  letra: string;
  numero: number;
  dorsal: string;
}

export interface RiderEntry {
  id: string;
  folio: string;
  raceName: string;
  raceSlug: string;
  raceDate: string;
  categoryCode: CategoriaId;
  categoryName: string;
  status: string;
  paymentMethod: "oxxo" | "spei" | null;
  montoTotal: number;
  dorsales: RiderDorsal[];
}

// Inscripciones del corredor con sesión, para que la referencia de pago no
// se pierda si cierra la pantalla de confirmación y vuelve después.
export const getMyEntries = cache(async (): Promise<RiderEntry[]> => {
  const user = await getOptionalUser();
  if (!user) return [];

  const admin = createAdminClient();
  const { data: rider } = await admin.from("riders").select("id").eq("user_id", user.id).maybeSingle();
  if (!rider) return [];

  const { data, error } = await admin
    .from("entries")
    .select(
      "id, status, payment_method, scored_category_ids, created_at, categories(code, name), races(name, slug, race_date, fee, season_id)",
    )
    .eq("rider_id", rider.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const { data: bibs } = await admin
    .from("rider_category_bibs")
    .select("season_id, category_id, bib")
    .eq("rider_id", rider.id);
  const bibPorTemporadaCategoria = new Map((bibs ?? []).map((b) => [`${b.season_id}:${b.category_id}`, b.bib]));

  const { data: todasCategorias } = await admin.from("categories").select("id, name, bib_prefix");
  const categoriaPorId = new Map((todasCategorias ?? []).map((c) => [c.id, c]));

  return (data ?? []).map((e) => {
    const category = Array.isArray(e.categories) ? e.categories[0] : e.categories;
    const race = Array.isArray(e.races) ? e.races[0] : e.races;
    const categoryCode = category?.code as CategoriaId;
    const esMenor = CATS_MENORES.includes(categoryCode);
    const eliteBonus = (e.scored_category_ids?.length ?? 1) > 1;
    const fee = Number(race?.fee ?? 0);
    const montoTotal = (esMenor ? fee - 250 : fee) + (eliteBonus ? 200 : 0) + 350;

    const dorsales: RiderDorsal[] = (e.scored_category_ids ?? []).flatMap((categoryId: string) => {
      const bib = race?.season_id ? bibPorTemporadaCategoria.get(`${race.season_id}:${categoryId}`) : undefined;
      const cat = categoriaPorId.get(categoryId);
      if (bib === undefined || !cat) return [];
      return [{ categoria: cat.name, letra: cat.bib_prefix, numero: bib, dorsal: `${cat.bib_prefix}-${bib}` }];
    });

    return {
      id: e.id,
      folio: `LICIBA-${e.id.slice(0, 8).toUpperCase()}`,
      raceName: race?.name ?? "",
      raceSlug: race?.slug ?? "",
      raceDate: race?.race_date ?? "",
      categoryCode,
      categoryName: category?.name ?? "",
      status: e.status,
      paymentMethod: e.payment_method,
      montoTotal,
      dorsales,
    };
  });
});
