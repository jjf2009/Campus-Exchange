import { sql } from "drizzle-orm";
import { db } from "@/db";

export type ServiceStatus = "healthy" | "unhealthy";

export async function checkDatabase(): Promise<ServiceStatus> {
  try {
    await db.execute(sql`SELECT 1`);
    return "healthy";
  } catch (error) {
    console.error("Health check: database unhealthy", error);
    return "unhealthy";
  }
}
