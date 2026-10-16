import type { Metadata } from "next";
import { getLeagueData } from "@/lib/domain/queries";
import { createLeagueDataAccessors } from "@/lib/domain/accessors";
import { RiderProfile } from "@/components/corredor/rider-profile";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { corredor } = createLeagueDataAccessors(await getLeagueData());
  const r = corredor(id);
  return { title: `${r.completo} · LICIBA` };
}

export default async function CorredorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RiderProfile id={id} />;
}
