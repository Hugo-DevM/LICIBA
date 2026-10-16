import type { Metadata } from "next";
import { getLeagueData } from "@/lib/domain/queries";
import { createLeagueDataAccessors } from "@/lib/domain/accessors";
import { Hero } from "@/components/home/hero";
import { NextRaceBanner } from "@/components/home/next-race-banner";
import { UpcomingRaces } from "@/components/home/upcoming-races";
import { RecentResults, type Podio } from "@/components/home/recent-results";
import { RankingPanel } from "@/components/home/ranking-panel";
import { AboutLeague } from "@/components/home/about-league";

export const instant = false;

export const metadata: Metadata = {
  title: "LICIBA · Liga de Ciclismo Puerto Vallarta",
};

const MEDAL = ["#FFB21E", "#D5DCD8", "#E0915A"];

export default async function HomePage() {
  const data = await getLeagueData();
  const { CARRERAS, cat, decorar, resultados } = createLeagueDataAccessors(data);
  const all = CARRERAS.map(decorar);

  const proximas = all
    .filter((c) => c.proxima)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  const next = proximas[0];

  const ult = all
    .filter((c) => c.finalizada)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))[0];

  const podios: Podio[] = ult
    ? ult.cats.map((id) => ({
        cat: cat(id),
        top: resultados(ult.slug, id)
          .slice(0, 3)
          .map((t, i) => ({ ...t, medal: MEDAL[i] })),
      }))
    : [];

  return (
    <>
      <Hero />
      {next && <NextRaceBanner next={next} />}
      <UpcomingRaces races={proximas.slice(0, 4)} />
      {ult && <RecentResults ult={ult} podios={podios} />}
      <RankingPanel />
      <AboutLeague />
    </>
  );
}
