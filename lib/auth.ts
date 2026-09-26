import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import type { DbUser } from "@/db/schema";
import { E2E_TEST_COOKIE, isE2ETestMode, parseE2EUserCookie } from "@/lib/e2e";
import { BRANCHES, YEARS, isAllowedEmail } from "@/lib/constants";
import { isValidPhone } from "@/lib/validations";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUser(): Promise<DbUser | null> {
  if (isE2ETestMode()) {
    try {
      const cookieStore = await cookies();
      const email = parseE2EUserCookie(cookieStore.get(E2E_TEST_COOKIE)?.value);
      if (email) {
        if (!isAllowedEmail(email)) return null;
        const [testUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        return testUser ?? null;
      }
    } catch (error) {
      console.error("getCurrentUser e2e error:", error);
      return null;
    }
  }

  const authUser = await getSessionUser();
  if (!authUser?.email || !isAllowedEmail(authUser.email)) return null;

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
  if (!isProfileComplete(user)) {
    redirect("/profile/setup");
  }
  return user;
}

export function isProfileComplete(user: DbUser): boolean {
  const hasBranch =
    Boolean(user.branch) &&
    (BRANCHES as readonly string[]).includes(user.branch as string);
  const hasYear =
    Boolean(user.year) &&
    (YEARS as readonly string[]).includes(user.year as string);
  return hasBranch && hasYear && isValidPhone(user.phone);
}
