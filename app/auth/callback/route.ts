import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isProfileComplete } from "@/lib/auth";
import { getAppUrl } from "@/lib/app-url";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/";
  // Only allow relative in-app paths to prevent open redirects.
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/";
  const appUrl = getAppUrl();

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        // Ensure user row exists; incomplete profiles must finish setup first.
        const user = await getCurrentUser();

        if (user && !isProfileComplete(user)) {
          return NextResponse.redirect(`${appUrl}/profile/setup`);
        }

        return NextResponse.redirect(`${appUrl}${next}`);
      }
    } catch (error) {
      console.error("Auth callback error:", error);
    }
  }

  return NextResponse.redirect(`${appUrl}/login?error=auth`);
}
