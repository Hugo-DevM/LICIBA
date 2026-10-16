// Funciones puras que reproducen la API de lib/domain/league-data.ts pero
// operan sobre datos reales ya cargados desde Supabase (ver queries.ts).
import type {
  Carrera,
  CarreraDecorada,
  Categoria,
  CategoriaId,
  Corredor,
  HistorialFila,
  InscritoFila,
  RankingFila,
  ResultadoFila,
} from "./types";
import type { LeagueData } from "./queries";

export const CLUBS = ["Bahía Racing", "Vallarta Bike Team", "Sierra MTB", "Pedal Pitillal", "Club Cuale", "Tuito Riders", "Nayarit Cycling", "Independiente"];

export const ESTADOS: Record<Carrera["estado"], { label: string; corto: string; bg: string; fg: string }> = {
  abierta: { label: "Inscripción abierta", corto: "Abierta", bg: "#1E6B43", fg: "#FFFFFF" },
  cerrada: { label: "Inscripción cerrada", corto: "Cerrada", bg: "#FFE6C7", fg: "#8A3D00" },
  finalizada: { label: "Finalizada", corto: "Finalizada", bg: "#E2E6E3", fg: "#34403A" },
};

function fmt(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  return `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}
function gapFmt(s: number) {
  return s <= 0 ? "—" : `+${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}
export const fmtTiempo = fmt;

// Heurística de cierre de inscripción (no se modela en el esquema esencial):
// miércoles previo a la carrera.
function cierreTxt(fecha: string) {
  const d = new Date(fecha);
  d.setDate(d.getDate() - 4);
  const dia = new Intl.DateTimeFormat("es-MX", { day: "2-digit", timeZone: "America/Mexico_City" }).format(d);
  const mes = new Intl.DateTimeFormat("es-MX", { month: "short", timeZone: "America/Mexico_City" }).format(d).replace(".", "");
  const wd = new Intl.DateTimeFormat("es-MX", { weekday: "short", timeZone: "America/Mexico_City" }).format(d).replace(".", "");
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  return `${cap(wd)} ${dia} ${cap(mes)}`;
}

export function createLeagueDataAccessors(data: LeagueData) {
  const { categorias, temporadas, races, riders, entries, results, standings } = data;

  const firstEntryByRider = new Map<string, { categoryId: CategoriaId; bib: number | null }>();
  for (const e of entries) {
    if (!firstEntryByRider.has(e.riderId)) {
      firstEntryByRider.set(e.riderId, { categoryId: e.categoryId, bib: e.bib });
    }
  }

  const CORREDORES: Corredor[] = riders.map((r) => {
    const e = firstEntryByRider.get(r.id);
    return {
      id: r.id,
      nombre: r.nombre,
      completo: r.completo,
      iniciales: r.iniciales,
      cat: e?.categoryId ?? categorias[0]?.id ?? "elite_varonil",
      club: r.club,
      edad: r.edad ?? 0,
      dorsal: e?.bib ?? 0,
      foto: r.foto,
    };
  });

  const inscritosPorCarrera = new Map<string, number>();
  for (const e of entries) {
    inscritosPorCarrera.set(e.raceSlug, (inscritosPorCarrera.get(e.raceSlug) ?? 0) + 1);
  }

  const CARRERAS: Carrera[] = races.map((r) => ({
    slug: r.slug,
    nombre: r.nombre,
    fecha: r.fecha,
    fechaTxt: r.fechaTxt,
    dia: r.dia,
    mes: r.mes,
    sede: r.sede,
    disciplina: r.disciplina,
    tipo: r.tipo,
    detalle: r.detalle,
    estado: r.estado,
    cupo: r.cupo,
    inscritos: inscritosPorCarrera.get(r.slug) ?? 0,
    cuota: r.cuota,
    cierre: r.estado === "cerrada" ? "Cupo lleno" : r.estado === "abierta" ? cierreTxt(r.fecha) : undefined,
    cats: r.cats,
    temporada: r.temporada,
    fecha_n: r.fecha_n,
  }));

  const TEMPORADAS = temporadas;
  const CATEGORIAS = categorias;

  const cat = (id: CategoriaId) => categorias.find((c) => c.id === id) ?? categorias[0];
  const carrera = (slug: string) => CARRERAS.find((c) => c.slug === slug) ?? CARRERAS[0];
  const corredor = (id: string) => CORREDORES.find((c) => c.id === id) ?? CORREDORES[0];

  function decorar(c: Carrera): CarreraDecorada {
    const cs = c.cats.map((id) => cat(id));
    return {
      ...c,
      badge: ESTADOS[c.estado],
      tipoTxt: c.tipo === "ruta" ? "Punto a punto" : "Circuito",
      catsB: cs,
      catsCortas: cs.slice(0, 4),
      catsMas: cs.length > 4 ? `+${cs.length - 4}` : "",
      pct: Math.round((c.inscritos / c.cupo) * 100) + "%",
      cupoTxt: `${c.inscritos} / ${c.cupo}`,
      lugares: Math.max(0, c.cupo - c.inscritos),
      abierta: c.estado === "abierta",
      cerrada: c.estado === "cerrada",
      finalizada: c.estado === "finalizada",
      proxima: c.estado !== "finalizada",
      href: `/carreras/${c.slug}`,
      inscHref: `/inscripcion/${c.slug}`,
      cuotaTxt: `$${c.cuota} MXN`,
      fechaLarga:
        c.fechaTxt +
        " · " +
        new Date(c.fecha).toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Mexico_City",
        }) +
        " h",
    };
  }

  function resultados(slug: string, catId: CategoriaId): ResultadoFila[] {
    const rows = results
      .filter((r) => r.raceSlug === slug && r.categoryId === catId)
      .sort((a, b) => a.position - b.position);
    const base = rows[0]?.netTimeMs ?? 0;
    return rows.map((r) => ({
      ...corredor(r.riderId),
      pos: r.position,
      tiempo: fmt(r.netTimeMs / 1000),
      gap: gapFmt((r.netTimeMs - base) / 1000),
      pts: r.points,
    }));
  }

  function inscritos(slug: string): InscritoFila[] {
    return entries
      .filter((e) => e.raceSlug === slug)
      .map((e) => ({
        ...corredor(e.riderId),
        cat: e.categoryId,
        dorsal: e.bib ?? 0,
        pagado: e.status === "confirmed",
      }));
  }

  function ranking(year: number, catId: CategoriaId): RankingFila[] {
    const rows = standings
      .filter((s) => s.year === year && s.categoryId === catId)
      .sort((a, b) => b.totalPoints - a.totalPoints);
    return rows.map((s, i) => ({
      ...corredor(s.riderId),
      pos: i + 1,
      pts: s.totalPoints,
      carreras: s.racesCounted,
      trend: 0,
      trendTxt: "—",
      trendDir: "eq",
      diff: i === 0 ? "Líder" : `−${rows[0].totalPoints - s.totalPoints}`,
    }));
  }

  function historial(id: string, year = 2026): HistorialFila[] {
    const rider = corredor(id);
    const rows = results
      .filter((r) => r.riderId === id)
      .map((r) => ({ r, c: carrera(r.raceSlug) }))
      .filter(({ c }) => c.temporada === year)
      .sort((a, b) => a.c.fecha.localeCompare(b.c.fecha));

    return rows.map(({ r, c }) => ({
      carrera: c.nombre,
      slug: c.slug,
      fechaTxt: c.fechaTxt.replace(/^\w+ /, ""),
      tipo: c.tipo === "ruta" ? "Ruta" : "Circuito",
      pos: r.position,
      posTxt: `${r.position}º`,
      tiempo: fmt(r.netTimeMs / 1000),
      gap: gapFmt((r.netTimeMs - (results.find((x) => x.raceSlug === c.slug && x.categoryId === rider.cat && x.position === 1)?.netTimeMs ?? r.netTimeMs)) / 1000),
      pts: r.points,
      rk: r.position,
      podio: r.position <= 3,
    }));
  }

  return {
    CATEGORIAS,
    CARRERAS,
    CORREDORES,
    TEMPORADAS,
    CLUBS,
    ESTADOS,
    cat,
    carrera,
    corredor,
    decorar,
    resultados,
    inscritos,
    ranking,
    historial,
    fmtTiempo,
  };
}

export type LeagueDataAccessors = ReturnType<typeof createLeagueDataAccessors>;
