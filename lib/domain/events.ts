import { cache } from "react";
import { supabasePublic } from "@/lib/supabase/public";
import { createAdminClient } from "@/lib/supabase/admin";
import { fechaParts } from "./queries";

export interface Evento {
  id: string;
  slug: string;
  title: string;
  fecha: string;
  fechaTxt: string;
  dia: string;
  mes: string;
  venue: string;
  description: string;
  coverImage: string | null;
  status: "draft" | "published";
}

interface EventRow {
  id: string;
  slug: string;
  title: string;
  event_date: string;
  venue: string;
  description: string;
  cover_image: string | null;
  status: "draft" | "published";
}

function toEvento(row: EventRow): Evento {
  const d = new Date(row.event_date);
  const { dia, mes, fechaTxt } = fechaParts(d);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    fecha: d.toISOString(),
    fechaTxt,
    dia,
    mes,
    venue: row.venue,
    description: row.description,
    coverImage: row.cover_image,
    status: row.status,
  };
}

const COLUMNS = "id, slug, title, event_date, venue, description, cover_image, status";

export const getEventsPublic = cache(async (): Promise<Evento[]> => {
  const { data, error } = await supabasePublic
    .from("events")
    .select(COLUMNS)
    .eq("status", "published")
    .order("event_date");
  if (error) throw new Error(error.message);
  return (data ?? []).map(toEvento);
});

export const getEventPublicBySlug = cache(async (slug: string): Promise<Evento | null> => {
  const { data, error } = await supabasePublic
    .from("events")
    .select(COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toEvento(data) : null;
});

export const getEventsAdmin = cache(async (): Promise<Evento[]> => {
  const admin = createAdminClient();
  const { data, error } = await admin.from("events").select(COLUMNS).order("event_date");
  if (error) throw new Error(error.message);
  return (data ?? []).map(toEvento);
});

export const getEventAdminBySlug = cache(async (slug: string): Promise<Evento | null> => {
  const admin = createAdminClient();
  const { data, error } = await admin.from("events").select(COLUMNS).eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toEvento(data) : null;
});

// Valor para <input type="datetime-local">, en hora de Puerto Vallarta.
export function toDatetimeLocalValue(iso: string) {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
