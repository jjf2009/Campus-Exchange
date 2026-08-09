import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { listings, notifications, purchaseRequests, users } from "@/db/schema";

export async function resetE2EDatabase() {
  await db.execute(sql`
    TRUNCATE TABLE notifications, purchase_requests, listings, users RESTART IDENTITY CASCADE;
  `);

  await db.insert(users).values([
    {
      email: "seller.demo@gec.ac.in",
      name: "Demo Seller",
      branch: "Mechanical",
      year: "Final Year",
      phone: "+919800000001",
      avatarUrl: null,
    },
    {
      email: "buyer.one@gec.ac.in",
      name: "Buyer One",
      branch: "Computer",
      year: "Third Year",
      phone: "+919800000002",
      avatarUrl: null,
    },
    {
      email: "buyer.two@gec.ac.in",
      name: "Buyer Two",
      branch: "Civil",
      year: "Second Year",
      phone: "+919800000003",
      avatarUrl: null,
    },
  ]);
}

export async function resetE2EEmailEvents(baseURL = "http://127.0.0.1:3000") {
  await fetch(`${baseURL}/api/e2e/email-events`, { method: "DELETE" });
}

export async function seedE2EListing() {
  const [seller] = await db
    .select()
    .from(users)
    .where(eq(users.email, "seller.demo@gec.ac.in"))
    .limit(1);

  if (!seller) throw new Error("Missing seller seed user");

  const [created] = await db
    .insert(listings)
    .values({
      sellerId: seller.id,
      title: "E2E Test Boiler",
      description: "Listing created for automated end-to-end testing.",
      price: 750,
      category: "Boiler",
      condition: "Good",
      imageUrl: null,
      status: "AVAILABLE",
    })
    .returning();

  return created;
}

export async function getE2EUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user ?? null;
}

export async function getE2EListingByTitle(title: string) {
  const [listing] = await db.select().from(listings).where(eq(listings.title, title)).limit(1);
  return listing ?? null;
}

export async function getE2ERequestsForListing(listingId: string) {
  return db.select().from(purchaseRequests).where(eq(purchaseRequests.listingId, listingId));
}

export async function getE2ENotificationCount(userId: string) {
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(eq(notifications.userId, userId));

  return rows.length;
}
