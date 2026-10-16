"use client";

import { useEffect, useState } from "react";
import { ImagePlaceholder } from "@/components/image-placeholder";

export function PhotoField({ photoUrl }: { photoUrl: string | null }) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  return (
    <div className="flex flex-wrap items-center gap-5 border border-liciba-border bg-white p-5">
      <div className="relative aspect-square w-24 flex-none overflow-hidden bg-[#DCE3DE]">
        <ImagePlaceholder label="Foto de perfil" src={preview ?? photoUrl ?? undefined} sizes="96px" className="absolute inset-0" />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">
          Foto de perfil
        </span>
        <input
          type="file"
          name="photo"
          accept="image/*"
          onChange={onFileChange}
          className="text-sm file:mr-3 file:cursor-pointer file:border-0 file:bg-liciba-ink file:px-3.5 file:py-2 file:font-display file:text-xs file:font-bold file:uppercase file:tracking-wide file:text-white"
        />
        <span className="text-xs text-liciba-muted">JPG o PNG, máximo 5 MB.</span>
      </div>
    </div>
  );
}
