import type { Metadata } from "next";
import { connection } from "next/server";
import { Barlow, Barlow_Condensed, IBM_Plex_Mono } from "next/font/google";
import { getLeagueData } from "@/lib/domain/queries";
import { LeagueDataProvider } from "@/lib/domain/league-data-context";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  style: ["normal", "italic"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const instant = false;

export const metadata: Metadata = {
  title: "LICIBA · Liga de Ciclismo Puerto Vallarta",
  description:
    "Ruta y montaña entre la Sierra Madre y el Pacífico. Once fechas al año, ocho categorías y un solo ranking para toda la bahía.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();
  const data = await getLeagueData();
  return (
    <html
      lang="es"
      className={`${barlow.variable} ${barlowCondensed.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-clip font-sans">
        <LeagueDataProvider data={data}>{children}</LeagueDataProvider>
      </body>
    </html>
  );
}
