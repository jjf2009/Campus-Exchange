import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isProfileComplete } from "@/lib/auth";
import { getAppUrl } from "@/lib/app-url";
import { isAllowedEmail } from "@/lib/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/marketplace";
  // Only allow relative in-app paths to prevent open redirects.
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/marketplace";
  const appUrl = getAppUrl();

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && !isAllowedEmail(data.user?.email)) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${appUrl}/login?error=domain`);
      }

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
