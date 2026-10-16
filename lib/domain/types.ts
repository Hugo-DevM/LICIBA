export type CategoriaId =
  | "panales"
  | "infantil_aa"
  | "infantil_a"
  | "infantil_b"
  | "infantil_c"
  | "juvenil_a"
  | "juvenil_b"
  | "juvenil_c"
  | "principiantes"
  | "femenil_intermedio"
  | "elite_femenil"
  | "elite_varonil"
  | "master_20"
  | "master_30"
  | "master_40"
  | "master_50";

export interface Categoria {
  id: CategoriaId;
  nombre: string;
  corto: string;
  color: string;
  edadMin: number | null;
  edadMax: number | null;
  dorsalLetra: string;
}

export type EstadoCarrera = "abierta" | "cerrada" | "finalizada";
export type TipoCarrera = "ruta" | "circuito";

export interface Carrera {
  slug: string;
  nombre: string;
  fecha: string;
  fechaTxt: string;
  dia: string;
  mes: string;
  sede: string;
  disciplina: string;
  tipo: TipoCarrera;
  detalle: string;
  estado: EstadoCarrera;
  cupo: number;
  inscritos: number;
  cuota: number;
  cierre?: string;
  cats: CategoriaId[];
  temporada: number;
  fecha_n: number;
}

export interface Badge {
  label: string;
  corto: string;
  bg: string;
  fg: string;
}

export interface CarreraDecorada extends Carrera {
  badge: Badge;
  tipoTxt: string;
  catsB: Categoria[];
  catsCortas: Categoria[];
  catsMas: string;
  pct: string;
  cupoTxt: string;
  lugares: number;
  abierta: boolean;
  cerrada: boolean;
  finalizada: boolean;
  proxima: boolean;
  href: string;
  inscHref: string;
  cuotaTxt: string;
  fechaLarga: string;
}

export interface Corredor {
  id: string;
  nombre: string;
  completo: string;
  iniciales: string;
  cat: CategoriaId;
  club: string;
  edad: number;
  dorsal: number;
  foto: string | null;
}

export interface ResultadoFila extends Corredor {
  pos: number;
  tiempo: string;
  gap: string;
  pts: number;
}

export interface RankingFila extends Corredor {
  pos: number;
  pts: number;
  carreras: number;
  trend: number;
  trendTxt: string;
  trendDir: "up" | "down" | "eq";
  diff: string;
}

export interface InscritoFila extends Corredor {
  pagado: boolean;
}

export interface HistorialFila {
  carrera: string;
  slug: string;
  fechaTxt: string;
  tipo: string;
  pos: number;
  posTxt: string;
  tiempo: string;
  gap: string;
  pts: number;
  rk: number;
  podio: boolean;
}
