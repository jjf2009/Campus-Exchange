import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { listings, purchaseRequests, users } from "@/db/schema";

export async function getIncomingRequests(sellerId: string) {
  return db
    .select({
      id: purchaseRequests.id,
      listingId: purchaseRequests.listingId,
      buyerId: purchaseRequests.buyerId,
      status: purchaseRequests.status,
      createdAt: purchaseRequests.createdAt,
      updatedAt: purchaseRequests.updatedAt,
      listingTitle: listings.title,
      listingPrice: listings.price,
      listingCategory: listings.category,
      listingImageUrl: listings.imageUrl,
      listingStatus: listings.status,
      buyerName: users.name,
      buyerBranch: users.branch,
      buyerYear: users.year,
      buyerAvatarUrl: users.avatarUrl,
    })
    .from(purchaseRequests)
    .innerJoin(listings, eq(purchaseRequests.listingId, listings.id))
    .innerJoin(users, eq(purchaseRequests.buyerId, users.id))
    .where(eq(listings.sellerId, sellerId))
    .orderBy(desc(purchaseRequests.createdAt));
}

export async function getBuyerRequests(buyerId: string) {
  return db
    .select({
      id: purchaseRequests.id,
      listingId: purchaseRequests.listingId,
      buyerId: purchaseRequests.buyerId,
      status: purchaseRequests.status,
      createdAt: purchaseRequests.createdAt,
      updatedAt: purchaseRequests.updatedAt,
      listingTitle: listings.title,
      listingPrice: listings.price,
      listingCategory: listings.category,
      listingImageUrl: listings.imageUrl,
      listingStatus: listings.status,
      sellerId: listings.sellerId,
      sellerName: users.name,
      sellerPhone: users.phone,
    })
    .from(purchaseRequests)
    .innerJoin(listings, eq(purchaseRequests.listingId, listings.id))
    .innerJoin(users, eq(listings.sellerId, users.id))
    .where(eq(purchaseRequests.buyerId, buyerId))
    .orderBy(desc(purchaseRequests.createdAt));
}

export async function getRequestForListing(listingId: string, buyerId: string) {
  const [row] = await db
    .select()
    .from(purchaseRequests)
    .where(
      and(
        eq(purchaseRequests.listingId, listingId),
        eq(purchaseRequests.buyerId, buyerId)
      )
    )
    .limit(1);

  return row ?? null;
}

export async function countPendingRequestsForSeller(sellerId: string) {
  const rows = await db
    .select({ id: purchaseRequests.id })
    .from(purchaseRequests)
    .innerJoin(listings, eq(purchaseRequests.listingId, listings.id))
    .where(
      and(
        eq(listings.sellerId, sellerId),
        eq(purchaseRequests.status, "PENDING")
      )
    );

  return rows.length;
}
