// Formato de intercambio con la app de cronometraje local (proyecto
// separado, C:\Users\DELL\Desktop\liciba-cronometraje). Espejo exacto en
// ese repo: src/types/liciba-schema.ts. Spec legible: docs/cronometraje-json-schema.md.
// Cambiar aquí SIEMPRE implica cambiar el otro lado y subir la versión.

export interface StartlistExportV1 {
  version: 1;
  race: { id: string; slug: string; name: string; seasonId: string; type: "ruta" | "circuito"; laps: number | null };
  categories: { code: string; name: string; bibPrefix: string }[];
  entrants: {
    entryId: string;
    riderId: string;
    fullName: string;
    club: string | null;
    gender: "M" | "F" | "X" | null;
    categoryCode: string;
    scoredCategoryCodes: string[];
    bib: number | null;
    bibsByCategory: Record<string, number>;
    paid: boolean;
    status: string;
  }[];
  exportedAt: string;
}

export type ResultStatus = "OK" | "DNF" | "DNS" | "DSQ";

export interface ResultPerCategory {
  categoryCode: string;
  status: ResultStatus;
  netTimeMs: number | null;
}

export interface ExistingResultEntry {
  kind: "existing";
  entryId: string;
  perCategory: ResultPerCategory[];
}

export interface WalkupResultEntry {
  kind: "walkup";
  provisionalBib: number;
  rider: {
    fullName: string;
    firstName: string;
    lastName: string;
    club: string | null;
    gender: "M" | "F" | "X";
  };
  categoryCode: string;
  scoredCategoryCodes: string[];
  paymentAmountMxn: number;
  perCategory: ResultPerCategory[];
}

export interface ResultsImportV1 {
  version: 1;
  race: { id: string; slug: string };
  results: (ExistingResultEntry | WalkupResultEntry)[];
  exportedAt: string;
}
