import type { ServiceStatus } from "@/lib/health/database";

/**
 * Listing images are static files under /public (category-based).
 * Supabase Storage is no longer required for the marketplace to work.
 */
export async function checkStorage(): Promise<ServiceStatus> {
  return "healthy";
}
