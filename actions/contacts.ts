"use server";

import { and, eq, inArray, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { listingContacts, listings, users } from "@/db/schema";
import {
  countRecentContactsByBuyer,
  countReportsForListing,
  getContact,
} from "@/db/queries/contacts";
import { VISIBLE_STATUSES } from "@/db/queries/listings";
import { requireCompleteProfile } from "@/lib/auth";
import { MAX_CONTACTS_PER_DAY, REPORTS_TO_EXPIRE } from "@/lib/constants";
import { createNotification } from "@/lib/notifications/notification-service";
import { requestSchema } from "@/lib/validations";
import { buildListingEnquiry, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { ActionResult } from "@/types";

/**
 * Buyer taps "Chat on WhatsApp": record the contact, tell the seller, and
 * return a wa.me link with a pre-filled enquiry. No approval step.
 */
export async function contactSeller(
  listingId: string
): Promise<ActionResult<{ url: string }>> {
  try {
    const user = await requireCompleteProfile();

    const idCheck = requestSchema.safeParse({ listingId });
    if (!idCheck.success) {
      return { success: false, error: "Invalid listing id" };
    }

    const [listing] = await db
      .select({
        id: listings.id,
        title: listings.title,
        price: listings.price,
        status: listings.status,
        sellerId: listings.sellerId,
        sellerPhone: users.phone,
      })
      .from(listings)
      .innerJoin(users, eq(listings.sellerId, users.id))
      .where(eq(listings.id, listingId))
      .limit(1);

    if (!listing) {
      return { success: false, error: "Listing not found" };
    }

    if (listing.sellerId === user.id) {
      return { success: false, error: "This is your own listing" };
    }

    if (!(VISIBLE_STATUSES as readonly string[]).includes(listing.status)) {
      return { success: false, error: "This item is no longer available" };
    }

    if (!listing.sellerPhone) {
      return { success: false, error: "Seller has no WhatsApp number yet" };
    }

    const existing = await getContact(listingId, user.id);

    if (!existing) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recent = await countRecentContactsByBuyer(user.id, since);
      if (recent >= MAX_CONTACTS_PER_DAY) {
        return {
          success: false,
          error: "You've contacted a lot of sellers today. Try again tomorrow.",
        };
      }

      const [created] = await db
        .insert(listingContacts)
        .values({ listingId, buyerId: user.id })
        .onConflictDoNothing()
        .returning({ id: listingContacts.id });

      // Only the first tap notifies the seller (a double tap is a no-op).
      if (created) {
        await createNotification({
          userId: listing.sellerId,
          type: "NEW_CONTACT",
          title: `${user.name} is interested in ${listing.title}`,
          message: `${user.name} opened a WhatsApp chat about ${listing.title}.`,
          data: {
            href: "/dashboard/requests",
            listingId,
            buyerId: user.id,
          },
        });

        revalidatePath(`/listing/${listingId}`);
        revalidatePath("/dashboard/requests");
      }
    }

    return {
      success: true,
      data: {
        url: buildWhatsAppUrl(listing.sellerPhone, buildListingEnquiry(listing)),
      },
    };
  } catch (error) {
    console.error("contactSeller error:", error);
    return {
      success: false,
      error: "Could not open the chat. Please try again.",
    };
  }
}

/**
 * A buyer who contacted the seller says the item is gone. Enough distinct
 * reports hide the listing until the seller renews it.
 */
export async function reportUnavailable(
  listingId: string
): Promise<ActionResult> {
  try {
    const user = await requireCompleteProfile();

    const idCheck = requestSchema.safeParse({ listingId });
    if (!idCheck.success) {
      return { success: false, error: "Invalid listing id" };
    }

    const contact = await getContact(listingId, user.id);
    if (!contact) {
      return {
        success: false,
        error: "Only buyers who contacted the seller can report this",
      };
    }

    await db
      .update(listingContacts)
      .set({ reportedUnavailableAt: new Date() })
      .where(
        and(
          eq(listingContacts.id, contact.id),
          isNull(listingContacts.reportedUnavailableAt)
        )
      );

    const reports = await countReportsForListing(listingId);

    if (reports >= REPORTS_TO_EXPIRE) {
      const [expired] = await db
        .update(listings)
        .set({ status: "EXPIRED", updatedAt: new Date() })
        .where(
          and(
            eq(listings.id, listingId),
            inArray(listings.status, [...VISIBLE_STATUSES])
          )
        )
        .returning({ sellerId: listings.sellerId, title: listings.title });

      if (expired) {
        await createNotification({
          userId: expired.sellerId,
          type: "LISTING_REPORTED",
          title: `Is ${expired.title} still available?`,
          message: `Buyers reported ${expired.title} as no longer available, so it was hidden. Renew it if it's still for sale.`,
          data: { href: "/dashboard", listingId },
        });

        revalidatePath("/marketplace");
        revalidatePath("/dashboard");
      }
    }

    revalidatePath(`/listing/${listingId}`);
    revalidatePath("/dashboard/requests");

    return { success: true };
  } catch (error) {
    console.error("reportUnavailable error:", error);
    return {
      success: false,
      error: "Could not send the report. Please try again.",
    };
  }
}
