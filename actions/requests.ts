"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { listings, purchaseRequests, users } from "@/db/schema";
import { requireCompleteProfile } from "@/lib/auth";
import { createNotification } from "@/lib/notifications/notification-service";
import {
  sendRequestAcceptedEmail,
  sendRequestRejectedEmail,
} from "@/lib/email";
import type { ActionResult } from "@/types";

export async function createRequest(
  listingId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireCompleteProfile();

    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (!listing) {
      return { success: false, error: "Listing not found" };
    }

    if (listing.sellerId === user.id) {
      return { success: false, error: "You cannot request your own listing" };
    }

    if (listing.status !== "AVAILABLE") {
      return {
        success: false,
        error: "This item is no longer available for requests",
      };
    }

    const [existing] = await db
      .select()
      .from(purchaseRequests)
      .where(
        and(
          eq(purchaseRequests.listingId, listingId),
          eq(purchaseRequests.buyerId, user.id)
        )
      )
      .limit(1);

    if (existing) {
      return { success: false, error: "You already requested this item" };
    }

    const [created] = await db
      .insert(purchaseRequests)
      .values({
        listingId,
        buyerId: user.id,
        status: "PENDING",
      })
      .returning({ id: purchaseRequests.id });

    await createNotification({
      userId: listing.sellerId,
      type: "NEW_REQUEST",
      title: `New request for ${listing.title}`,
      message: `${user.name} requested your listing ${listing.title}.`,
      data: {
        href: "/dashboard/requests",
        listingId,
        requestId: created.id,
        buyerId: user.id,
      },
    });

    revalidatePath(`/listing/${listingId}`);
    revalidatePath("/dashboard/requests");
    revalidatePath("/dashboard");

    return { success: true, data: { id: created.id } };
  } catch (error) {
    console.error("createRequest error:", error);
    return {
      success: false,
      error: "Failed to create request. Please try again.",
    };
  }
}

export async function acceptRequest(requestId: string): Promise<ActionResult> {
  try {
    const user = await requireCompleteProfile();

    const [request] = await db
      .select({
        id: purchaseRequests.id,
        listingId: purchaseRequests.listingId,
        buyerId: purchaseRequests.buyerId,
        status: purchaseRequests.status,
        sellerId: listings.sellerId,
        listingTitle: listings.title,
        listingStatus: listings.status,
      })
      .from(purchaseRequests)
      .innerJoin(listings, eq(purchaseRequests.listingId, listings.id))
      .where(eq(purchaseRequests.id, requestId))
      .limit(1);

    if (!request) {
      return { success: false, error: "Request not found" };
    }

    if (request.sellerId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (request.status !== "PENDING") {
      return { success: false, error: "This request is no longer pending" };
    }

    if (request.listingStatus !== "AVAILABLE") {
      return {
        success: false,
        error: "This listing is not available for new acceptances",
      };
    }

    // Atomic: accept one, reject others, lock listing
    await db.transaction(async (tx) => {
      await tx
        .update(purchaseRequests)
        .set({ status: "ACCEPTED", updatedAt: new Date() })
        .where(eq(purchaseRequests.id, requestId));

      await tx
        .update(purchaseRequests)
        .set({ status: "REJECTED", updatedAt: new Date() })
        .where(
          and(
            eq(purchaseRequests.listingId, request.listingId),
            ne(purchaseRequests.id, requestId),
            eq(purchaseRequests.status, "PENDING")
          )
        );

      await tx
        .update(listings)
        .set({ status: "PENDING_APPROVAL", updatedAt: new Date() })
        .where(eq(listings.id, request.listingId));
    });

    // Optional emails — failures are non-blocking
    const [buyer] = await db
      .select()
      .from(users)
      .where(eq(users.id, request.buyerId))
      .limit(1);

    if (buyer?.email) {
      await sendRequestAcceptedEmail({
        to: buyer.email,
        buyerName: buyer.name,
        listingTitle: request.listingTitle,
        sellerName: user.name,
        sellerPhone: user.phone ?? "",
      });
    }

    const rejected = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
      })
      .from(purchaseRequests)
      .innerJoin(users, eq(purchaseRequests.buyerId, users.id))
      .where(
        and(
          eq(purchaseRequests.listingId, request.listingId),
          eq(purchaseRequests.status, "REJECTED")
        )
      );

    await Promise.all(
      rejected.map((r) =>
        sendRequestRejectedEmail({
          to: r.email,
          buyerName: r.name,
          listingTitle: request.listingTitle,
        })
      )
    );

    await Promise.all([
      createNotification({
        userId: request.buyerId,
        type: "REQUEST_ACCEPTED",
        title: `Request accepted for ${request.listingTitle}`,
        message: `Your request for ${request.listingTitle} was accepted.`,
        data: {
          href: "/dashboard/requests",
          listingId: request.listingId,
          requestId,
        },
      }),
      ...rejected.map((r) =>
        createNotification({
          userId: r.id,
          type: "REQUEST_REJECTED",
          title: `Request update for ${request.listingTitle}`,
          message: `Your request for ${request.listingTitle} was not accepted.`,
          data: {
            href: "/dashboard/requests",
            listingId: request.listingId,
            requestId,
          },
        })
      ),
    ]);

    revalidatePath("/dashboard/requests");
    revalidatePath("/dashboard");
    revalidatePath("/marketplace");
    revalidatePath(`/listing/${request.listingId}`);

    return { success: true };
  } catch (error) {
    console.error("acceptRequest error:", error);
    return {
      success: false,
      error: "Failed to accept request. Please try again.",
    };
  }
}

export async function rejectRequest(requestId: string): Promise<ActionResult> {
  try {
    const user = await requireCompleteProfile();

    const [request] = await db
      .select({
        id: purchaseRequests.id,
        listingId: purchaseRequests.listingId,
        buyerId: purchaseRequests.buyerId,
        status: purchaseRequests.status,
        sellerId: listings.sellerId,
        listingTitle: listings.title,
      })
      .from(purchaseRequests)
      .innerJoin(listings, eq(purchaseRequests.listingId, listings.id))
      .where(eq(purchaseRequests.id, requestId))
      .limit(1);

    if (!request) {
      return { success: false, error: "Request not found" };
    }

    if (request.sellerId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (request.status !== "PENDING") {
      return { success: false, error: "This request is no longer pending" };
    }

    await db
      .update(purchaseRequests)
      .set({ status: "REJECTED", updatedAt: new Date() })
      .where(eq(purchaseRequests.id, requestId));

    const [buyer] = await db
      .select()
      .from(users)
      .where(eq(users.id, request.buyerId))
      .limit(1);

    if (buyer?.email) {
      await sendRequestRejectedEmail({
        to: buyer.email,
        buyerName: buyer.name,
        listingTitle: request.listingTitle,
      });
    }

    await createNotification({
      userId: request.buyerId,
      type: "REQUEST_REJECTED",
      title: `Request update for ${request.listingTitle}`,
      message: `Your request for ${request.listingTitle} was not accepted.`,
      data: {
        href: "/dashboard/requests",
        listingId: request.listingId,
        requestId,
      },
    });

    revalidatePath("/dashboard/requests");
    revalidatePath("/dashboard");
    revalidatePath(`/listing/${request.listingId}`);

    return { success: true };
  } catch (error) {
    console.error("rejectRequest error:", error);
    return {
      success: false,
      error: "Failed to reject request. Please try again.",
    };
  }
}
