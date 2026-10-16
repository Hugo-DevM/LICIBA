"use client";

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-end gap-3 border-t border-liciba-border-soft bg-[#FAF9F6] px-3.5 py-2.5">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="h-[30px] cursor-pointer whitespace-nowrap border border-[#D6D3CA] bg-white px-2.5 font-sans text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Anterior
      </button>
      <span className="font-mono text-xs text-liciba-muted">
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="h-[30px] cursor-pointer whitespace-nowrap border border-[#D6D3CA] bg-white px-2.5 font-sans text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
      >
        Siguiente →
      </button>
    </div>
  );
}
