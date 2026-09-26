import { and, count, desc, eq, gte, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { listingContacts, listings, users } from "@/db/schema";

export async function getContact(listingId: string, buyerId: string) {
  const [row] = await db
    .select()
    .from(listingContacts)
    .where(
      and(
        eq(listingContacts.listingId, listingId),
        eq(listingContacts.buyerId, buyerId)
      )
    )
    .limit(1);

  return row ?? null;
}

export async function countRecentContactsByBuyer(buyerId: string, since: Date) {
  const [row] = await db
    .select({ count: count() })
    .from(listingContacts)
    .where(
      and(
        eq(listingContacts.buyerId, buyerId),
        gte(listingContacts.createdAt, since)
      )
    );

  return row?.count ?? 0;
}

export async function countReportsForListing(listingId: string) {
  const [row] = await db
    .select({ count: count() })
    .from(listingContacts)
    .where(
      and(
        eq(listingContacts.listingId, listingId),
        isNotNull(listingContacts.reportedUnavailableAt)
      )
    );

  return row?.count ?? 0;
}

/** Buyers who contacted a listing (for "who bought it?" and sold notifications). */
export async function getListingContactBuyers(listingId: string) {
  return db
    .select({ id: users.id, name: users.name })
    .from(listingContacts)
    .innerJoin(users, eq(listingContacts.buyerId, users.id))
    .where(eq(listingContacts.listingId, listingId))
    .orderBy(desc(listingContacts.createdAt));
}

/** Seller view: everyone who contacted any of the seller's listings. */
export async function getContactsForSeller(sellerId: string) {
  return db
    .select({
      id: listingContacts.id,
      listingId: listingContacts.listingId,
      buyerId: listingContacts.buyerId,
      reportedUnavailableAt: listingContacts.reportedUnavailableAt,
      createdAt: listingContacts.createdAt,
      listingTitle: listings.title,
      listingPrice: listings.price,
      listingCategory: listings.category,
      listingImageUrl: listings.imageUrl,
      listingStatus: listings.status,
      buyerName: users.name,
      buyerBranch: users.branch,
      buyerYear: users.year,
      buyerPhone: users.phone,
    })
    .from(listingContacts)
    .innerJoin(listings, eq(listingContacts.listingId, listings.id))
    .innerJoin(users, eq(listingContacts.buyerId, users.id))
    .where(eq(listings.sellerId, sellerId))
    .orderBy(desc(listingContacts.createdAt));
}

/** Buyer view: listings the buyer has contacted, with their current status. */
export async function getContactsForBuyer(buyerId: string) {
  return db
    .select({
      id: listingContacts.id,
      listingId: listingContacts.listingId,
      reportedUnavailableAt: listingContacts.reportedUnavailableAt,
      createdAt: listingContacts.createdAt,
      listingTitle: listings.title,
      listingPrice: listings.price,
      listingCategory: listings.category,
      listingImageUrl: listings.imageUrl,
      listingStatus: listings.status,
      soldToUserId: listings.soldToUserId,
      sellerName: users.name,
      sellerPhone: users.phone,
    })
    .from(listingContacts)
    .innerJoin(listings, eq(listingContacts.listingId, listings.id))
    .innerJoin(users, eq(listings.sellerId, users.id))
    .where(eq(listingContacts.buyerId, buyerId))
    .orderBy(desc(listingContacts.createdAt));
}
