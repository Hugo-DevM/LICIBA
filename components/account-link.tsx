import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/current-user";

export async function AccountLink({ className }: { className?: string }) {
  const user = await getCurrentUser();

  return (
    <Link href={user ? "/cuenta" : "/cuenta/login"} className={className}>
      {user ? "Mi cuenta" : "Iniciar sesión"}
    </Link>
  );
}
