import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isProfileComplete } from "@/lib/auth";
import { getAppUrl } from "@/lib/app-url";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/marketplace";
  const appUrl = getAppUrl();

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Ensure user row exists
      const user = await getCurrentUser();

      if (user && !isProfileComplete(user)) {
        return NextResponse.redirect(`${appUrl}/profile/setup`);
      }

      return NextResponse.redirect(`${appUrl}${next}`);
    }
  }

  return NextResponse.redirect(`${appUrl}/login?error=auth`);
}
