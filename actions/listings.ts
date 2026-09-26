"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { getListingContactBuyers } from "@/db/queries/contacts";
import { requireCompleteProfile } from "@/lib/auth";
import { getCategoryImage } from "@/lib/constants";
import { listingSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

async function getOwnListing(listingId: unknown, sellerId: string) {
  if (!listingId || typeof listingId !== "string") return null;
  const [existing] = await db
    .select()
    .from(listings)
    .where(and(eq(listings.id, listingId), eq(listings.sellerId, sellerId)))
    .limit(1);
  return existing ?? null;
}

function revalidateListing(listingId: string) {
  revalidatePath("/marketplace");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/listings");
  revalidatePath("/dashboard/requests");
  revalidatePath(`/listing/${listingId}`);
}

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

    revalidatePath("/marketplace");
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
        // Editing an expired listing brings it back; holds are left alone.
        status: existing.status === "EXPIRED" ? "AVAILABLE" : existing.status,
        lastConfirmedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(listings.id, id));

    revalidatePath("/marketplace");
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

    revalidatePath("/marketplace");
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
  listingId: string,
  soldToUserId?: string | null
): Promise<ActionResult> {
  try {
    const user = await requireCompleteProfile();
    const existing = await getOwnListing(listingId, user.id);

    if (!existing) {
      return { success: false, error: "Listing not found or unauthorized" };
    }

    if (existing.status === "SOLD" || existing.status === "ARCHIVED") {
      return { success: false, error: "This listing is already closed" };
    }

    if (soldToUserId) {
      const buyers = await getListingContactBuyers(listingId);
      if (!buyers.some((b) => b.id === soldToUserId)) {
        return {
          success: false,
          error: "Buyer must be someone who contacted you about this item",
        };
      }
    }

    await db
      .update(listings)
      .set({
        status: "SOLD",
        // Default to whoever had it on hold.
        soldToUserId: soldToUserId || existing.heldByUserId || null,
        heldByUserId: null,
        heldAt: null,
        updatedAt: new Date(),
      })
      .where(eq(listings.id, listingId));

    revalidateListing(listingId);
    return { success: true };
  } catch (error) {
    console.error("markListingSold error:", error);
    return {
      success: false,
      error: "Failed to mark listing as sold. Please try again.",
    };
  }
}

/**
 * The deal fell through (or an old listing is still for sale): put it back
 * on the marketplace, clear any hold and reset the 30-day clock.
 */
export async function relistListing(listingId: string): Promise<ActionResult> {
  try {
    const user = await requireCompleteProfile();
    const existing = await getOwnListing(listingId, user.id);

    if (!existing) {
      return { success: false, error: "Only the seller can relist this item" };
    }

    if (!["AVAILABLE", "RESERVED", "EXPIRED"].includes(existing.status)) {
      return { success: false, error: "This listing is already closed" };
    }

    await db
      .update(listings)
      .set({
        status: "AVAILABLE",
        heldByUserId: null,
        heldAt: null,
        lastConfirmedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(listings.id, listingId),
          inArray(listings.status, ["AVAILABLE", "RESERVED", "EXPIRED"])
        )
      );

    revalidateListing(listingId);
    return { success: true };
  } catch (error) {
    console.error("relistListing error:", error);
    return {
      success: false,
      error: "Failed to relist. Please try again.",
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
