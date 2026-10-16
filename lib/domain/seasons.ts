import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

export interface Season {
  id: string;
  year: number;
  name: string;
  isActive: boolean;
}

export const getSeasonsAdmin = cache(async (): Promise<Season[]> => {
  const admin = createAdminClient();
  const { data, error } = await admin.from("seasons").select("id, year, name, is_active").order("year", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((s) => ({ id: s.id, year: s.year, name: s.name, isActive: s.is_active }));
});
