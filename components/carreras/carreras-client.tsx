"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLeagueData } from "@/lib/domain/league-data-context";
import { RaceCard } from "@/components/race-card";

type Estado = "todas" | "proximas" | "pasadas";
type Tipo = "todos" | "circuito" | "ruta";

function Segment<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <div className="flex min-w-0 max-w-full items-center gap-2">
      <span className="flex-none font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">
        {label}
      </span>
      <div className="flex overflow-x-auto border-2 border-liciba-ink">
        {options.map(([v, l]) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className="min-h-10 flex-none cursor-pointer border-0 px-3.5 font-display text-[15px] font-bold uppercase tracking-wide"
            style={{ background: value === v ? "#13201B" : "#fff", color: value === v ? "#fff" : "#13201B" }}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CarrerasClient() {
  const { CARRERAS, TEMPORADAS, decorar } = useLeagueData();
  const params = useSearchParams();
  const initialEstado = (params.get("estado") as Estado) || "todas";

  const [year, setYear] = useState(2026);
  const [estado, setEstado] = useState<Estado>(initialEstado);
  const [tipo, setTipo] = useState<Tipo>("todos");

  // Vuelve a leer el filtro de la URL cuando cambia por navegación (p. ej.
  // el link "Resultados" del header), ya que esta página no se desmonta.
  useEffect(() => {
    setEstado((params.get("estado") as Estado) || "todas");
  }, [params]);

  const lista = useMemo(() => {
    return CARRERAS.map(decorar)
      .filter(
        (c) =>
          c.temporada === year &&
          (estado === "todas" || (estado === "proximas") === c.proxima) &&
          (tipo === "todos" || c.tipo === tipo),
      )
      .sort((a, b) => {
        if (a.proxima !== b.proxima) return a.proxima ? -1 : 1;
        return a.proxima ? a.fecha.localeCompare(b.fecha) : b.fecha.localeCompare(a.fecha);
      })
      .map((c) => ({
        ...c,
        cta: c.finalizada ? "Resultados" : c.abierta ? "Inscribirme" : "Ver carrera",
        pie: c.finalizada ? `${c.inscritos} corredores` : c.cerrada ? "Cupo lleno" : `${c.lugares} lugares · ${c.cuotaTxt}`,
      }));
  }, [year, estado, tipo]);

  const reset = () => {
    setYear(2026);
    setEstado("todas");
    setTipo("todos");
  };

  return (
    <>
      <section className="bg-liciba-green text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-5 pb-10 pt-12">
          <div>
            <div className="mb-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-[#CFE7D8]">
              Calendario oficial
            </div>
            <h1 className="m-0 font-sans text-[52px] italic font-extrabold uppercase leading-[0.86] md:text-[96px]">
              Carreras
            </h1>
          </div>
          <p className="m-0 max-w-[380px] text-base leading-normal text-[#E3F0E8]">
            Ruta y montaña en Puerto Vallarta, Cabo Corrientes, San Sebastián y la Riviera Nayarit. Cada fecha
            suma al ranking de la temporada.
          </p>
        </div>
      </section>

      <section className="sticky top-[70px] z-20 border-b border-liciba-border bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3">
          <Segment label="Temporada" value={String(year)} onChange={(v) => setYear(Number(v))} options={TEMPORADAS.map((y) => [String(y), String(y)])} />
          <Segment
            label="Estado"
            value={estado}
            onChange={setEstado}
            options={[
              ["todas", "Todas"],
              ["proximas", "Próximas"],
              ["pasadas", "Pasadas"],
            ]}
          />
          <Segment
            label="Tipo"
            value={tipo}
            onChange={setTipo}
            options={[
              ["todos", "Todos"],
              ["circuito", "Circuito"],
              ["ruta", "Punto a punto"],
            ]}
          />
          <span className="ml-auto font-mono text-xs font-semibold text-liciba-muted">
            {lista.length} carrera{lista.length === 1 ? "" : "s"}
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-[72px] pt-9">
        {lista.length === 0 && (
          <div className="flex flex-col items-center gap-3 border-2 border-dashed border-[#D6D3CA] px-5 py-14 text-center">
            <div className="font-sans text-[32px] italic font-extrabold uppercase">Sin carreras con estos filtros</div>
            <p className="m-0 text-liciba-muted">El calendario {year} se publica en enero. Prueba otra temporada o quita filtros.</p>
            <button
              onClick={reset}
              className="min-h-11 cursor-pointer border-2 border-liciba-ink bg-white px-[18px] font-display text-[15px] font-extrabold uppercase tracking-wide"
            >
              Quitar filtros
            </button>
          </div>
        )}

        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))" }}>
          {lista.map((r) => (
            <RaceCard key={r.slug} race={r} eyebrow={`Fecha ${r.fecha_n} · ${r.disciplina} · ${r.tipoTxt}`} footerLeft={r.pie} footerCta={r.cta} />
          ))}
        </div>
      </section>
    </>
  );
}
