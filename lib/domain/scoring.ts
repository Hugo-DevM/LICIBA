import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

// Tabla de puntos por posición. Ajustar aquí si cambia el reglamento de
// la liga — es el único lugar donde vive esta regla.
export const POINTS_TABLE = [50, 45, 40, 36, 32, 29, 26, 23, 20, 18, 16, 14, 12, 10];
export const POINTS_FLAT_BEYOND = 8;
export const ELITE_MULTIPLIER = 2;

// Mismo criterio que inscripcion-actions.ts/league-data.ts: Elite se
// identifica por código, no por categories.is_open (ese flag no está
// poblado como "sin límite de edad" en los datos reales hoy).
export const ELITE_CATEGORY_CODES = new Set(["elite_femenil", "elite_varonil"]);

export function isEliteCategoryCode(code: string): boolean {
  return ELITE_CATEGORY_CODES.has(code);
}

export function pointsForPosition(position: number, isElite: boolean): number {
  const base = POINTS_TABLE[position - 1] ?? POINTS_FLAT_BEYOND;
  return isElite ? base * ELITE_MULTIPLIER : base;
}

// Recalcula standings desde cero a partir de los results de carreras YA
// publicadas de la temporada. Simple e idempotente: no descarta carreras,
// no hay desempates todavía (ver PLAN.md §4, pendiente de definir).
export async function computeStandingsForSeason(admin: AdminClient, seasonId: string): Promise<void> {
  const { data: rows, error } = await admin
    .from("results")
    .select("category_id, points, entries!inner(rider_id, races!inner(season_id, status))")
    .eq("entries.races.season_id", seasonId)
    .eq("entries.races.status", "published");
  if (error) throw new Error(error.message);

  type Row = { category_id: string; points: number; entries: { rider_id: string } };
  const totals = new Map<string, { categoryId: string; riderId: string; totalPoints: number; racesCounted: number }>();

  for (const r of (rows ?? []) as unknown as Row[]) {
    const key = `${r.category_id}:${r.entries.rider_id}`;
    const acc = totals.get(key) ?? { categoryId: r.category_id, riderId: r.entries.rider_id, totalPoints: 0, racesCounted: 0 };
    acc.totalPoints += r.points;
    acc.racesCounted += 1;
    totals.set(key, acc);
  }

  const upserts = Array.from(totals.values()).map((t) => ({
    season_id: seasonId,
    category_id: t.categoryId,
    rider_id: t.riderId,
    total_points: t.totalPoints,
    races_counted: t.racesCounted,
    updated_at: new Date().toISOString(),
  }));

  if (upserts.length === 0) return;
  const { error: upsertError } = await admin.from("standings").upsert(upserts, { onConflict: "season_id,category_id,rider_id" });
  if (upsertError) throw new Error(upsertError.message);
}
