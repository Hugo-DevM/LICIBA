import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isStaff = user?.app_metadata?.role === "staff";

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLoginRoute = pathname === "/admin/login";

  // /admin/*: requiere sesión Y rol staff (app_metadata, no lo puede poner
  // el propio usuario) — un corredor con cuenta normal no debe entrar aquí.
  if (isAdminRoute && !isAdminLoginRoute && !isStaff) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdminLoginRoute && isStaff) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // /cuenta (perfil): requiere cuenta. /inscripcion/[slug] NO la requiere —
  // se puede inscribir con cuenta (autorrelleno) o como invitado.
  const isAccountPage = pathname === "/cuenta";
  const isAccountAuthRoute = pathname === "/cuenta/login" || pathname === "/cuenta/registro";

  if (isAccountPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/cuenta/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAccountAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/cuenta";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/cuenta/:path*", "/inscripcion/:path*"],
};
