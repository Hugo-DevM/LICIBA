import Image from "next/image";

interface ImagePlaceholderProps {
  label: string;
  className?: string;
  dark?: boolean;
  src?: string;
  sizes?: string;
  priority?: boolean;
}

export function ImagePlaceholder({ label, className = "", dark = false, src, sizes, priority }: ImagePlaceholderProps) {
  if (src) {
    // URLs externas (p. ej. pegadas por el admin en un evento) no pasan por
    // el optimizador de next/image porque su dominio no está en la allowlist.
    // blob: son previsualizaciones locales (URL.createObjectURL) antes de subir.
    const isExternal = /^(https?:|blob:)/.test(src);
    return (
      <div className={`overflow-hidden ${className}`}>
        {isExternal ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={label} className="h-full w-full object-cover" loading={priority ? "eager" : "lazy"} />
        ) : (
          <Image src={src} alt={label} fill sizes={sizes ?? "100vw"} priority={priority} className="object-cover" />
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-end overflow-hidden ${
        dark ? "bg-[#1C2D26]" : "bg-[#DCE3DE]"
      } ${className}`}
      style={{
        backgroundImage: dark
          ? "repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 14px)"
          : "repeating-linear-gradient(135deg, rgba(19,32,27,0.05) 0 2px, transparent 2px 14px)",
      }}
    >
      <span
        className={`m-3 font-mono text-[11px] uppercase tracking-wide ${
          dark ? "text-liciba-muted-dark" : "text-liciba-muted"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
