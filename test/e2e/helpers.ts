import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { listingContacts, listings, notifications, users } from "@/db/schema";

export async function resetE2EDatabase() {
  await db.execute(sql`
    TRUNCATE TABLE notifications, listing_contacts, purchase_requests, listings, users RESTART IDENTITY CASCADE;
  `);

  await db.insert(users).values([
    {
      email: "seller.demo@gec.ac.in",
      name: "Demo Seller",
      branch: "Mechanical",
      year: "Final Year",
      phone: "9800000001",
      avatarUrl: null,
    },
    {
      email: "buyer.one@gec.ac.in",
      name: "Buyer One",
      branch: "Computer",
      year: "Third Year",
      phone: "9800000002",
      avatarUrl: null,
    },
    {
      email: "buyer.two@gec.ac.in",
      name: "Buyer Two",
      branch: "Civil",
      year: "Second Year",
      phone: "9800000003",
      avatarUrl: null,
    },
  ]);
}

export async function seedE2EListing(title = "E2E Test Boiler") {
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
      title,
      description: "Listing created for automated end-to-end testing.",
      price: 750,
      category: "Boiler",
      condition: "Good",
      imageUrl: "/Boiler_suit.jpg",
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

export async function getE2EListingById(id: string) {
  const [listing] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  return listing ?? null;
}

export async function getE2EContactsForListing(listingId: string) {
  return db.select().from(listingContacts).where(eq(listingContacts.listingId, listingId));
}

/** Give a buyer `n` contacts made just now on throwaway listings. */
export async function seedE2EContacts(buyerId: string, n: number) {
  const seller = await getE2EUserByEmail("seller.demo@gec.ac.in");
  if (!seller) throw new Error("Missing seller seed user");
  const created = await db
    .insert(listings)
    .values(
      Array.from({ length: n }, (_, i) => ({
        sellerId: seller.id,
        title: `Filler ${i}`,
        description: "Filler listing for rate-limit testing.",
        price: 10,
        category: "Others",
        condition: "Good",
        status: "AVAILABLE" as const,
      }))
    )
    .returning({ id: listings.id });
  await db.insert(listingContacts).values(created.map((l) => ({ listingId: l.id, buyerId })));
}

export async function backdateE2EListing(listingId: string, daysAgo: number) {
  await db
    .update(listings)
    .set({ lastConfirmedAt: new Date(Date.now() - daysAgo * 86_400_000) })
    .where(eq(listings.id, listingId));
}

export async function getE2ENotificationCount() {
  const rows = await db.select({ id: notifications.id }).from(notifications);
  return rows.length;
}
