import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { db } from "@/db";
import { listings, users } from "@/db/schema";
import type { Category } from "@/types";

/** Statuses buyers can see and contact on the marketplace. */
export const VISIBLE_STATUSES = ["AVAILABLE", "RESERVED"] as const;

const contactCount = sql<number>`(
  select count(*)::int from listing_contacts lc
  where lc.listing_id = ${listings.id}
)`;

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
      contactCount,
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
    // Reserved items sink below available ones.
    .orderBy(
      asc(sql`${listings.status} = 'RESERVED'`),
      desc(listings.createdAt)
    );

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
      lastConfirmedAt: listings.lastConfirmedAt,
      contactCount,
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
      nudgedAt: listings.nudgedAt,
      contactCount,
      createdAt: listings.createdAt,
    })
    .from(listings)
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

/**
 * Seller listings waiting on a "still available?" answer: nudged by the
 * cron job, or hidden after expiring / being reported.
 */
export async function getListingsNeedingAttention(sellerId: string) {
  return db
    .select({
      id: listings.id,
      title: listings.title,
      price: listings.price,
      status: listings.status,
      lastConfirmedAt: listings.lastConfirmedAt,
      contactCount,
    })
    .from(listings)
    .where(
      and(
        eq(listings.sellerId, sellerId),
        or(
          eq(listings.status, "EXPIRED"),
          and(
            inArray(listings.status, [...VISIBLE_STATUSES]),
            isNotNull(listings.nudgedAt)
          )
        )
      )
    )
    .orderBy(desc(listings.updatedAt));
}
