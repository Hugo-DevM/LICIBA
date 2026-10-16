// Datos de ejemplo — Liga de Ciclismo Puerto Vallarta
// Port TypeScript del prototipo visual (Home.dc.html / liga-data.js).
// Reemplazar por queries a Supabase cuando el esquema de §2 del plan esté listo.
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

function mk(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
function hash(str: string) {
  let h = 7;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) % 2147483647;
  return h || 1;
}

export const HOY = new Date("2026-10-13T09:00:00-06:00");

// Categorías reales de la liga, edades y letra de dorsal tomadas del flyer
// "Reto La Limonera" (5ª fecha, serial LICIBA 2026). "Libre" en el flyer
// (sin restricción de edad) se guarda como edadMin/edadMax null.
export const CATEGORIAS: Categoria[] = [
  { id: "panales", nombre: "Pañales", corto: "PAÑALES", color: "#C9A7E0", edadMin: 3, edadMax: 4, dorsalLetra: "P" },
  { id: "infantil_aa", nombre: "Infantil AA", corto: "INF AA", color: "#5FB3D9", edadMin: 5, edadMax: 6, dorsalLetra: "AA" },
  { id: "infantil_a", nombre: "Infantil A", corto: "INF A", color: "#4AA0C7", edadMin: 7, edadMax: 8, dorsalLetra: "A" },
  { id: "infantil_b", nombre: "Infantil B", corto: "INF B", color: "#3A8CB5", edadMin: 9, edadMax: 10, dorsalLetra: "B" },
  { id: "infantil_c", nombre: "Infantil C", corto: "INF C", color: "#2B79A3", edadMin: 11, edadMax: 12, dorsalLetra: "C" },
  { id: "juvenil_a", nombre: "Juvenil A", corto: "JUV A", color: "#2E7D4F", edadMin: 13, edadMax: 14, dorsalLetra: "JA" },
  { id: "juvenil_b", nombre: "Juvenil B", corto: "JUV B", color: "#3F8F5E", edadMin: 15, edadMax: 16, dorsalLetra: "JB" },
  { id: "juvenil_c", nombre: "Juvenil C", corto: "JUV C", color: "#4FA16D", edadMin: 17, edadMax: 19, dorsalLetra: "JC" },
  { id: "principiantes", nombre: "Principiantes", corto: "PRINC", color: "#6E6A1F", edadMin: null, edadMax: null, dorsalLetra: "P" },
  { id: "femenil_intermedio", nombre: "Femenil Intermedio", corto: "FEM INT", color: "#C2487A", edadMin: null, edadMax: null, dorsalLetra: "FI" },
  { id: "elite_femenil", nombre: "Elite Femenil", corto: "ELITE F", color: "#B0285A", edadMin: null, edadMax: null, dorsalLetra: "FE" },
  { id: "elite_varonil", nombre: "Elite Varonil", corto: "ELITE V", color: "#14201C", edadMin: null, edadMax: null, dorsalLetra: "X" },
  { id: "master_20", nombre: "Master 20", corto: "M20", color: "#0B5C8A", edadMin: 20, edadMax: 29, dorsalLetra: "MA" },
  { id: "master_30", nombre: "Master 30", corto: "M30", color: "#2B6E9E", edadMin: 30, edadMax: 39, dorsalLetra: "MB" },
  { id: "master_40", nombre: "Master 40", corto: "M40", color: "#4F7A28", edadMin: 40, edadMax: 49, dorsalLetra: "MC" },
  { id: "master_50", nombre: "Master 50", corto: "M50", color: "#7E3A8C", edadMin: 50, edadMax: null, dorsalLetra: "MD" },
];
export const cat = (id: CategoriaId) => CATEGORIAS.find((c) => c.id === id)!;

const TODAS_CATS = CATEGORIAS.map((c) => c.id);

