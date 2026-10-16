"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/domain/require-auth";

export async function createSeason(formData: FormData) {
  await requireStaff();

  const year = Number(formData.get("year"));
  const name = String(formData.get("name") || "").trim();
  const makeActive = formData.get("is_active") === "on";

  if (!year || !name) throw new Error("Faltan campos obligatorios (año, nombre).");

  const admin = createAdminClient();

  if (makeActive) {
    const { error: deactivateError } = await admin.from("seasons").update({ is_active: false }).eq("is_active", true);
    if (deactivateError) throw new Error(deactivateError.message);
  }

  const { error } = await admin.from("seasons").insert({ year, name, is_active: makeActive });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/temporadas");
  revalidatePath("/admin/carreras/nuevo");
  redirect("/admin/temporadas");
}

export async function closeSeason(id: string) {
  await requireStaff();
  const admin = createAdminClient();
  const { error } = await admin.from("seasons").update({ is_active: false }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/temporadas");
  revalidatePath("/admin/carreras/nuevo");
  redirect("/admin/temporadas");
}

export async function activateSeason(id: string) {
  await requireStaff();
  const admin = createAdminClient();
  const { error: deactivateError } = await admin.from("seasons").update({ is_active: false }).eq("is_active", true);
  if (deactivateError) throw new Error(deactivateError.message);
  const { error } = await admin.from("seasons").update({ is_active: true }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/temporadas");
  revalidatePath("/admin/carreras/nuevo");
  redirect("/admin/temporadas");
}
