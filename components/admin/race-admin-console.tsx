"use client";

import { useMemo, useRef, useState } from "react";
import { useLeagueData } from "@/lib/domain/league-data-context";
import { AdminShell } from "./admin-shell";
import { InfoTab } from "./tabs/info-tab";
import { EntrantsTab } from "./tabs/entrants-tab";
import { CaptureTab } from "./tabs/capture-tab";
import { PublishTab } from "./tabs/publish-tab";
import { buildBase, computeAll, type Edit } from "./capture-utils";
import { ImportResultsModal } from "./import-results-modal";
import { exportStartlist, publishRace } from "@/lib/domain/cronometraje-actions";
import type { ResultsImportV1 } from "@/lib/domain/cronometraje-schema";

const TABS = [
  { id: "info", label: "Información" },
  { id: "inscritos", label: "Inscritos" },
  { id: "captura", label: "Captura de tiempos" },
  { id: "publicacion", label: "Publicación" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function RaceAdminConsole({ slug }: { slug: string }) {
  const accessors = useLeagueData();
  const { c, base } = useMemo(() => buildBase(slug, accessors), [slug, accessors]);
  const [tab, setTab] = useState<TabId>("captura");
  const [ed, setEd] = useState<Record<number, Edit>>({});
  const [modal, setModal] = useState(false);
  const [pub, setPub] = useState(c.finalizada);
  const [publishing, setPublishing] = useState(false);
  const [importPayload, setImportPayload] = useState<ResultsImportV1 | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const all = useMemo(() => computeAll(base, ed), [base, ed]);
  const pend = all.filter((r) => r.bad && !r.ll).length;
  const err = all.filter((r) => r.bad && r.ll).length;

  const onEdit = (dorsal: number, key: keyof Edit, value: string) => {
    setEd((s) => ({ ...s, [dorsal]: { ...(s[dorsal] || {}), [key]: value } }));
    setPub(false);
  };

  const onExportStartlist = async () => {
    const data = await exportStartlist(c.slug);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${c.slug}-startlist.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const json = JSON.parse(await file.text());
      if (json?.version !== 1) throw new Error("Versión de archivo no soportada.");
      setImportPayload(json as ResultsImportV1);
    } catch {
      alert("El archivo no es un JSON de resultados válido.");
    }
  };

  const onPublishConfirm = async () => {
    setModal(false);
    setPublishing(true);
    try {
      await publishRace(c.slug);
      setPub(true);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <AdminShell>
      <header className="flex flex-col gap-3 border-b border-liciba-border bg-white px-5 pt-3.5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
          <div className="min-w-0 flex-1 basis-[300px]">
            <div className="mb-1.5 font-mono text-xs text-liciba-muted">2026 / Carreras / Fecha {c.fecha_n}</div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="m-0 font-display text-[26px] font-bold uppercase">{c.nombre}</h1>
              <span
                className="font-display text-xs font-bold uppercase tracking-wide px-1.5 py-1"
                style={{ background: pub ? "#1E6B43" : "#FFE6C7", color: pub ? "#fff" : "#8A3D00" }}
              >
                {pub ? "Publicado" : "Borrador"}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onExportStartlist}
              className="h-[38px] cursor-pointer whitespace-nowrap border border-[#D6D3CA] bg-white px-3.5 font-sans text-[13px] font-semibold"
            >
              Exportar corredores
            </button>
            <input ref={fileInputRef} type="file" accept="application/json" onChange={onFileSelected} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-[38px] cursor-pointer whitespace-nowrap border border-[#D6D3CA] bg-white px-3.5 font-sans text-[13px] font-semibold"
            >
              Importar resultados
            </button>
            <button
              onClick={() => setModal(true)}
              disabled={publishing}
              className="h-[38px] cursor-pointer whitespace-nowrap border-0 bg-liciba-orange px-4 font-display text-[15px] font-extrabold uppercase tracking-wide text-liciba-ink disabled:opacity-60"
            >
              {publishing ? "Publicando..." : "Publicar resultados"}
            </button>
          </div>
        </div>
        <div className="flex gap-0.5 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-none cursor-pointer border-0 bg-transparent px-3 py-2.5 font-display text-sm font-bold uppercase tracking-wide"
              style={{ color: tab === t.id ? "#13201B" : "#8A968F", boxShadow: `inset 0 -3px 0 ${tab === t.id ? "#F2661C" : "transparent"}` }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {tab === "info" && <InfoTab c={c} />}
      {tab === "inscritos" && <EntrantsTab c={c} />}
      {tab === "captura" && <CaptureTab c={c} all={all} onEdit={onEdit} />}
      {tab === "publicacion" && <PublishTab c={c} all={all} pub={pub} onPublish={() => setModal(true)} />}

      {modal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-liciba-ink/55 p-5">
          <div className="flex w-full max-w-[440px] flex-col bg-white">
            <div className="flex h-1.5">
              <div className="flex-[3] bg-liciba-green" />
              <div className="flex-[2] bg-liciba-blue" />
              <div className="flex-1 bg-liciba-orange" />
            </div>
            <div className="flex flex-col gap-3 p-[22px]">
              <h2 className="m-0 font-display text-[26px] font-bold uppercase">¿Publicar resultados?</h2>
              <p className="m-0 text-[15px] leading-relaxed text-[#2E3B35]">
                Se publicarán en el sitio y se recalculará el ranking {c.temporada} de {c.cats.length} categorías.
              </p>
              {pend + err > 0 && (
                <div className="bg-[#FFE6C7] px-3 py-2.5 text-sm leading-snug text-[#8A3D00]">
                  {pend} corredores sin tiempo y {err} con formato inválido quedarán fuera de la clasificación hasta
                  corregirlos.
                </div>
              )}
              <div className="mt-1.5 flex justify-end gap-2">
                <button
                  onClick={() => setModal(false)}
                  className="h-[42px] cursor-pointer border border-[#D6D3CA] bg-white px-4 font-sans text-sm font-semibold"
                >
                  Seguir capturando
                </button>
                <button
                  onClick={onPublishConfirm}
                  className="h-[42px] cursor-pointer border-0 bg-liciba-orange px-4 font-display text-[15px] font-extrabold uppercase tracking-wide text-liciba-ink"
                >
                  Publicar ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {importPayload && <ImportResultsModal payload={importPayload} onClose={() => setImportPayload(null)} />}
    </AdminShell>
  );
}
