"use client";

import { useEffect, useState } from "react";
import { previewResultsImport, importResults, type ImportPreview, type ImportResult } from "@/lib/domain/cronometraje-actions";
import type { ResultsImportV1 } from "@/lib/domain/cronometraje-schema";

export function ImportResultsModal({ payload, onClose }: { payload: ResultsImportV1; onClose: () => void }) {
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    previewResultsImport(payload)
      .then(setPreview)
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudo leer el archivo."));
  }, [payload]);

  const onConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await importResults(payload));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo importar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-liciba-ink/55 p-5">
      <div className="flex w-full max-w-[480px] flex-col bg-white">
        <div className="flex h-1.5">
          <div className="flex-[3] bg-liciba-green" />
          <div className="flex-[2] bg-liciba-blue" />
          <div className="flex-1 bg-liciba-orange" />
        </div>
        <div className="flex flex-col gap-3 p-[22px]">
          <h2 className="m-0 font-display text-[26px] font-bold uppercase">Importar resultados</h2>

          {error && <div className="bg-[#FDE8DC] px-3 py-2.5 text-sm font-semibold text-[#8A3D00]">{error}</div>}

          {!error && !preview && !result && <p className="m-0 text-[15px] text-[#2E3B35]">Revisando el archivo...</p>}

          {preview && !preview.ok && (
            <div className="bg-[#FDE8DC] px-3 py-2.5 text-sm font-semibold text-[#8A3D00]">{preview.errors.join(" ")}</div>
          )}

          {preview?.ok && !result && (
            <div className="flex flex-col gap-2 text-[15px] leading-relaxed text-[#2E3B35]">
              <p className="m-0">
                {preview.existingMatched} corredores existentes, {preview.walkupCount} de último momento.
              </p>
              {preview.existingStale > 0 && (
                <div className="bg-[#FFE6C7] px-3 py-2.5 text-sm text-[#8A3D00]">
                  {preview.existingStale} inscripciones del archivo ya no existen en esta carrera y se omitirán.
                </div>
              )}
              {preview.overwriteCount > 0 && (
                <div className="bg-[#FFE6C7] px-3 py-2.5 text-sm text-[#8A3D00]">
                  {preview.overwriteCount} ya tenían un resultado capturado y se sobrescribirá.
                </div>
              )}
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-2 text-[15px] leading-relaxed text-[#2E3B35]">
              <p className="m-0 font-semibold text-[#1E6B43]">
                Listo: {result.updatedResults} resultados aplicados, {result.createdRiders} corredores nuevos creados.
              </p>
              {result.warnings.map((w, i) => (
                <div key={i} className="bg-[#FFE6C7] px-3 py-2.5 text-sm text-[#8A3D00]">
                  {w}
                </div>
              ))}
            </div>
          )}

          <div className="mt-1.5 flex justify-end gap-2">
            <button onClick={onClose} className="h-[42px] cursor-pointer border border-[#D6D3CA] bg-white px-4 font-sans text-sm font-semibold">
              {result ? "Cerrar" : "Cancelar"}
            </button>
            {preview?.ok && !result && (
              <button
                onClick={onConfirm}
                disabled={loading}
                className="h-[42px] cursor-pointer border-0 bg-liciba-orange px-4 font-display text-[15px] font-extrabold uppercase tracking-wide text-liciba-ink disabled:opacity-60"
              >
                {loading ? "Importando..." : "Confirmar importación"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
