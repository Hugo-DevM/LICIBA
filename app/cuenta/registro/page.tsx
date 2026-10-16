import type { Metadata } from "next";
import Link from "next/link";
import { signUpRider } from "@/lib/domain/rider-actions";

export const instant = false;

export const metadata: Metadata = {
  title: "Crear cuenta · LICIBA",
};

export default async function CuentaRegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center gap-6 px-5 py-16">
      <Link href="/" className="-mb-2 inline-flex w-fit items-center font-mono text-xs font-semibold uppercase tracking-wide text-liciba-muted hover:text-liciba-ink">
        ← Inicio
      </Link>

      <div>
        <h1 className="m-0 font-sans text-4xl italic font-extrabold uppercase leading-[0.9]">Crea tu cuenta</h1>
        <p className="mt-2 text-sm text-liciba-muted">
          Guarda tus datos una vez y autorrellena tu próxima inscripción.
        </p>
      </div>

      <form action={signUpRider} className="flex flex-col gap-4 border border-liciba-border bg-white p-6">
        {error && <div className="bg-[#FDE8DC] px-3 py-2.5 text-sm font-semibold text-[#8A3D00]">{error}</div>}
        <input type="hidden" name="next" value={next ?? "/cuenta"} />

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">Nombre(s)</span>
            <input name="nombre" required className="min-h-12 w-full border-2 border-[#D6D3CA] bg-white px-3 font-sans text-base font-medium text-liciba-ink" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">Apellidos</span>
            <input name="apellidos" required className="min-h-12 w-full border-2 border-[#D6D3CA] bg-white px-3 font-sans text-base font-medium text-liciba-ink" />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">Correo</span>
          <input
            type="email"
            name="email"
            required
            className="min-h-12 w-full border-2 border-[#D6D3CA] bg-white px-3.5 font-sans text-base font-medium text-liciba-ink"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">Contraseña</span>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            className="min-h-12 w-full border-2 border-[#D6D3CA] bg-white px-3.5 font-sans text-base font-medium text-liciba-ink"
          />
          <span className="text-xs text-liciba-muted">Mínimo 8 caracteres.</span>
        </label>

        <button
          type="submit"
          className="mt-2 min-h-12 cursor-pointer border-0 bg-liciba-orange px-5 font-display text-base font-extrabold uppercase tracking-wide text-liciba-ink"
        >
          Crear cuenta
        </button>
      </form>

      <p className="m-0 text-sm text-liciba-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href={`/cuenta/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-liciba-ink">
          Inicia sesión
        </Link>
      </p>
    </section>
  );
}
