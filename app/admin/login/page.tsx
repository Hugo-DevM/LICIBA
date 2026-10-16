import type { Metadata } from "next";
import { signIn } from "@/lib/domain/auth-actions";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Acceso staff · LICIBA",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-liciba-ink px-5">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex justify-center">
          <Logo tone="dark" height={56} />
        </div>
        <form action={signIn} className="flex flex-col gap-4 border border-white/10 bg-[#1C2D26] p-7">
          <div>
            <h1 className="m-0 font-display text-xl font-bold uppercase tracking-wide text-white">Acceso staff</h1>
            <p className="mt-1 text-sm text-liciba-muted-dark">Panel administrativo de LICIBA.</p>
          </div>

          {error && (
            <div className="bg-[#FDE8DC] px-3 py-2.5 text-sm font-semibold text-[#8A3D00]">{error}</div>
          )}

          <input type="hidden" name="next" value={next ?? "/admin"} />

          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted-dark">
              Correo
            </span>
            <input
              type="email"
              name="email"
              required
              autoFocus
              className="min-h-12 w-full border-2 border-white/15 bg-[#13201B] px-3.5 font-sans text-base font-medium text-white outline-none focus:border-liciba-orange"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-liciba-muted-dark">
              Contraseña
            </span>
            <input
              type="password"
              name="password"
              required
              className="min-h-12 w-full border-2 border-white/15 bg-[#13201B] px-3.5 font-sans text-base font-medium text-white outline-none focus:border-liciba-orange"
            />
          </label>

          <button
            type="submit"
            className="mt-2 min-h-12 cursor-pointer border-0 bg-liciba-orange px-5 font-display text-base font-extrabold uppercase tracking-wide text-liciba-ink"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
