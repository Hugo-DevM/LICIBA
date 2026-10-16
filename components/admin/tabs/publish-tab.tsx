import type { CarreraDecorada } from "@/lib/domain/types";
import type { ComputedRow } from "../capture-utils";

interface PublishTabProps {
  c: CarreraDecorada;
  all: ComputedRow[];
  pub: boolean;
  onPublish: () => void;
}

export function PublishTab({ c, all, pub, onPublish }: PublishTabProps) {
  const done = all.filter((r) => !r.bad).length;
  const pend = all.filter((r) => r.bad && !r.ll).length;
  const err = all.filter((r) => r.bad && r.ll).length;

  return (
    <div className="flex-1 overflow-auto bg-[#FAF9F6] p-5">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <div className="flex items-center gap-2.5 border border-liciba-border bg-white p-4">
          <span
            className="font-display text-xs font-bold uppercase tracking-wide px-2 py-1"
            style={{ background: pub ? "#1E6B43" : "#FFE6C7", color: pub ? "#fff" : "#8A3D00" }}
          >
            {pub ? "Publicado" : "Borrador"}
          </span>
          <span className="text-sm text-liciba-muted">
            {pub ? "Resultados visibles en el sitio público." : "Aún no visible para corredores."}
          </span>
        </div>

        {all.length > 0 && (
          <div className="flex flex-col gap-2 border border-liciba-border bg-white p-4">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">Estado de captura</span>
            <div className="flex items-center gap-2.5 font-mono text-sm">
              <div className="h-2 flex-1 bg-liciba-border">
                <div className="h-full bg-liciba-green" style={{ width: `${Math.round((done / all.length) * 100)}%` }} />
              </div>
              <span className="text-liciba-muted">
                {done} / {all.length}
              </span>
            </div>
            {pend + err > 0 && (
              <p className="m-0 text-sm text-[#8A3D00]">
                {pend} sin tiempo y {err} con error de formato quedarán fuera de la clasificación hasta corregirse.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 border border-liciba-border bg-white p-4">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">Al publicar</span>
          <p className="m-0 text-sm leading-relaxed text-[#2E3B35]">
            Se recalculará el ranking {c.temporada} de las {c.cats.length} categorías de esta carrera y los resultados
            quedarán visibles en <code className="font-mono text-[13px]">/carreras/{c.slug}</code>.
          </p>
        </div>

        <button
          onClick={onPublish}
          disabled={all.length === 0}
          className="min-h-12 cursor-pointer self-start border-0 bg-liciba-orange px-5 font-display text-base font-extrabold uppercase tracking-wide text-liciba-ink disabled:cursor-not-allowed disabled:bg-liciba-border disabled:text-liciba-muted"
        >
          {pub ? "Volver a publicar" : "Publicar resultados"}
        </button>
      </div>
    </div>
  );
}
