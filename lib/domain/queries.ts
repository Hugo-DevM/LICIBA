// Datos reales desde Supabase (reemplaza lib/domain/league-data.ts en el sitio).
// league-data.ts se conserva solo como generador determinista para scripts/seed.ts.
import { cache } from "react";
import { supabasePublic as supabase } from "@/lib/supabase/public";
import type { Categoria, CategoriaId } from "./types";

export interface RawRider {
  id: string;
  nombre: string;
  completo: string;
  iniciales: string;
  club: string;
  edad: number | null;
  foto: string | null;
}

export interface RawEntry {
  raceSlug: string;
  riderId: string;
  bib: number | null;
  categoryId: CategoriaId;
  status: string;
}

export interface RawResult {
  raceSlug: string;
  riderId: string;
  categoryId: CategoriaId;
  netTimeMs: number;
  position: number;
  points: number;
}

export interface RawStanding {
  year: number;
  categoryId: CategoriaId;
  riderId: string;
  totalPoints: number;
  racesCounted: number;
}

export interface RawRace {
  slug: string;
  nombre: string;
  fecha: string;
  fechaTxt: string;
  dia: string;
  mes: string;
  sede: string;
  disciplina: string;
  tipo: "ruta" | "circuito";
  detalle: string;
  estado: "abierta" | "cerrada" | "finalizada";
  cupo: number;
  cuota: number;
  temporada: number;
  fecha_n: number;
  cats: CategoriaId[];
}

export interface LeagueData {
  categorias: Categoria[];
  temporadas: number[];
  races: RawRace[];
  riders: RawRider[];
  entries: RawEntry[];
  results: RawResult[];
  standings: RawStanding[];
}

const STATUS_FROM_DB: Record<string, RawRace["estado"]> = {
  draft: "cerrada",
  open: "abierta",
  closed: "cerrada",
  running: "cerrada",
  finished: "cerrada",
  published: "finalizada",
};

export const getLeagueData = cache(async (): Promise<LeagueData> => {
  const [categoriesRes, seasonsRes, racesRes, ridersRes, entriesRes, resultsRes, standingsRes] = await Promise.all([
    supabase.from("categories").select("code, name, short_name, color, min_age, max_age, bib_prefix").order("sort_order"),
    supabase.from("seasons").select("year").order("year", { ascending: false }),
    supabase
      .from("races")
      .select(
        "slug, name, race_date, venue, discipline, type, detail, status, fee, capacity, fecha_n, seasons(year), race_categories(categories(code))",
      )
      .order("race_date"),
    supabase.from("riders_public").select("id, first_name, last_name, full_name, initials, club, edad, photo_url"),
    supabase.from("entries").select("bib, status, races(slug), categories(code), rider_id"),
    supabase.from("results").select("net_time_ms, position, points, categories(code), entries(rider_id, races(slug))"),
    supabase.from("standings").select("total_points, races_counted, seasons(year), categories(code), rider_id"),
  ]);

  for (const res of [categoriesRes, seasonsRes, racesRes, ridersRes, entriesRes, resultsRes, standingsRes]) {
    if (res.error) throw new Error(res.error.message);
  }

  const categorias: Categoria[] = (categoriesRes.data ?? []).map((c) => ({
    id: c.code as CategoriaId,
    nombre: c.name,
    corto: c.short_name,
    color: c.color,
    edadMin: c.min_age,
    edadMax: c.max_age,
    dorsalLetra: c.bib_prefix,
  }));

  const temporadas = (seasonsRes.data ?? []).map((s) => s.year);

  const races: RawRace[] = (racesRes.data ?? []).map((r) => {
    const raceDate = new Date(r.race_date);
    const { dia, mes, fechaTxt } = fechaParts(raceDate);
    const estado = STATUS_FROM_DB[r.status] ?? "cerrada";
    const season = Array.isArray(r.seasons) ? r.seasons[0] : r.seasons;
    const cats = (r.race_categories ?? [])
      .map((rc) => {
        const category = Array.isArray(rc.categories) ? rc.categories[0] : rc.categories;
        return category?.code as CategoriaId | undefined;
      })
      .filter((x): x is CategoriaId => Boolean(x));

    return {
      slug: r.slug,
      nombre: r.name,
      fecha: raceDate.toISOString(),
      dia,
      mes,
      fechaTxt,
      sede: r.venue,
      disciplina: r.discipline,
      tipo: r.type as "ruta" | "circuito",
      detalle: r.detail ?? "",
      estado,
      cupo: r.capacity,
      cuota: Number(r.fee),
      temporada: season?.year ?? 0,
      fecha_n: r.fecha_n ?? 0,
      cats,
    };
  });

  const riders: RawRider[] = (ridersRes.data ?? []).map((r) => ({
    id: r.id,
    nombre: `${r.first_name} ${r.last_name.split(" ")[0]}`,
    completo: r.full_name,
    iniciales: r.initials,
    club: r.club,
    edad: r.edad,
    foto: r.photo_url,
  }));

  const entries: RawEntry[] = (entriesRes.data ?? []).map((e) => {
    const race = Array.isArray(e.races) ? e.races[0] : e.races;
    const category = Array.isArray(e.categories) ? e.categories[0] : e.categories;
    return {
      raceSlug: race?.slug ?? "",
      riderId: e.rider_id,
      bib: e.bib,
      categoryId: category?.code as CategoriaId,
      status: e.status,
    };
  });

  const results: RawResult[] = (resultsRes.data ?? []).map((r) => {
    const entry = Array.isArray(r.entries) ? r.entries[0] : r.entries;
    const race = entry ? (Array.isArray(entry.races) ? entry.races[0] : entry.races) : undefined;
    const category = Array.isArray(r.categories) ? r.categories[0] : r.categories;
    return {
      raceSlug: race?.slug ?? "",
      riderId: entry?.rider_id ?? "",
      categoryId: category?.code as CategoriaId,
      netTimeMs: r.net_time_ms ?? 0,
      position: r.position ?? 0,
      points: r.points,
    };
  });

  const standings: RawStanding[] = (standingsRes.data ?? []).map((s) => {
    const season = Array.isArray(s.seasons) ? s.seasons[0] : s.seasons;
    const category = Array.isArray(s.categories) ? s.categories[0] : s.categories;
    return {
      year: season?.year ?? 0,
      categoryId: category?.code as CategoriaId,
      riderId: s.rider_id,
      totalPoints: s.total_points,
      racesCounted: s.races_counted,
    };
  });

  return { categorias, temporadas, races, riders, entries, results, standings };
});

export function fechaParts(d: Date) {
  const tz = "America/Mexico_City";
  const dia = new Intl.DateTimeFormat("es-MX", { day: "2-digit", timeZone: tz }).format(d);
  const mesRaw = new Intl.DateTimeFormat("es-MX", { month: "short", timeZone: tz }).format(d).replace(".", "");
  const weekdayRaw = new Intl.DateTimeFormat("es-MX", { weekday: "short", timeZone: tz }).format(d).replace(".", "");
  const year = new Intl.DateTimeFormat("es-MX", { year: "numeric", timeZone: tz }).format(d);
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  const mes = mesRaw.toUpperCase();
  const fechaTxt = `${cap(weekdayRaw)} ${dia} ${cap(mesRaw)} ${year}`;
  return { dia, mes, fechaTxt };
}
