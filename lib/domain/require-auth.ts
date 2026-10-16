import "server-only";
import { createClient } from "@/lib/supabase/server";

// Para flujos que funcionan con o sin cuenta (p. ej. inscripción como
// invitado): nunca truena, regresa null si no hay sesión.
export async function getOptionalUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// El proxy ya bloquea el acceso a rutas sin sesión/rol, pero las Server
// Actions son endpoints alcanzables directamente — se revalida aquí para
// que una escritura nunca dependa solo de la UI.
export async function requireUser() {
  const user = await getOptionalUser();
  if (!user) throw new Error("No autorizado.");
  return user;
}

// Para acciones del panel staff: no basta con tener sesión, el usuario debe
// tener app_metadata.role === "staff" (se asigna con scripts/create-admin-user.mjs
// o scripts/set-staff-role.mjs; app_metadata no lo puede editar el usuario).
export async function requireStaff() {
  const user = await requireUser();
  if (user.app_metadata?.role !== "staff") throw new Error("No autorizado.");
  return user;
}
