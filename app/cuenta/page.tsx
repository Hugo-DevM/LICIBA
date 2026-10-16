import type { Metadata } from "next";
import Link from "next/link";
import { getMyProfile, getMyEntries } from "@/lib/domain/profile";
import { updateMyProfile, signOutRider } from "@/lib/domain/rider-actions";
import { ProfileForm } from "@/components/cuenta/profile-form";
import { MyEntries } from "@/components/cuenta/my-entries";

export const instant = false;

export const metadata: Metadata = {
  title: "Mi cuenta · LICIBA",
};

export default async function CuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; photoError?: string }>;
}) {
  const { saved, photoError } = await searchParams;
  const [profile, entries] = await Promise.all([getMyProfile(), getMyEntries()]);

  return (
    <section className="mx-auto max-w-3xl px-5 py-10">
      <Link href="/" className="mb-3 inline-block font-mono text-xs font-semibold uppercase tracking-wide text-liciba-muted hover:text-liciba-ink">
        ← Inicio
      </Link>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 font-sans text-4xl italic font-extrabold uppercase leading-[0.9]">Mi cuenta</h1>
          <p className="mt-1.5 text-sm text-liciba-muted">
            Guarda tus datos aquí para que tu próxima inscripción se autorrellene.
          </p>
        </div>
        <form action={signOutRider}>
          <button
            type="submit"
            className="h-10 cursor-pointer whitespace-nowrap border-2 border-liciba-ink bg-white px-4 font-display text-sm font-extrabold uppercase tracking-wide"
          >
            Cerrar sesión
          </button>
        </form>
      </div>

      {saved && (
        <div className="mb-5 bg-[#E1F0E6] px-3.5 py-3 text-sm font-semibold text-[#1E6B43]">Datos guardados.</div>
      )}
      {photoError && (
        <div className="mb-5 bg-[#FDE8DC] px-3.5 py-3 text-sm font-semibold text-[#8A3D00]">{photoError}</div>
      )}

      <MyEntries entries={entries} />

      <ProfileForm action={updateMyProfile} profile={profile} />
    </section>
  );
}
