"use server";

import { revalidatePath } from "next/cache";
import { requireCompleteProfile } from "@/lib/auth";
import {
  markAllAsRead,
  markAsRead,
} from "@/lib/notifications/notification-service";
import type { ActionResult } from "@/types";

export async function markNotificationReadAction(
  notificationId: string
): Promise<ActionResult> {
  try {
    const user = await requireCompleteProfile();
    await markAsRead(notificationId, user.id);

    revalidatePath("/dashboard/notifications");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("markNotificationReadAction error:", error);
    return {
      success: false,
      error: "Failed to update notification. Please try again.",
    };
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  try {
    const user = await requireCompleteProfile();
    await markAllAsRead(user.id);

    revalidatePath("/dashboard/notifications");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("markAllNotificationsReadAction error:", error);
    return {
      success: false,
      error: "Failed to update notifications. Please try again.",
    };
  }
}
