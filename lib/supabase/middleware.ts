import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Skip auth checks when env is not configured (e.g. first-time setup)
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder")) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const publicPaths = ["/", "/login", "/auth/callback", "/api/health"];
  const isPublic =
    publicPaths.includes(path) ||
    path.startsWith("/auth/") ||
    path.startsWith("/listing/");

  if (path === "/marketplace") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (!user) {
    // Clear stale Supabase auth cookies to prevent infinite token refresh error logs
    request.cookies.getAll().forEach((cookie) => {
      if (cookie.name.startsWith("sb-")) {
        request.cookies.delete(cookie.name);
        supabaseResponse.cookies.delete(cookie.name);
      }
    });

    if (!isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", path);
      
      const redirectResponse = NextResponse.redirect(url);
      request.cookies.getAll().forEach((cookie) => {
        if (cookie.name.startsWith("sb-")) {
          redirectResponse.cookies.delete(cookie.name);
        }
      });
      return redirectResponse;
    }
  }

  if (user && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
