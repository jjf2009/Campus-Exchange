import { and, desc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { listings, users } from "@/db/schema";
import type { Category } from "@/types";

export async function getMarketplaceListings(options?: {
  search?: string;
  category?: string;
}) {
  const conditions = [eq(listings.status, "AVAILABLE")];

  if (options?.search?.trim()) {
    const term = `%${options.search.trim()}%`;
    conditions.push(
      or(ilike(listings.title, term), ilike(listings.description, term))!
    );
  }

  if (options?.category && options.category !== "all") {
    conditions.push(eq(listings.category, options.category as Category));
  }

  return db
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
    .select()
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
    pending: 0,
    sold: 0,
  };

  for (const row of rows) {
    stats.total += row.count;
    if (row.status === "AVAILABLE") stats.available = row.count;
    if (row.status === "PENDING_APPROVAL") stats.pending = row.count;
    if (row.status === "SOLD") stats.sold = row.count;
  }

  return stats;
}
