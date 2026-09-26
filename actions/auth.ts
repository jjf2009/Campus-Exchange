"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/app-url";
import { ALLOWED_EMAIL_DOMAIN } from "@/lib/constants";

export async function signInWithGoogle(next = "/marketplace") {
  const supabase = await createClient();
  const appUrl = getAppUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      // Hint only (Google pre-selects college accounts); enforced server-side.
      queryParams: { hd: ALLOWED_EMAIL_DOMAIN },
    },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth");
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
