import type { Metadata } from "next";
import Link from "next/link";
import { signIn } from "@/lib/domain/auth-actions";

export const instant = false;

export const metadata: Metadata = {
  title: "Iniciar sesión · LICIBA",
};

export default async function CuentaLoginPage({
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
        <h1 className="m-0 font-sans text-4xl italic font-extrabold uppercase leading-[0.9]">Mi cuenta</h1>
        <p className="mt-2 text-sm text-liciba-muted">Inicia sesión para inscribirte sin rellenar tus datos cada vez.</p>
      </div>

      <form action={signIn} className="flex flex-col gap-4 border border-liciba-border bg-white p-6">
        {error && <div className="bg-[#FDE8DC] px-3 py-2.5 text-sm font-semibold text-[#8A3D00]">{error}</div>}
        <input type="hidden" name="next" value={next ?? "/cuenta"} />

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">Correo</span>
          <input
            type="email"
            name="email"
            required
            autoFocus
            className="min-h-12 w-full border-2 border-[#D6D3CA] bg-white px-3.5 font-sans text-base font-medium text-liciba-ink"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted">Contraseña</span>
          <input
            type="password"
            name="password"
            required
            className="min-h-12 w-full border-2 border-[#D6D3CA] bg-white px-3.5 font-sans text-base font-medium text-liciba-ink"
          />
        </label>

        <button
          type="submit"
          className="mt-2 min-h-12 cursor-pointer border-0 bg-liciba-orange px-5 font-display text-base font-extrabold uppercase tracking-wide text-liciba-ink"
        >
          Entrar
        </button>
      </form>

      <p className="m-0 text-sm text-liciba-muted">
        ¿Primera vez?{" "}
        <Link href={`/cuenta/registro${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-liciba-ink">
          Crea tu cuenta
        </Link>
      </p>
    </section>
  );
}
