"use client";

import { createContext, useContext, useMemo } from "react";
import { createLeagueDataAccessors, type LeagueDataAccessors } from "./accessors";
import type { LeagueData } from "./queries";

const LeagueDataContext = createContext<LeagueDataAccessors | null>(null);

export function LeagueDataProvider({ data, children }: { data: LeagueData; children: React.ReactNode }) {
  const accessors = useMemo(() => createLeagueDataAccessors(data), [data]);
  return <LeagueDataContext.Provider value={accessors}>{children}</LeagueDataContext.Provider>;
}

export function useLeagueData(): LeagueDataAccessors {
  const ctx = useContext(LeagueDataContext);
  if (!ctx) throw new Error("useLeagueData debe usarse dentro de LeagueDataProvider");
  return ctx;
}
