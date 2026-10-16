import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLeagueData } from "@/lib/domain/queries";
import { createLeagueDataAccessors } from "@/lib/domain/accessors";
import { RaceAdminConsole } from "@/components/admin/race-admin-console";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { carrera } = createLeagueDataAccessors(await getLeagueData());
  const c = carrera(slug);
  return { title: `${c.nombre} · Panel staff · LICIBA`, robots: { index: false, follow: false } };
}

export default async function AdminCarreraPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { carrera } = createLeagueDataAccessors(await getLeagueData());
  const raw = carrera(slug);
  if (raw.slug !== slug) notFound();
  return <RaceAdminConsole slug={slug} />;
}