export const CARRERAS: Carrera[] = [
  { slug: "subida-el-tuito", nombre: "Subida a El Tuito", fecha: "2026-10-25T07:00:00-06:00", fechaTxt: "Dom 25 Oct 2026", dia: "25", mes: "OCT", sede: "Boca de Tomatlán → El Tuito", disciplina: "Ruta", tipo: "ruta", detalle: "Punto a punto · 38 km · +1,050 m", estado: "abierta", cupo: 180, inscritos: 132, cuota: 650, cierre: "Mié 21 Oct", cats: TODAS_CATS, temporada: 2026, fecha_n: 8 },
  { slug: "criterium-malecon", nombre: "Critérium Nocturno Malecón", fecha: "2026-11-14T19:30:00-06:00", fechaTxt: "Sáb 14 Nov 2026", dia: "14", mes: "NOV", sede: "Malecón, Centro", disciplina: "Ruta", tipo: "circuito", detalle: "Circuito 2.1 km · 20 vueltas (Elite)", estado: "abierta", cupo: 150, inscritos: 97, cuota: 550, cierre: "Mié 11 Nov", cats: TODAS_CATS, temporada: 2026, fecha_n: 9 },
  { slug: "mtb-sierra-cuale", nombre: "MTB Sierra del Cuale", fecha: "2026-11-29T08:00:00-06:00", fechaTxt: "Dom 29 Nov 2026", dia: "29", mes: "NOV", sede: "Rancho El Nogalito", disciplina: "Montaña", tipo: "circuito", detalle: "Circuito MTB 7.5 km · 4 vueltas", estado: "abierta", cupo: 120, inscritos: 54, cuota: 600, cierre: "Mié 25 Nov", cats: TODAS_CATS, temporada: 2026, fecha_n: 10 },
  { slug: "clasica-bahia", nombre: "Clásica Bahía de Banderas", fecha: "2026-12-13T07:00:00-06:00", fechaTxt: "Dom 13 Dic 2026", dia: "13", mes: "DIC", sede: "Bucerías → Punta de Mita", disciplina: "Ruta", tipo: "ruta", detalle: "Punto a punto · 42 km · +480 m", estado: "cerrada", cupo: 200, inscritos: 200, cuota: 700, cierre: "Cupo lleno", cats: TODAS_CATS, temporada: 2026, fecha_n: 11 },
  { slug: "gran-fondo-san-sebastian", nombre: "Gran Fondo San Sebastián", fecha: "2026-09-27T07:00:00-06:00", fechaTxt: "Dom 27 Sep 2026", dia: "27", mes: "SEP", sede: "La Estancia → San Sebastián del Oeste", disciplina: "Ruta", tipo: "ruta", detalle: "Punto a punto · 56 km · +1,420 m", estado: "finalizada", cupo: 180, inscritos: 168, cuota: 700, cats: TODAS_CATS, temporada: 2026, fecha_n: 7 },
  { slug: "circuito-marina", nombre: "Circuito Marina Vallarta", fecha: "2026-08-23T07:30:00-06:00", fechaTxt: "Dom 23 Ago 2026", dia: "23", mes: "AGO", sede: "Marina Vallarta", disciplina: "Ruta", tipo: "circuito", detalle: "Circuito 3.4 km · 15 vueltas", estado: "finalizada", cupo: 150, inscritos: 141, cuota: 550, cats: TODAS_CATS, temporada: 2026, fecha_n: 6 },
  { slug: "vuelta-valle", nombre: "Vuelta Valle de Banderas", fecha: "2026-07-12T07:00:00-06:00", fechaTxt: "Dom 12 Jul 2026", dia: "12", mes: "JUL", sede: "Mezcales → Valle de Banderas", disciplina: "Ruta", tipo: "ruta", detalle: "Punto a punto · 34 km · +310 m", estado: "finalizada", cupo: 180, inscritos: 155, cuota: 600, cats: TODAS_CATS, temporada: 2026, fecha_n: 5 },
  { slug: "mtb-las-palmas", nombre: "MTB Las Palmas", fecha: "2026-05-17T08:00:00-06:00", fechaTxt: "Dom 17 May 2026", dia: "17", mes: "MAY", sede: "Las Palmas de Arriba", disciplina: "Montaña", tipo: "circuito", detalle: "Circuito MTB 6.8 km · 4 vueltas", estado: "finalizada", cupo: 120, inscritos: 109, cuota: 550, cats: TODAS_CATS, temporada: 2026, fecha_n: 4 },
  { slug: "criterium-pitillal", nombre: "Critérium El Pitillal", fecha: "2026-03-22T08:00:00-06:00", fechaTxt: "Dom 22 Mar 2026", dia: "22", mes: "MAR", sede: "Plaza El Pitillal", disciplina: "Ruta", tipo: "circuito", detalle: "Circuito 1.8 km · 25 vueltas", estado: "finalizada", cupo: 150, inscritos: 128, cuota: 500, cats: TODAS_CATS, temporada: 2026, fecha_n: 3 },
  { slug: "clasica-bahia-2025", nombre: "Clásica Bahía de Banderas", fecha: "2025-12-14T07:00:00-06:00", fechaTxt: "Dom 14 Dic 2025", dia: "14", mes: "DIC", sede: "Bucerías → Punta de Mita", disciplina: "Ruta", tipo: "ruta", detalle: "Punto a punto · 42 km · +480 m", estado: "finalizada", cupo: 180, inscritos: 176, cuota: 650, cats: TODAS_CATS, temporada: 2025, fecha_n: 10 },
  { slug: "subida-el-tuito-2025", nombre: "Subida a El Tuito", fecha: "2025-10-26T07:00:00-06:00", fechaTxt: "Dom 26 Oct 2025", dia: "26", mes: "OCT", sede: "Boca de Tomatlán → El Tuito", disciplina: "Ruta", tipo: "ruta", detalle: "Punto a punto · 38 km · +1,050 m", estado: "finalizada", cupo: 160, inscritos: 149, cuota: 600, cats: TODAS_CATS, temporada: 2025, fecha_n: 9 },
];

