import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import type { DbUser } from "@/db/schema";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUser(): Promise<DbUser | null> {
  const authUser = await getSessionUser();
  if (!authUser?.email) return null;

  try {
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1);

    if (dbUser) return dbUser;

    const name =
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      authUser.email?.split("@")[0] ||
      "Student";
    const avatarUrl =
      authUser.user_metadata?.avatar_url ||
      authUser.user_metadata?.picture ||
      null;

    const [created] = await db
      .insert(users)
      .values({
        id: authUser.id,
        email: authUser.email,
        name,
        avatarUrl,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: authUser.email,
          name,
          avatarUrl,
          updatedAt: new Date(),
        },
      })
      .returning();

    return created;
  } catch (error) {
    console.error("getCurrentUser database error:", error);
    return null;
  }
}

export async function requireUser(): Promise<DbUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireCompleteProfile(): Promise<DbUser> {
  const user = await requireUser();
  if (!user.branch || !user.year || !user.phone) {
    redirect("/profile/setup");
  }
  return user;
}

export function isProfileComplete(user: DbUser): boolean {
  return Boolean(user.branch && user.year && user.phone);
}
