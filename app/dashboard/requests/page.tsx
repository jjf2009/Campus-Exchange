import Image from "next/image";
import Link from "next/link";
import { ExternalLink, MessageCircle, ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { RequestActions } from "@/components/RequestActions";
import { RequestStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getBuyerRequests,
  getIncomingRequests,
} from "@/db/queries/requests";
import { requireCompleteProfile } from "@/lib/auth";
import { getCategoryImage } from "@/lib/constants";
import { formatRelativeDate } from "@/utils/formatDate";
import { formatPrice } from "@/utils/formatPrice";
import type { RequestStatus } from "@/types";

function listingThumb(imageUrl: string | null, category: string) {
  return imageUrl?.startsWith("/") ? imageUrl : getCategoryImage(category);
}

export const metadata = {
  title: "Requests — GEC Exchange",
};

export default async function RequestsPage() {
  const user = await requireCompleteProfile();
  const [incoming, outgoing] = await Promise.all([
    getIncomingRequests(user.id),
    getBuyerRequests(user.id),
  ]);

  const pendingIncoming = incoming.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">Requests</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your incoming offers and track gear you want to buy.
        </p>
      </div>

      <Tabs defaultValue="incoming" className="space-y-5">
        <TabsList className="grid w-full grid-cols-2 max-w-sm rounded-xl">
          <TabsTrigger value="incoming" className="rounded-lg">
            Incoming {pendingIncoming > 0 ? `(${pendingIncoming})` : ""}
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="rounded-lg">
            My Requests ({outgoing.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Incoming Requests (Sellers checking requests) ────────────────────── */}
        <TabsContent value="incoming" className="space-y-4 outline-none">
          {incoming.length === 0 ? (
            <EmptyState
              title="No requests received yet"
              description="When a GEC student wants to buy one of your items, their request will appear here."
            />
          ) : (
            incoming.map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center"
              >
                {/* Image */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={listingThumb(
                      request.listingImageUrl,
                      request.listingCategory
                    )}
                    alt={request.listingTitle}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/listing/${request.listingId}`}
                      className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {request.listingTitle}
                    </Link>
                    <RequestStatusBadge
                      status={request.status as RequestStatus}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Buyer:{" "}
                    <strong className="font-semibold text-foreground">
                      {request.buyerName}
                    </strong>
                    {request.buyerBranch ? ` · ${request.buyerBranch}` : ""}
                    {request.buyerYear ? ` · ${request.buyerYear} Year` : ""}
                  </p>
                  <p className="text-[11px] text-muted-foreground/80">
                    {formatPrice(request.listingPrice)} ·{" "}
                    {formatRelativeDate(request.createdAt)}
                  </p>
                </div>

                {/* Accept/Decline Actions */}
                <div className="shrink-0 border-t pt-3 sm:border-t-0 sm:pt-0">
                  <RequestActions
                    requestId={request.id}
                    canAct={
                      request.status === "PENDING" &&
                      request.listingStatus === "AVAILABLE"
                    }
                  />
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* ── My Requests (Buyers tracking gear they want) ──────────────────────── */}
        <TabsContent value="outgoing" className="space-y-4 outline-none">
          {outgoing.length === 0 ? (
            <EmptyState
              title="You haven't requested anything"
              description="Find drafters, cooktops, calculators, and books on the campus."
              action={
                <Button
                  render={<Link href="/" />}
                  nativeButton={false}
                  className="gap-1.5"
                >
                  Browse Marketplace
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              }
            />
          ) : (
            outgoing.map((request) => {
              const showContact =
                request.status === "ACCEPTED" && request.sellerPhone;
              const whatsapp = request.sellerPhone
                ? `https://wa.me/${request.sellerPhone.replace(/\D/g, "")}`
                : null;

              return (
                <div
                  key={request.id}
                  className="rounded-2xl border bg-card p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Link
                        href={`/listing/${request.listingId}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {request.listingTitle}
                      </Link>
                      <RequestStatusBadge
                        status={request.status as RequestStatus}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Requested {formatRelativeDate(request.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Price:{" "}
                    <strong className="font-semibold text-foreground">
                      {formatPrice(request.listingPrice)}
                    </strong>{" "}
                    · Seller: {request.sellerName}
                  </p>

                  {/* Status descriptions */}
                  {request.status === "PENDING" ? (
                    <div className="rounded-lg bg-amber-50/70 border border-amber-100 p-3 text-xs text-amber-800">
                      Waiting for the seller to accept your request.
                    </div>
                  ) : null}

                  {request.status === "REJECTED" ? (
                    <div className="rounded-lg bg-red-50/70 border border-red-100 p-3 text-xs text-red-800">
                      The seller chose another buyer. Browse the marketplace for alternatives.
                    </div>
                  ) : null}

                  {showContact ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                          Seller Contact Unlocked
                        </p>
                        <p className="mt-1 text-base font-bold text-emerald-950">
                          {request.sellerName} · +91 {request.sellerPhone}
                        </p>
                      </div>
                      {whatsapp ? (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                          render={
                            <a
                              href={whatsapp}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          }
                          nativeButton={false}
                        >
                          <MessageCircle className="h-4 w-4" aria-hidden="true" />
                          Chat on WhatsApp
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
