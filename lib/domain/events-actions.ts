"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/domain/require-auth";

const COMBINING_MARKS = new RegExp("[̀-ͯ]", "g");

function slugify(title: string) {
  return title
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Los eventos son de la liga en Puerto Vallarta: se asume siempre horario
// del centro de México (UTC-6, sin horario de verano desde 2022).
function toTimestamptz(datetimeLocal: string) {
  const withSeconds = datetimeLocal.length === 16 ? `${datetimeLocal}:00` : datetimeLocal;
  return `${withSeconds}-06:00`;
}

interface EventInput {
  title: string;
  event_date: string;
  venue: string;
  description: string;
  cover_image: string;
  status: string;
}

function readInput(formData: FormData): EventInput {
  return {
    title: String(formData.get("title") || "").trim(),
    event_date: String(formData.get("event_date") || "").trim(),
    venue: String(formData.get("venue") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    cover_image: String(formData.get("cover_image") || "").trim(),
    status: formData.get("status") === "published" ? "published" : "draft",
  };
}

export async function createEvent(formData: FormData) {
  await requireStaff();
  const input = readInput(formData);
  if (!input.title || !input.event_date || !input.venue) {
    throw new Error("Faltan campos obligatorios (título, fecha, sede).");
  }

  const admin = createAdminClient();
  const base = slugify(input.title) || "evento";
  const { data: existing } = await admin.from("events").select("slug").like("slug", `${base}%`);
  const taken = new Set((existing ?? []).map((e) => e.slug));
  let slug = base;
  let n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;

  const { error } = await admin.from("events").insert({
    slug,
    title: input.title,
    event_date: toTimestamptz(input.event_date),
    venue: input.venue,
    description: input.description,
    cover_image: input.cover_image || null,
    status: input.status,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/eventos");
  revalidatePath("/admin/eventos");
  redirect("/admin/eventos");
}

export async function updateEvent(slug: string, formData: FormData) {
  await requireStaff();
  const input = readInput(formData);
  if (!input.title || !input.event_date || !input.venue) {
    throw new Error("Faltan campos obligatorios (título, fecha, sede).");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("events")
    .update({
      title: input.title,
      event_date: toTimestamptz(input.event_date),
      venue: input.venue,
      description: input.description,
      cover_image: input.cover_image || null,
      status: input.status,
    })
    .eq("slug", slug);
  if (error) throw new Error(error.message);

  revalidatePath("/eventos");
  revalidatePath(`/eventos/${slug}`);
  revalidatePath("/admin/eventos");
  redirect("/admin/eventos");
}

export async function deleteEvent(slug: string) {
  await requireStaff();
  const admin = createAdminClient();
  const { error } = await admin.from("events").delete().eq("slug", slug);
  if (error) throw new Error(error.message);

  revalidatePath("/eventos");
  revalidatePath("/admin/eventos");
  redirect("/admin/eventos");
}
