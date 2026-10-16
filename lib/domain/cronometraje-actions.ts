"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/domain/require-auth";
import { obtenerOAsignarDorsal } from "@/lib/domain/inscripcion-actions";
import { pointsForPosition, isEliteCategoryCode, computeStandingsForSeason } from "@/lib/domain/scoring";
import type { StartlistExportV1, ResultsImportV1, ResultStatus } from "@/lib/domain/cronometraje-schema";

type AdminClient = ReturnType<typeof createAdminClient>;

async function getCategoryMaps(admin: AdminClient) {
  const { data, error } = await admin.from("categories").select("id, code, name, bib_prefix");
  if (error) throw new Error(error.message);
  type Cat = { id: string; code: string; name: string; bib_prefix: string };
  const byCode = new Map<string, Cat>();
  const byId = new Map<string, Cat>();
  for (const c of (data ?? []) as Cat[]) {
    byCode.set(c.code, c);
    byId.set(c.id, c);
  }
  return { byCode, byId };
}

export async function exportStartlist(raceSlug: string): Promise<StartlistExportV1> {
  await requireStaff();
  const admin = createAdminClient();

  const { data: race, error: raceError } = await admin
    .from("races")
    .select("id, slug, name, season_id")
    .eq("slug", raceSlug)
    .maybeSingle();
  if (raceError) throw new Error(raceError.message);
  if (!race) throw new Error("Carrera no encontrada.");

  const { byCode, byId } = await getCategoryMaps(admin);

  const { data: raceCats, error: raceCatsError } = await admin
    .from("race_categories")
    .select("category_id")
    .eq("race_id", race.id);
  if (raceCatsError) throw new Error(raceCatsError.message);
  const categories = (raceCats ?? [])
    .map((rc) => byId.get(rc.category_id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((c) => ({ code: c.code, name: c.name, bibPrefix: c.bib_prefix }));

  const { data: entries, error: entriesError } = await admin
    .from("entries")
    .select("id, rider_id, category_id, scored_category_ids, bib, status, riders(full_name, club, gender)")
    .eq("race_id", race.id);
  if (entriesError) throw new Error(entriesError.message);

  type EntryRow = {
    id: string;
    rider_id: string;
    category_id: string;
    scored_category_ids: string[];
    bib: number | null;
    status: string;
    riders: { full_name: string; club: string | null; gender: "M" | "F" | "X" | null } | null;
  };
  const rows = (entries ?? []) as unknown as EntryRow[];

  const riderIds = rows.map((r) => r.rider_id);
  const { data: bibs, error: bibsError } =
    riderIds.length === 0
      ? { data: [], error: null }
      : await admin
          .from("rider_category_bibs")
          .select("rider_id, category_id, bib")
          .eq("season_id", race.season_id)
          .in("rider_id", riderIds);
  if (bibsError) throw new Error(bibsError.message);

  const bibsByRider = new Map<string, Map<string, number>>();
  for (const b of (bibs ?? []) as { rider_id: string; category_id: string; bib: number }[]) {
    const cat = byId.get(b.category_id);
    if (!cat) continue;
    const m = bibsByRider.get(b.rider_id) ?? new Map<string, number>();
    m.set(cat.code, b.bib);
    bibsByRider.set(b.rider_id, m);
  }

  const entrants = rows.map((r) => {
    const cat = byId.get(r.category_id);
    const scoredCodes = r.scored_category_ids.map((id) => byId.get(id)?.code).filter((c): c is string => Boolean(c));
    const bibsByCategory = Object.fromEntries(bibsByRider.get(r.rider_id) ?? new Map());
    return {
      entryId: r.id,
      riderId: r.rider_id,
      fullName: r.riders?.full_name ?? "",
      club: r.riders?.club ?? null,
      gender: r.riders?.gender ?? null,
      categoryCode: cat?.code ?? "",
      scoredCategoryCodes: scoredCodes,
      bib: r.bib,
      bibsByCategory,
      paid: r.status === "confirmed",
      status: r.status,
    };
  });

  void byCode; // reservado para validaciones futuras del lado de categorías por nombre

  return {
    version: 1,
    race: { id: race.id, slug: race.slug, name: race.name, seasonId: race.season_id },
    categories,
    entrants,
    exportedAt: new Date().toISOString(),
  };
}

export interface ImportPreview {
  ok: boolean;
  errors: string[];
  raceName?: string;
  existingMatched: number;
  existingStale: number;
  walkupCount: number;
  overwriteCount: number;
}

export async function previewResultsImport(payload: ResultsImportV1): Promise<ImportPreview> {
  await requireStaff();
  const admin = createAdminClient();

  if (payload.version !== 1) {
    return { ok: false, errors: ["Versión de archivo no soportada."], existingMatched: 0, existingStale: 0, walkupCount: 0, overwriteCount: 0 };
  }

  const { data: race, error: raceError } = await admin
    .from("races")
    .select("id, slug, name")
    .eq("id", payload.race.id)
    .maybeSingle();
  if (raceError) throw new Error(raceError.message);
  if (!race || race.slug !== payload.race.slug) {
    return { ok: false, errors: ["El archivo no corresponde a esta carrera."], existingMatched: 0, existingStale: 0, walkupCount: 0, overwriteCount: 0 };
  }

  const existingIds = payload.results.filter((r) => r.kind === "existing").map((r) => r.entryId);
  const walkupCount = payload.results.filter((r) => r.kind === "walkup").length;

  const { data: foundEntries, error: entriesError } =
    existingIds.length === 0
      ? { data: [], error: null }
      : await admin.from("entries").select("id").eq("race_id", race.id).in("id", existingIds);
  if (entriesError) throw new Error(entriesError.message);
  const foundSet = new Set((foundEntries ?? []).map((e) => e.id));
  const existingMatched = existingIds.filter((id) => foundSet.has(id)).length;
  const existingStale = existingIds.length - existingMatched;

  const { data: existingResults, error: resultsError } =
    foundSet.size === 0
      ? { data: [], error: null }
      : await admin.from("results").select("entry_id").in("entry_id", Array.from(foundSet));
  if (resultsError) throw new Error(resultsError.message);
  const overwriteCount = new Set((existingResults ?? []).map((r) => r.entry_id)).size;

  return { ok: true, errors: [], raceName: race.name, existingMatched, existingStale, walkupCount, overwriteCount };
}

export interface ImportResult {
  ok: boolean;
  warnings: string[];
  createdRiders: number;
  updatedResults: number;
}

export async function importResults(payload: ResultsImportV1): Promise<ImportResult> {
  await requireStaff();
  const admin = createAdminClient();
  const warnings: string[] = [];

  if (payload.version !== 1) throw new Error("Versión de archivo no soportada.");

  const { data: race, error: raceError } = await admin
    .from("races")
    .select("id, slug, season_id")
    .eq("id", payload.race.id)
    .maybeSingle();
  if (raceError) throw new Error(raceError.message);
  if (!race || race.slug !== payload.race.slug) throw new Error("El archivo no corresponde a esta carrera.");

  const { byCode } = await getCategoryMaps(admin);
  const touchedCategoryIds = new Set<string>();
  let createdRiders = 0;
  let updatedResults = 0;

  for (const r of payload.results) {
    let entryId: string;

    if (r.kind === "existing") {
      const { data: entry, error } = await admin.from("entries").select("id").eq("id", r.entryId).eq("race_id", race.id).maybeSingle();
      if (error) throw new Error(error.message);
      if (!entry) {
        warnings.push(`Inscripción ${r.entryId} ya no existe en esta carrera, se omitió.`);
        continue;
      }
      entryId = entry.id;
    } else {
      const category = byCode.get(r.categoryCode);
      if (!category) {
        warnings.push(`Categoría "${r.categoryCode}" inválida para ${r.rider.fullName}, se omitió.`);
        continue;
      }
      const scoredCats = r.scoredCategoryCodes.map((code) => byCode.get(code)).filter((c): c is NonNullable<typeof c> => Boolean(c));
      const categoriasPuntuadas = scoredCats.length > 0 ? scoredCats : [category];

      const initials = `${r.rider.firstName.charAt(0)}${r.rider.lastName.charAt(0)}`.toUpperCase();
      const { data: rider, error: riderError } = await admin
        .from("riders")
        .insert({
          full_name: r.rider.fullName,
          first_name: r.rider.firstName,
          last_name: r.rider.lastName,
          initials,
          gender: r.rider.gender,
          club: r.rider.club,
        })
        .select("id")
        .single();
      if (riderError || !rider) throw new Error(riderError?.message ?? "No se pudo crear el corredor nuevo.");
      createdRiders++;

      const { data: entry, error: entryError } = await admin
        .from("entries")
        .insert({
          race_id: race.id,
          rider_id: rider.id,
          category_id: category.id,
          scored_category_ids: categoriasPuntuadas.map((c) => c.id),
          status: "confirmed",
          paid_at: new Date().toISOString(),
          payment_method: "efectivo",
        })
        .select("id")
        .single();
      if (entryError || !entry) throw new Error(entryError?.message ?? "No se pudo crear la inscripción del corredor nuevo.");
      entryId = entry.id;

      let primerNumero: number | null = null;
      for (const cat of categoriasPuntuadas) {
        const numero = await obtenerOAsignarDorsal(admin, race.season_id, cat.id, rider.id);
        if (primerNumero === null) primerNumero = numero;
      }
      try {
        const { error: bibError } = await admin.from("entries").update({ bib: primerNumero }).eq("id", entryId);
        if (bibError) throw bibError;
      } catch {
        warnings.push(`No se pudo asignar dorsal visible a ${r.rider.fullName}, revisar manualmente.`);
      }
    }

    for (const pc of r.perCategory) {
      const category = byCode.get(pc.categoryCode);
      if (!category) {
        warnings.push(`Categoría "${pc.categoryCode}" inválida en un resultado, se omitió.`);
        continue;
      }
      touchedCategoryIds.add(category.id);
      const { error } = await admin
        .from("results")
        .upsert(
          { entry_id: entryId, category_id: category.id, net_time_ms: pc.netTimeMs, status: pc.status satisfies ResultStatus },
          { onConflict: "entry_id,category_id" },
        );
      if (error) throw new Error(error.message);
      updatedResults++;
    }
  }

  for (const categoryId of touchedCategoryIds) {
    const category = Array.from(byCode.values()).find((c) => c.id === categoryId);
    const isElite = isEliteCategoryCode(category?.code ?? "");

    const { data: rows, error } = await admin
      .from("results")
      .select("id, net_time_ms, status, entries!inner(race_id)")
      .eq("category_id", categoryId)
      .eq("entries.race_id", race.id);
    if (error) throw new Error(error.message);

    type ResultRow = { id: string; net_time_ms: number | null; status: ResultStatus };
    const ok = (rows ?? []).filter((r) => r.status === "OK").sort((a, b) => (a.net_time_ms ?? 0) - (b.net_time_ms ?? 0)) as unknown as ResultRow[];
    const notOk = (rows ?? []).filter((r) => r.status !== "OK") as unknown as ResultRow[];

    for (let i = 0; i < ok.length; i++) {
      const position = i + 1;
      const points = pointsForPosition(position, isElite);
      const { error: updateError } = await admin.from("results").update({ position, points }).eq("id", ok[i].id);
      if (updateError) throw new Error(updateError.message);
    }
    for (const row of notOk) {
      const { error: updateError } = await admin.from("results").update({ position: null, points: 0 }).eq("id", row.id);
      if (updateError) throw new Error(updateError.message);
    }
  }

  revalidatePath(`/admin/carreras/${payload.race.slug}`);
  revalidatePath("/admin/resultados");

  return { ok: true, warnings, createdRiders, updatedResults };
}

export async function publishRace(raceSlug: string): Promise<{ ok: true }> {
  await requireStaff();
  const admin = createAdminClient();

  const { data: race, error: raceError } = await admin.from("races").select("id, season_id, slug").eq("slug", raceSlug).maybeSingle();
  if (raceError) throw new Error(raceError.message);
  if (!race) throw new Error("Carrera no encontrada.");

  const { error: updateError } = await admin.from("races").update({ status: "published" }).eq("id", race.id);
  if (updateError) throw new Error(updateError.message);

  await computeStandingsForSeason(admin, race.season_id);

  revalidatePath(`/carreras/${raceSlug}`);
  revalidatePath("/ranking");
  revalidatePath(`/admin/carreras/${raceSlug}`);

  return { ok: true };
}
