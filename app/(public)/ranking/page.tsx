import { Suspense } from "react";
import type { Metadata } from "next";
import { RankingClient } from "@/components/ranking/ranking-client";

export const metadata: Metadata = {
  title: "Ranking · LICIBA",
};

export default function RankingPage() {
  return (
    <Suspense>
      <RankingClient />
    </Suspense>
  );
}
