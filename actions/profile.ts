"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

export async function updateProfile(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireUser();

    const parsed = profileSchema.safeParse({
      branch: formData.get("branch"),
      year: formData.get("year"),
      phone: formData.get("phone"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid profile data",
      };
    }

    await db
      .update(users)
      .set({
        branch: parsed.data.branch,
        year: parsed.data.year,
        phone: parsed.data.phone.trim(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    revalidatePath("/profile/setup");
    revalidatePath("/marketplace");

    return { success: true };
  } catch (error) {
    console.error("updateProfile error:", error);
    return { success: false, error: "Failed to update profile. Please try again." };
  }
}
