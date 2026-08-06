import Image from "next/image";
import Link from "next/link";
import { ExternalLink, MessageCircle, Package } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { RequestActions } from "@/components/RequestActions";
import { RequestStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getBuyerRequests,
  getIncomingRequests,
} from "@/db/queries/requests";
import { requireCompleteProfile } from "@/lib/auth";
import { formatRelativeDate } from "@/utils/formatDate";
import { formatPrice } from "@/utils/formatPrice";
import type { RequestStatus } from "@/types";

export const metadata = {
  title: "Requests",
};

export default async function RequestsPage() {
  const user = await requireCompleteProfile();
  const [incoming, outgoing] = await Promise.all([
    getIncomingRequests(user.id),
    getBuyerRequests(user.id),
  ]);

  return (
    <Tabs defaultValue="incoming" className="space-y-4">
      <TabsList>
        <TabsTrigger value="incoming">
          Incoming ({incoming.filter((r) => r.status === "PENDING").length})
        </TabsTrigger>
        <TabsTrigger value="outgoing">My requests ({outgoing.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="incoming" className="space-y-3">
        {incoming.length === 0 ? (
          <EmptyState
            title="No incoming requests"
            description="When someone requests your listings, they will show up here."
          />
        ) : (
          incoming.map((request) => (
            <Card key={request.id}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {request.listingImageUrl ? (
                    <Image
                      src={request.listingImageUrl}
                      alt={request.listingTitle}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-6 w-6 opacity-40" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/listing/${request.listingId}`}
                      className="font-semibold hover:text-primary"
                    >
                      {request.listingTitle}
                    </Link>
                    <RequestStatusBadge
                      status={request.status as RequestStatus}
                    />
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">{request.buyerName}</span>
                    {request.buyerBranch ? ` · ${request.buyerBranch}` : ""}
                    {request.buyerYear ? ` · ${request.buyerYear}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(request.listingPrice)} ·{" "}
                    {formatRelativeDate(request.createdAt)}
                  </p>
                </div>
                <RequestActions
                  requestId={request.id}
                  canAct={
                    request.status === "PENDING" &&
                    request.listingStatus === "AVAILABLE"
                  }
                />
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="outgoing" className="space-y-3">
        {outgoing.length === 0 ? (
          <EmptyState
            title="No requests yet"
            description="Browse the marketplace and request items you need."
            action={
              <Button render={<Link href="/marketplace" />} nativeButton={false}>
              Go to marketplace
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
              <Card key={request.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">
                      <Link
                        href={`/listing/${request.listingId}`}
                        className="hover:text-primary"
                      >
                        {request.listingTitle}
                      </Link>
                    </CardTitle>
                    <RequestStatusBadge
                      status={request.status as RequestStatus}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(request.listingPrice)} · Seller:{" "}
                    {request.sellerName} · {formatRelativeDate(request.createdAt)}
                  </p>

                  {request.status === "PENDING" ? (
                    <p className="text-sm text-amber-700">
                      Waiting for the seller to respond.
                    </p>
                  ) : null}

                  {request.status === "REJECTED" ? (
                    <p className="text-sm text-destructive">
                      Seller rejected your request.
                    </p>
                  ) : null}

                  {showContact ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-sm font-semibold text-emerald-900">
                        Contact unlocked
                      </p>
                      <p className="mt-1 text-sm text-emerald-800">
                        {request.sellerName} · {request.sellerPhone}
                      </p>
                      {whatsapp ? (
                        <Button
                          size="sm"
                          className="mt-3"
                          render={
                            <a
                              href={whatsapp}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          }
                          nativeButton={false}
                        >
                          <MessageCircle className="mr-1.5 h-4 w-4" />
                          Open WhatsApp
                          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      ) : null}
                    </div>
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
