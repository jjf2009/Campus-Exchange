import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { listingContacts, listings, users } from "@/db/schema";
import {
  countActiveHolds,
  countRecentContactsByBuyer,
  getContact,
} from "@/db/queries/contacts";
import { requireCompleteProfile } from "@/lib/auth";
import { MAX_ACTIVE_HOLDS, MAX_CONTACTS_PER_DAY } from "@/lib/constants";
import { requestSchema } from "@/lib/validations";
import { buildListingEnquiry, buildWhatsAppUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

type ChatError = "own" | "taken" | "limit" | "daily" | "nophone";

/** 303 so the browser follows with a GET. Relative to keep the same host. */
function seeOther(location: string) {
  return new NextResponse(null, { status: 303, headers: { Location: location } });
}

/**
 * "Chat on WhatsApp": puts the listing on hold for this buyer (hiding it from
 * the marketplace) and sends them straight to WhatsApp. No notifications:
 * the pre-filled message tells the seller how to relist if the deal fails.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireCompleteProfile();
  const { id } = await params;
  const back = (error: ChatError) => seeOther(`/listing/${id}?error=${error}`);

  if (!requestSchema.safeParse({ listingId: id }).success) {
    return seeOther("/marketplace");
  }

  const [listing] = await db
    .select({
      id: listings.id,
      title: listings.title,
      price: listings.price,
      status: listings.status,
      sellerId: listings.sellerId,
      heldByUserId: listings.heldByUserId,
      sellerPhone: users.phone,
    })
    .from(listings)
    .innerJoin(users, eq(listings.sellerId, users.id))
    .where(eq(listings.id, id))
    .limit(1);

  if (!listing) return seeOther("/marketplace");
  if (listing.sellerId === user.id) return back("own");
  if (!listing.sellerPhone) return back("nophone");

  const whatsapp = seeOther(
    buildWhatsAppUrl(listing.sellerPhone, buildListingEnquiry(listing))
  );

  // Already on hold for this buyer: just reopen the chat.
  if (listing.status === "RESERVED" && listing.heldByUserId === user.id) {
    return whatsapp;
  }

  if (listing.status !== "AVAILABLE") return back("taken");

  if (!(await getContact(id, user.id))) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if ((await countRecentContactsByBuyer(user.id, since)) >= MAX_CONTACTS_PER_DAY) {
      return back("daily");
    }
  }

  if ((await countActiveHolds(user.id, id)) >= MAX_ACTIVE_HOLDS) {
    return back("limit");
  }

  const held = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(listings)
      .set({
        status: "RESERVED",
        heldByUserId: user.id,
        heldAt: new Date(),
        updatedAt: new Date(),
      })
      // Only one buyer can win if two tap at the same moment.
      .where(and(eq(listings.id, id), eq(listings.status, "AVAILABLE")))
      .returning({ id: listings.id });

    if (row) {
      await tx
        .insert(listingContacts)
        .values({ listingId: id, buyerId: user.id })
        .onConflictDoNothing();
    }
    return Boolean(row);
  });

  if (!held) return back("taken");

  revalidatePath("/marketplace");
  revalidatePath(`/listing/${id}`);
  revalidatePath("/dashboard");

  return whatsapp;
}
