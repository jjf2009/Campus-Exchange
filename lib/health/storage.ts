import { LISTING_IMAGE_BUCKET } from "@/lib/constants";
import type { ServiceStatus } from "@/lib/health/database";
import { createClient } from "@/lib/supabase/server";

export async function checkStorage(): Promise<ServiceStatus> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder")) {
      return "unhealthy";
    }

    const supabase = await createClient();
    const { error } = await supabase.storage
      .from(LISTING_IMAGE_BUCKET)
      .list("", { limit: 1 });

    if (error) {
      console.error("Health check: storage unhealthy", error.message);
      return "unhealthy";
    }

    return "healthy";
  } catch (error) {
    console.error("Health check: storage unhealthy", error);
    return "unhealthy";
  }
}
