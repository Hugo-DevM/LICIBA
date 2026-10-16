import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente privilegiado (service role, bypassa RLS). Solo para Server
// Actions / route handlers del panel admin — nunca debe llegar al bundle
// del cliente, por eso el import de "server-only" arriba.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}