export const ESTADOS: Record<Carrera["estado"], { label: string; corto: string; bg: string; fg: string }> = {
  abierta: { label: "Inscripción abierta", corto: "Abierta", bg: "#1E6B43", fg: "#FFFFFF" },
  cerrada: { label: "Inscripción cerrada", corto: "Cerrada", bg: "#FFE6C7", fg: "#8A3D00" },
  finalizada: { label: "Finalizada", corto: "Finalizada", bg: "#E2E6E3", fg: "#34403A" },
};

export function decorar(c: Carrera): CarreraDecorada {
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

export const carrera = (slug: string) => CARRERAS.find((c) => c.slug === slug) ?? CARRERAS[0];
export const TEMPORADAS = [2026, 2025, 2024];

const NM = ["Diego", "Luis", "Andrés", "Javier", "Emilio", "Rodrigo", "Óscar", "Mateo", "Iván", "Raúl", "Carlos", "Héctor", "Santiago", "Fernando", "Tomás", "Ricardo", "Gael", "Bruno", "Arturo", "Joel"];
const NF = ["Valeria", "Mariana", "Sofía", "Daniela", "Ximena", "Renata", "Paola", "Fernanda", "Lucía", "Andrea", "Camila", "Regina"];
const AP = ["Ramírez", "Ortega", "Peña", "Villaseñor", "Cázares", "Robles", "Medina", "Arce", "Gutiérrez", "Bañuelos", "Curiel", "Salcedo", "Lepe", "Rentería", "Flores", "Aguirre", "Topete", "Joya", "Palacios", "Ibarra"];
export const CLUBS = ["Bahía Racing", "Vallarta Bike Team", "Sierra MTB", "Pedal Pitillal", "Club Cuale", "Tuito Riders", "Nayarit Cycling", "Panteras Bike Team", "Independiente"];

// Para categorías "libre" (sin edadMin/edadMax en el flyer) se generan
// corredores de prueba con edades adultas plausibles.
const EDAD_LIBRE: Record<string, [number, number]> = {
  principiantes: [22, 45],
  femenil_intermedio: [20, 40],
  elite_femenil: [19, 32],
  elite_varonil: [19, 32],
};
const CATS_FEMENILES: CategoriaId[] = ["femenil_intermedio", "elite_femenil"];

export const CORREDORES: Corredor[] = [];
CATEGORIAS.forEach((c, ci) => {
  const r = mk(hash(c.id) + 11);
  const fem = CATS_FEMENILES.includes(c.id);
  const [edadMin, edadMax] =
    c.edadMin !== null ? [c.edadMin, c.edadMax ?? c.edadMin + 10] : EDAD_LIBRE[c.id];
  for (let i = 0; i < 14; i++) {
    const n = fem ? NF[Math.floor(r() * NF.length)] : NM[Math.floor(r() * NM.length)];
    const a1 = AP[Math.floor(r() * AP.length)];
    const a2 = AP[Math.floor(r() * AP.length)];
    const edad = edadMin + Math.floor(r() * (edadMax - edadMin + 1));
    CORREDORES.push({
      id: `${c.id}-${String(i + 1).padStart(2, "0")}`,
      nombre: `${n} ${a1}`,
      completo: `${n} ${a1} ${a2}`,
      iniciales: n[0] + a1[0],
      cat: c.id,
      club: CLUBS[Math.floor(r() * CLUBS.length)],
      edad,
      dorsal: 100 + ci * 40 + i + 1,
      foto: null,
    });
  }
});
const STAR_ID = "elite_varonil-01";
const STAR = CORREDORES.find((x) => x.id === STAR_ID)!;
STAR.nombre = "Diego Ramírez";
STAR.completo = "Diego Ramírez Ortega";
STAR.iniciales = "DR";
STAR.club = "Bahía Racing";
STAR.edad = 27;
export const corredor = (id: string) => CORREDORES.find((c) => c.id === id) ?? CORREDORES[0];

const PTS = [50, 45, 40, 36, 32, 29, 26, 23, 20, 18, 16, 14, 12, 10];
const ES_ELITE = (id: CategoriaId) => id === "elite_varonil" || id === "elite_femenil";

export function ranking(year: number, catId: CategoriaId): RankingFila[] {
  const r = mk(hash(catId + year));
  const pool = CORREDORES.filter((c) => c.cat === catId);
  const total = year === 2026 ? 7 : 10;
  const rows = pool.map((c) => ({
    c,
    pts: Math.round(
      ((year === 2026 && c.id === STAR_ID ? 318 : 0) || (300 - pool.indexOf(c) * 18 + r() * 40)) * (total / 7),
    ),
    carreras: Math.max(2, total - Math.floor(r() * 4)),
  }));
  rows.sort((a, b) => b.pts - a.pts);
  return rows.map((x, i) => {
    const t = Math.floor(r() * 7) - 3;
    const trend = i === 0 ? 1 : t === -3 ? 0 : Math.max(-2, Math.min(3, t));
    return {
      pos: i + 1,
      ...x.c,
      pts: x.pts,
      carreras: x.carreras,
      trend,
      trendTxt: trend > 0 ? `▲ ${trend}` : trend < 0 ? `▼ ${-trend}` : "—",
      trendDir: trend > 0 ? "up" : trend < 0 ? "down" : "eq",
      diff: i === 0 ? "Líder" : `−${rows[0].pts - x.pts}`,
    };
  });
}

function fmt(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  return `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}
function gap(s: number) {
  return s === 0 ? "—" : `+${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}
export const fmtTiempo = fmt;

// Velocidad promedio de referencia por categoría (km/h), solo para generar
// tiempos de prueba creíbles — no es un dato real de la liga.
const VELOCIDAD: Record<CategoriaId, number> = {
  panales: 10,
  infantil_aa: 14,
  infantil_a: 16,
  infantil_b: 18,
  infantil_c: 20,
  juvenil_a: 24,
  juvenil_b: 26,
  juvenil_c: 28,
  principiantes: 22,
  femenil_intermedio: 26,
  elite_femenil: 33,
  elite_varonil: 39,
  master_20: 36,
  master_30: 35,
  master_40: 34,
  master_50: 32,
};

export function resultados(slug: string, catId: CategoriaId): ResultadoFila[] {
  const c = carrera(slug);
  const r = mk(hash(slug + catId));
  const kmMatch = c.detalle.match(/([\d.]+) km/);
  const vueltasMatch = c.detalle.match(/(\d+) vueltas/);
  const km = parseFloat(kmMatch ? kmMatch[1] : "40") * (c.tipo === "circuito" ? parseInt(vueltasMatch ? vueltasMatch[1] : "1") : 1);
  const base = (km / VELOCIDAD[catId]) * 3600;
  const pool = CORREDORES.filter((x) => x.cat === catId)
    .map((x) => ({ x, k: r() + (x.id === STAR_ID ? -0.3 : 0) }))
    .sort((a, b) => a.k - b.k);
  let t = base;
  return pool.map((p, i) => {
    if (i) t += 3 + r() * 70;
    return { pos: i + 1, ...p.x, tiempo: fmt(t), gap: gap(t - base), pts: (PTS[i] || 8) * (ES_ELITE(catId) ? 2 : 1) };
  });
}

export function inscritos(slug: string): InscritoFila[] {
  const r = mk(hash(slug));
  const c = carrera(slug);
  return CORREDORES.filter((x) => c.cats.includes(x.cat) && r() > 0.35).map((x) => ({ ...x, pagado: r() > 0.15 }));
}

export function historial(id: string, year = 2026): HistorialFila[] {
  const rider = corredor(id);
  const r = mk(hash(id + year));
  const races = CARRERAS.filter(
    (c) => c.temporada === year && c.estado === "finalizada" && c.cats.includes(rider.cat),
  ).sort((a, b) => a.fecha.localeCompare(b.fecha));
  let rk = 3 + Math.floor(r() * 6);
  const isStar = id === STAR_ID;
  const starSeq = [2, 1, 2, 1, 1];
  return races.map((c, i) => {
    const res = resultados(c.slug, rider.cat);
    const me = res.find((x) => x.id === id)!;
    rk = isStar ? starSeq[i] ?? 1 : Math.max(1, Math.min(14, rk + Math.floor(r() * 5) - 2));
    return {
      carrera: c.nombre,
      slug: c.slug,
      fechaTxt: c.fechaTxt.replace(/^\w+ /, ""),
      tipo: c.tipo === "ruta" ? "Ruta" : "Circuito",
      pos: me.pos,
      posTxt: `${me.pos}º`,
      tiempo: me.tiempo,
      gap: me.gap,
      pts: me.pts,
      rk,
      podio: me.pos <= 3,
    };
  });
}
