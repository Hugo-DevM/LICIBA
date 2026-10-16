import type { LeagueDataAccessors } from "@/lib/domain/accessors";
import type { CarreraDecorada, CategoriaId } from "@/lib/domain/types";

export const PTS = [50, 45, 40, 36, 32, 29, 26, 23, 20, 18, 16, 14, 12, 10];
const DEMO_SLUG = "gran-fondo-san-sebastian";

export interface BaseRow {
  dorsal: number;
  completo: string;
  cat: CategoriaId;
  sal: number;
  ll: string;
  estado: string;
}

export interface Edit {
  ll?: string;
  estado?: string;
}

export function parseTime(s: string): number | null {
  const str = (s || "").trim();
  if (!str) return null;
  const parts = str.includes(":") ? str.split(":") : str.length >= 5 ? [str.slice(0, -4), str.slice(-4, -2), str.slice(-2)] : null;
  if (!parts || parts.length !== 3) return NaN;
  const [h, m, x] = parts.map(Number);
  if ([h, m, x].some((n) => isNaN(n)) || m > 59 || x > 59 || parts[1].length !== 2 || parts[2].length !== 2) return NaN;
  return h * 3600 + m * 60 + x;
}

/**
 * Para carreras finalizadas se parte de resultados() ya "corridos".
 * Para carreras próximas/abiertas se parte de la lista de inscritos con
 * llegada vacía: el staff la va llenando el día de la carrera.
 */
export function buildBase(slug: string, accessors: LeagueDataAccessors): { c: CarreraDecorada; base: BaseRow[] } {
  const { carrera, decorar, fmtTiempo, inscritos, resultados } = accessors;
  const raw = carrera(slug);
  const c = decorar(raw);
  const base: BaseRow[] = [];

  if (raw.estado === "finalizada") {
    raw.cats.forEach((k, ci) => {
      resultados(slug, k).forEach((r) => {
        const sal = 7 * 3600 + ci * 180;
        const t = r.tiempo.split(":").map(Number);
        const ts = t[0] * 3600 + t[1] * 60 + t[2];
        base.push({ dorsal: r.dorsal, completo: r.completo, cat: k, sal, ll: fmtTiempo(sal + ts), estado: "OK" });
      });
    });
    base.sort((a, b) => a.dorsal - b.dorsal);
    if (slug === DEMO_SLUG) {
      [5, 17, 29, 44, 61, 77, 90, 103].forEach((i) => {
        if (base[i]) base[i].ll = "";
      });
      if (base[52]) {
        base[52].estado = "DNF";
        base[52].ll = "";
      }
      if (base[38]) base[38].ll = "8:7:4";
    }
  } else {
    inscritos(slug).forEach((r) => {
      const ci = raw.cats.indexOf(r.cat);
      const sal = 7 * 3600 + Math.max(0, ci) * 180;
      base.push({ dorsal: r.dorsal, completo: r.completo, cat: r.cat, sal, ll: "", estado: "OK" });
    });
    base.sort((a, b) => a.dorsal - b.dorsal);
  }

  return { c, base };
}

export interface ComputedRow extends BaseRow {
  secs: number | null;
  bad: boolean;
}

export function computeAll(base: BaseRow[], ed: Record<number, Edit>): ComputedRow[] {
  return base.map((r) => {
    const e = ed[r.dorsal] || {};
    const ll = e.ll ?? r.ll;
    const estado = e.estado ?? r.estado;
    const s = parseTime(ll);
    const bad = estado === "OK" && (s === null || isNaN(s) || s <= r.sal);
    return { ...r, ll, estado, secs: s, bad };
  });
}

export function computePositions(all: ComputedRow[]): Record<number, number> {
  const byCat: Record<string, ComputedRow[]> = {};
  all.filter((r) => r.estado === "OK" && !r.bad).forEach((r) => {
    (byCat[r.cat] ??= []).push(r);
  });
  const posMap: Record<number, number> = {};
  Object.values(byCat).forEach((list) => {
    list
      .slice()
      .sort((a, b) => (a.secs ?? 0) - (b.secs ?? 0))
      .forEach((r, i) => (posMap[r.dorsal] = i + 1));
  });
  return posMap;
}
