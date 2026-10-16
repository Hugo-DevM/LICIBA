import type { CarreraDecorada, Categoria } from "./types";

export interface RaceTile {
  k: string;
  v: string;
  s: string;
}

export interface CategoriaSalida extends Categoria {
  salida: string;
}

export interface CuotaLinea {
  k: string;
  v: string;
  s: string;
}

export interface RaceInfo {
  tiles: RaceTile[];
  catsSalida: CategoriaSalida[];
  cuotas: CuotaLinea[];
}

export function buildRaceInfo(c: CarreraDecorada): RaceInfo {
  const km = (c.detalle.match(/([\d.]+) km/) || [])[1];
  const vu = (c.detalle.match(/(\d+) vueltas/) || [])[1];
  const des = (c.detalle.match(/\+([\d,]+) m/) || [])[1];
  const raceDate = new Date(c.fecha);
  const hora = raceDate.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", timeZone: "America/Mexico_City" });
  const hora24 = raceDate.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "America/Mexico_City",
  });
  const [A, B] = c.sede.split(" → ");

  const tiles: RaceTile[] =
    c.tipo === "ruta"
      ? [
          { k: "Tipo", v: "Punto a punto", s: B ? `${A} → ${B}` : c.sede },
          { k: "Distancia", v: `${km} km`, s: des ? `+${des} m de desnivel` : "Perfil plano" },
          { k: "Salida", v: `${hora} h`, s: "Elite primero, resto cada 3 min" },
          { k: "Cierre", v: c.finalizada ? "Cerrado" : c.cierre ?? "—", s: c.finalizada ? "Inscripción concluida" : "o al llenar cupo" },
        ]
      : [
          { k: "Tipo", v: "Circuito", s: `${km} km por vuelta` },
          { k: "Vueltas", v: vu ?? "—", s: "Elite · otras categorías −25%" },
          { k: "Salida", v: `${hora} h`, s: "Mangas por categoría" },
          { k: "Cierre", v: c.finalizada ? "Cerrado" : c.cierre ?? "—", s: c.finalizada ? "Inscripción concluida" : "o al llenar cupo" },
        ];

  const [hh, mm] = hora24.split(":").map(Number);
  const catsSalida: CategoriaSalida[] = c.catsB.map((k, i) => {
    const t = hh * 60 + mm + i * 3;
    return { ...k, salida: `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}` };
  });

  const cuotas: CuotaLinea[] = [
    { k: "General", s: "Todas las categorías", v: `$${c.cuota}` },
    { k: "Juvenil 15–18", s: "Con identificación escolar", v: `$${c.cuota - 250}` },
    { k: "Correr también Elite", s: "Doble puntuación, misma salida", v: "+$200" },
    { k: "Licencia anual de la liga", s: "Solo primera carrera del año", v: "$350" },
  ];

  return { tiles, catsSalida, cuotas };
}
