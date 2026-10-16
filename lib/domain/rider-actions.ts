"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/domain/require-auth";
import { uploadImage } from "@/lib/cloudinary";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

function initialsOf(nombre: string, apellidos: string) {
  return `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
}

export async function signUpRider(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const nombre = String(formData.get("nombre") || "").trim();
  const apellidos = String(formData.get("apellidos") || "").trim();
  const next = String(formData.get("next") || "/cuenta");
  const fail = (msg: string) =>
    redirect(`/cuenta/registro?error=${encodeURIComponent(msg)}&next=${encodeURIComponent(next)}`);

  if (!email || !password || !nombre || !apellidos) fail("Completa todos los campos.");
  if (password.length < 8) fail("La contraseña debe tener al menos 8 caracteres.");

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError) {
    fail(createError.message.includes("already been registered") ? "Ese correo ya tiene una cuenta." : createError.message);
    return;
  }

  const { error: profileError } = await admin.from("riders").insert({
    user_id: created.user.id,
    full_name: `${nombre} ${apellidos}`,
    first_name: nombre,
    last_name: apellidos,
    initials: initialsOf(nombre, apellidos),
    email,
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    fail("No se pudo crear tu perfil: " + profileError.message);
    return;
  }

  const supabase = await createClient();
  await supabase.auth.signInWithPassword({ email, password });

  redirect(next);
}

export async function signOutRider() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateMyProfile(formData: FormData) {
  const user = await requireUser();
  const fail = (msg: string) => redirect(`/cuenta?photoError=${encodeURIComponent(msg)}`);

  const nombre = String(formData.get("nombre") || "").trim();
  const apellidos = String(formData.get("apellidos") || "").trim();
  if (!nombre || !apellidos) throw new Error("Nombre y apellidos son obligatorios.");

  let photoUrl: string | undefined;
  const file = formData.get("photo");
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) {
      fail("El archivo debe ser una imagen.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      fail("La imagen no debe pesar más de 5 MB.");
      return;
    }
    try {
      photoUrl = await uploadImage(file, `liciba/riders/${user.id}`);
    } catch {
      fail("No se pudo subir la imagen. Intenta de nuevo.");
      return;
    }
  }

  const sexo = String(formData.get("sexo") || "");
  const admin = createAdminClient();
  const { error } = await admin.from("riders").upsert(
    {
      user_id: user.id,
      full_name: `${nombre} ${apellidos}`,
      first_name: nombre,
      last_name: apellidos,
      initials: initialsOf(nombre, apellidos),
      birth_date: String(formData.get("nac") || "") || null,
      gender: sexo === "Femenil" ? "F" : sexo === "Varonil" ? "M" : null,
      email: String(formData.get("email") || "").trim() || null,
      phone: String(formData.get("tel") || "").trim() || null,
      club: String(formData.get("club") || "").trim() || null,
      shirt_size: String(formData.get("talla") || "") || null,
      emergency_contact_name: String(formData.get("eNombre") || "").trim() || null,
      emergency_contact_relationship: String(formData.get("eRel") || "").trim() || null,
      emergency_phone: String(formData.get("eTel") || "").trim() || null,
      blood_type: String(formData.get("sangre") || "") || null,
      health_notes: String(formData.get("salud") || "").trim() || null,
      ...(photoUrl ? { photo_url: photoUrl } : {}),
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(error.message);

  revalidatePath("/cuenta");
  redirect("/cuenta?saved=1");
}
