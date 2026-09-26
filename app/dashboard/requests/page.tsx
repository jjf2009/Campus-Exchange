import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ListingActions } from "@/components/ListingActions";
import { ListingStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getContactsForBuyer,
  getContactsForSeller,
} from "@/db/queries/contacts";
import { requireCompleteProfile } from "@/lib/auth";
import { getCategoryImage } from "@/lib/constants";
import { buildListingEnquiry, buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatRelativeDate } from "@/utils/formatDate";
import { formatPrice } from "@/utils/formatPrice";
import type { ListingStatus } from "@/types";

function listingThumb(imageUrl: string | null, category: string) {
  return imageUrl?.startsWith("/") ? imageUrl : getCategoryImage(category);
}

export const metadata = {
  title: "Interested buyers",
};

type SellerContact = Awaited<ReturnType<typeof getContactsForSeller>>[number];

export default async function InterestedPage() {
  const user = await requireCompleteProfile();
  const [incoming, outgoing] = await Promise.all([
    getContactsForSeller(user.id),
    getContactsForBuyer(user.id),
  ]);

  // One card per listing, with everyone who asked about it.
  const byListing = new Map<string, SellerContact[]>();
  for (const contact of incoming) {
    if (contact.listingStatus === "ARCHIVED") continue;
    const list = byListing.get(contact.listingId) ?? [];
    list.push(contact);
    byListing.set(contact.listingId, list);
  }

  return (
    <Tabs defaultValue="incoming" className="space-y-4">
      <TabsList>
        <TabsTrigger value="incoming">
          Interested in mine ({byListing.size})
        </TabsTrigger>
        <TabsTrigger value="outgoing">I contacted ({outgoing.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="incoming" className="space-y-3">
        {byListing.size === 0 ? (
          <EmptyState
            title="No interested buyers yet"
            description="When someone taps Chat on WhatsApp on your listing, they'll show up here."
          />
        ) : (
          [...byListing.values()].map((contacts) => {
            const first = contacts[0];
            const status = first.listingStatus as ListingStatus;
            return (
              <Card key={first.listingId}>
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 border-ink bg-muted">
                      <Image
                        src={listingThumb(
                          first.listingImageUrl,
                          first.listingCategory
                        )}
                        alt={first.listingTitle}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/listing/${first.listingId}`}
                          className="font-semibold hover:text-primary"
                        >
                          {first.listingTitle}
                        </Link>
                        <ListingStatusBadge status={status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(first.listingPrice)} · {contacts.length}{" "}
                        interested
                      </p>
                    </div>
                  </div>

                  <ul className="divide-y-2 divide-ink rounded-lg border-2 border-ink">
                    {contacts.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="font-medium">{c.buyerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {[c.buyerBranch, c.buyerYear]
                              .filter(Boolean)
                              .join(" · ")}
                            {" · "}
                            {formatRelativeDate(c.createdAt)}
                            {c.listingStatus === "RESERVED" &&
                            c.listingHeldBy === c.buyerId
                              ? " · 📌 on hold for them"
                              : ""}
                          </p>
                        </div>
                        {c.buyerPhone ? (
                          <Button
                            variant="outline"
                            size="sm"
                            render={
                              <a
                                href={buildWhatsAppUrl(c.buyerPhone)}
                                target="_blank"
                                rel="noopener noreferrer"
                              />
                            }
                            nativeButton={false}
                          >
                            <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                            WhatsApp
                          </Button>
                        ) : null}
                      </li>
                    ))}
                  </ul>

                  <ListingActions
                    listingId={first.listingId}
                    status={status}
                    buyers={contacts.map((c) => ({
                      id: c.buyerId,
                      name: c.buyerName,
                    }))}
                  />
                </CardContent>
              </Card>
            );
          })
        )}
      </TabsContent>

      <TabsContent value="outgoing" className="space-y-3">
        {outgoing.length === 0 ? (
          <EmptyState
            title="You haven't contacted anyone yet"
            description="Find something you need and tap Chat on WhatsApp."
            action={
              <Button render={<Link href="/marketplace" />} nativeButton={false}>
                Go to marketplace
              </Button>
            }
          />
        ) : (
          outgoing.map((c) => {
            const status = c.listingStatus as ListingStatus;
            const heldForMe =
              status === "RESERVED" && c.listingHeldBy === user.id;
            const live = heldForMe;

            return (
              <Card key={c.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">
                      <Link
                        href={`/listing/${c.listingId}`}
                        className="hover:text-primary"
                      >
                        {c.listingTitle}
                      </Link>
                    </CardTitle>
                    <ListingStatusBadge status={status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(c.listingPrice)} · Seller: {c.sellerName} ·
                    contacted {formatRelativeDate(c.createdAt)}
                  </p>

                  {status === "SOLD" ? (
                    <p className="text-sm">
                      {c.soldToUserId === user.id
                        ? "The seller marked this as sold to you. Enjoy!"
                        : "This item has been sold."}
                    </p>
                  ) : null}
                  {status === "EXPIRED" || status === "ARCHIVED" ? (
                    <p className="text-sm text-muted-foreground">
                      No longer listed.
                    </p>
                  ) : null}
                  {status === "AVAILABLE" ? (
                    <p className="text-sm font-medium">
                      Back on the marketplace.{" "}
                      <Link
                        href={`/listing/${c.listingId}`}
                        className="underline underline-offset-2"
                      >
                        Open it to chat again
                      </Link>
                    </p>
                  ) : null}
                  {heldForMe ? (
                    <p className="w-fit rounded-md border-2 border-ink bg-lime px-2 py-0.5 text-sm font-semibold">
                      📌 On hold for you. Hidden from everyone else.
                    </p>
                  ) : status === "RESERVED" ? (
                    <p className="w-fit rounded-md border-2 border-ink bg-sun px-2 py-0.5 text-sm font-semibold">
                      Someone else is talking to the seller right now.
                    </p>
                  ) : null}

                  {live && c.sellerPhone ? (
                    <Button
                      size="sm"
                      render={
                        <a
                          href={buildWhatsAppUrl(
                            c.sellerPhone,
                            buildListingEnquiry({
                              id: c.listingId,
                              title: c.listingTitle,
                              price: c.listingPrice,
                            })
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                      nativeButton={false}
                    >
                      <MessageCircle className="mr-1.5 h-4 w-4" />
                      Open WhatsApp
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            );
          })
        )}
      </TabsContent>
    </Tabs>
  );
}
