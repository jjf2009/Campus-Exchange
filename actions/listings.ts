"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { listings, purchaseRequests } from "@/db/schema";
import { requireCompleteProfile } from "@/lib/auth";
import { getCategoryImage } from "@/lib/constants";
import { createNotification } from "@/lib/notifications/notification-service";
import { listingSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

export async function createListing(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireCompleteProfile();

    const parsed = listingSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      price: formData.get("price"),
      category: formData.get("category"),
      condition: formData.get("condition"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid listing data",
      };
    }

    const imageUrl = getCategoryImage(parsed.data.category);

    const [created] = await db
      .insert(listings)
      .values({
        sellerId: user.id,
        title: parsed.data.title.trim(),
        description: parsed.data.description.trim(),
        price: parsed.data.price,
        category: parsed.data.category,
        condition: parsed.data.condition,
        imageUrl,
        status: "AVAILABLE",
      })
      .returning({ id: listings.id });

    if (!created?.id) {
      return {
        success: false,
        error: "Failed to create listing. Please try again.",
      };
    }

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/listings");

    return { success: true, data: { id: created.id } };
  } catch (error) {
    console.error("createListing error:", error);
    return {
      success: false,
      error: "Failed to create listing. Please try again.",
    };
  }
}

export async function updateListing(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireCompleteProfile();
    const id = formData.get("id");

    if (typeof id !== "string") {
      return { success: false, error: "Invalid listing id" };
    }

    const [existing] = await db
      .select()
      .from(listings)
      .where(and(eq(listings.id, id), eq(listings.sellerId, user.id)))
      .limit(1);

    if (!existing) {
      return { success: false, error: "Listing not found or unauthorized" };
    }

    if (existing.status === "SOLD" || existing.status === "ARCHIVED") {
      return { success: false, error: "This listing can no longer be edited" };
    }

    const parsed = listingSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      price: formData.get("price"),
      category: formData.get("category"),
      condition: formData.get("condition"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid listing data",
      };
    }

    // Image always follows the selected category (no user uploads).
    const imageUrl = getCategoryImage(parsed.data.category);

    await db
      .update(listings)
      .set({
        title: parsed.data.title.trim(),
        description: parsed.data.description.trim(),
        price: parsed.data.price,
        category: parsed.data.category,
        condition: parsed.data.condition,
        imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(listings.id, id));

    revalidatePath("/");
    revalidatePath(`/listing/${id}`);
    revalidatePath("/dashboard/listings");
    revalidatePath(`/edit-listing/${id}`);

    return { success: true };
  } catch (error) {
    console.error("updateListing error:", error);
    return {
      success: false,
      error: "Failed to update listing. Please try again.",
    };
  }
}

export async function deleteListing(listingId: string): Promise<ActionResult> {
  try {
    const user = await requireCompleteProfile();

    if (!listingId || typeof listingId !== "string") {
      return { success: false, error: "Invalid listing id" };
    }

    const [existing] = await db
      .select()
      .from(listings)
      .where(and(eq(listings.id, listingId), eq(listings.sellerId, user.id)))
      .limit(1);

    if (!existing) {
      return { success: false, error: "Listing not found or unauthorized" };
    }

    await db
      .update(listings)
      .set({ status: "ARCHIVED", updatedAt: new Date() })
      .where(eq(listings.id, listingId));

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/listings");

    return { success: true };
  } catch (error) {
    console.error("deleteListing error:", error);
    return {
      success: false,
      error: "Failed to delete listing. Please try again.",
    };
  }
}

export async function markListingSold(
  listingId: string
): Promise<ActionResult> {
  try {
    const user = await requireCompleteProfile();

    if (!listingId || typeof listingId !== "string") {
      return { success: false, error: "Invalid listing id" };
    }

    const [existing] = await db
      .select()
      .from(listings)
      .where(and(eq(listings.id, listingId), eq(listings.sellerId, user.id)))
      .limit(1);

    if (!existing) {
      return { success: false, error: "Listing not found or unauthorized" };
    }

    if (existing.status === "SOLD") {
      return { success: false, error: "Listing is already sold" };
    }

    const acceptedRequest = await db
      .select({
        buyerId: purchaseRequests.buyerId,
      })
      .from(purchaseRequests)
      .where(
        and(
          eq(purchaseRequests.listingId, listingId),
          eq(purchaseRequests.status, "ACCEPTED")
        )
      )
      .limit(1);

    await db
      .update(listings)
      .set({ status: "SOLD", updatedAt: new Date() })
      .where(eq(listings.id, listingId));

    if (acceptedRequest[0]?.buyerId) {
      await createNotification({
        userId: acceptedRequest[0].buyerId,
        type: "LISTING_SOLD",
        title: `${existing.title} marked as sold`,
        message: `The seller marked ${existing.title} as sold.`,
        data: {
          href: "/dashboard/requests",
          listingId,
        },
      });
    }

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/listings");
    revalidatePath(`/listing/${listingId}`);

    return { success: true };
  } catch (error) {
    console.error("markListingSold error:", error);
    return {
      success: false,
      error: "Failed to mark listing as sold. Please try again.",
    };
  }
}

export async function createListingAndRedirect(formData: FormData) {
  const result = await createListing(formData);
  if (result.success && result.data?.id) {
    redirect(`/listing/${result.data.id}`);
  }
  return result;
}
