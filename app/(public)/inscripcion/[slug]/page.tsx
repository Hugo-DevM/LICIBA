import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLeagueData } from "@/lib/domain/queries";
import { createLeagueDataAccessors } from "@/lib/domain/accessors";
import { getMyProfile } from "@/lib/domain/profile";
import { getOptionalUser } from "@/lib/domain/require-auth";
import { InscripcionWizard } from "@/components/inscripcion/inscripcion-wizard";

// Sin generateStaticParams: esta página siempre necesita sesión y datos en
// vivo (el formulario llama a un Server Action que depende de las cookies
// de la petición real). Un shell estático para el slug rompía esa lectura.
export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { carrera } = createLeagueDataAccessors(await getLeagueData());
  const c = carrera(slug);
  return { title: `Inscripción · ${c.nombre} · LICIBA` };
}

export default async function InscripcionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getLeagueData();
  const open = data.races.filter((x) => x.estado === "abierta");
  const valid = open.find((c) => c.slug === slug);
  if (!valid) {
    if (open.length === 0) {
      return (
        <section className="mx-auto max-w-[640px] px-5 py-20 text-center">
          <h1 className="m-0 font-sans text-4xl italic font-extrabold uppercase">Sin inscripciones abiertas</h1>
          <p className="mt-3 text-liciba-muted">En este momento no hay ninguna carrera con inscripción abierta.</p>
        </section>
      );
    }
    redirect(`/inscripcion/${open[0].slug}`);
  }

  const [profile, user] = await Promise.all([getMyProfile(), getOptionalUser()]);
  return <InscripcionWizard raceSlug={slug} initialProfile={profile} isLoggedIn={!!user} />;
}
