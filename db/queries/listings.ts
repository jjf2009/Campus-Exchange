import {
  and,
  count,
  desc,
  eq,
  ilike,
  inArray,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { db } from "@/db";
import { listings, users } from "@/db/schema";
import type { Category } from "@/types";

/**
 * Statuses buyers can see and contact on the marketplace. RESERVED means
 * "on hold": a buyer tapped Chat on WhatsApp and the item hid itself.
 */
export const VISIBLE_STATUSES = ["AVAILABLE"] as const;

export async function getMarketplaceListings(options?: {
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
}) {
  const conditions = [inArray(listings.status, [...VISIBLE_STATUSES])];

  if (options?.search?.trim()) {
    const term = `%${options.search.trim()}%`;
    conditions.push(
      or(ilike(listings.title, term), ilike(listings.description, term))!
    );
  }

  if (options?.category && options.category !== "all") {
    conditions.push(eq(listings.category, options.category as Category));
  }

  const baseQuery = db
    .select({
      id: listings.id,
      sellerId: listings.sellerId,
      title: listings.title,
      description: listings.description,
      price: listings.price,
      category: listings.category,
      condition: listings.condition,
      imageUrl: listings.imageUrl,
      status: listings.status,
      lastConfirmedAt: listings.lastConfirmedAt,
      createdAt: listings.createdAt,
      updatedAt: listings.updatedAt,
      sellerName: users.name,
      sellerBranch: users.branch,
      sellerYear: users.year,
      sellerAvatarUrl: users.avatarUrl,
    })
    .from(listings)
    .innerJoin(users, eq(listings.sellerId, users.id))
    .where(and(...conditions))
    .orderBy(desc(listings.createdAt));

  const totalQuery = db
    .select({ count: count() })
    .from(listings)
    .where(and(...conditions));

  const [totalRows] = await Promise.all([totalQuery]);
  const items = options?.limit
    ? await baseQuery.limit(options.limit).offset(options.offset ?? 0)
    : await baseQuery;

  return {
    items,
    total: totalRows[0]?.count ?? 0,
  };
}

export async function getListingById(id: string) {
  const [row] = await db
    .select({
      id: listings.id,
      sellerId: listings.sellerId,
      title: listings.title,
      description: listings.description,
      price: listings.price,
      category: listings.category,
      condition: listings.condition,
      imageUrl: listings.imageUrl,
      status: listings.status,
      heldByUserId: listings.heldByUserId,
      heldAt: listings.heldAt,
      lastConfirmedAt: listings.lastConfirmedAt,
      createdAt: listings.createdAt,
      updatedAt: listings.updatedAt,
      sellerName: users.name,
      sellerBranch: users.branch,
      sellerYear: users.year,
      sellerAvatarUrl: users.avatarUrl,
    })
    .from(listings)
    .innerJoin(users, eq(listings.sellerId, users.id))
    .where(eq(listings.id, id))
    .limit(1);

  return row ?? null;
}

export async function getListingsBySeller(sellerId: string) {
  return db
    .select({
      id: listings.id,
      title: listings.title,
      price: listings.price,
      category: listings.category,
      condition: listings.condition,
      imageUrl: listings.imageUrl,
      status: listings.status,
      lastConfirmedAt: listings.lastConfirmedAt,
      heldAt: listings.heldAt,
      heldByUserId: listings.heldByUserId,
      holderName: users.name,
      createdAt: listings.createdAt,
    })
    .from(listings)
    .leftJoin(users, eq(listings.heldByUserId, users.id))
    .where(
      and(eq(listings.sellerId, sellerId), ne(listings.status, "ARCHIVED"))
    )
    .orderBy(desc(listings.createdAt));
}

export async function getSellerStats(sellerId: string) {
  const rows = await db
    .select({
      status: listings.status,
      count: sql<number>`count(*)::int`,
    })
    .from(listings)
    .where(eq(listings.sellerId, sellerId))
    .groupBy(listings.status);

  const stats = {
    total: 0,
    available: 0,
    reserved: 0,
    sold: 0,
    expired: 0,
  };

  for (const row of rows) {
    stats.total += row.count;
    if (row.status === "AVAILABLE") stats.available = row.count;
    if (row.status === "RESERVED") stats.reserved = row.count;
    if (row.status === "SOLD") stats.sold = row.count;
    if (row.status === "EXPIRED") stats.expired = row.count;
  }

  return stats;
}

/** Seller listings hidden right now: on hold for a buyer, or expired. */
export async function getHeldListings(sellerId: string) {
  return db
    .select({
      id: listings.id,
      title: listings.title,
      price: listings.price,
      status: listings.status,
      heldAt: listings.heldAt,
      heldByUserId: listings.heldByUserId,
      holderName: users.name,
      lastConfirmedAt: listings.lastConfirmedAt,
    })
    .from(listings)
    .leftJoin(users, eq(listings.heldByUserId, users.id))
    .where(
      and(
        eq(listings.sellerId, sellerId),
        inArray(listings.status, ["RESERVED", "EXPIRED"])
      )
    )
    .orderBy(desc(listings.updatedAt));
}

/** Public numbers + a few recent items for the landing page ticker. */
export async function getLandingStats() {
  const [counts, recent] = await Promise.all([
    db
      .select({ status: listings.status, count: sql<number>`count(*)::int` })
      .from(listings)
      .where(inArray(listings.status, ["AVAILABLE", "SOLD"]))
      .groupBy(listings.status),
    db
      .select({ title: listings.title, price: listings.price })
      .from(listings)
      .where(inArray(listings.status, [...VISIBLE_STATUSES]))
      .orderBy(desc(listings.createdAt))
      .limit(12),
  ]);

  let live = 0;
  let sold = 0;
  for (const row of counts) {
    if (row.status === "SOLD") sold += row.count;
    else live += row.count;
  }

  return { live, sold, recent };
}
