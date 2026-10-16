import { createClient } from "@supabase/supabase-js";

// Cliente anónimo para lecturas públicas. Se usa en vez del cliente basado en
// cookies porque generateStaticParams corre en build time sin request y no
// puede leer cookies().
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
