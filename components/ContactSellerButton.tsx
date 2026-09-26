"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { contactSeller, reportUnavailable } from "@/actions/contacts";
import { Button } from "@/components/ui/button";

interface ContactSellerButtonProps {
  listingId: string;
  /** False when the listing is sold/hidden. */
  available: boolean;
  unavailableReason?: string;
  /** The viewer already contacted this seller. */
  contacted: boolean;
  /** The viewer already reported the item as gone. */
  reported: boolean;
}

export function ContactSellerButton({
  listingId,
  available,
  unavailableReason,
  contacted,
  reported,
}: ContactSellerButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [hasReported, setHasReported] = useState(reported);

  if (!available) {
    return (
      <div className="space-y-1">
        <Button disabled className="w-full sm:w-auto" size="lg">
          Unavailable
        </Button>
        {unavailableReason ? (
          <p className="text-sm text-muted-foreground">{unavailableReason}</p>
        ) : null}
      </div>
    );
  }

  function handleContact() {
    // Open the tab synchronously so popup blockers allow it, then point it
    // at WhatsApp once the server has recorded the contact.
    const tab = window.open("", "_blank");
    startTransition(async () => {
      try {
        const result = await contactSeller(listingId);
        if (result.success && result.data) {
          if (tab) {
            tab.opener = null;
            tab.location.href = result.data.url;
          } else {
            window.location.href = result.data.url;
          }
          router.refresh();
        } else {
          tab?.close();
          toast.error(result.error ?? "Could not open the chat");
        }
      } catch (error) {
        tab?.close();
        console.error("contactSeller client error:", error);
        toast.error("Could not open the chat. Please try again.");
      }
    });
  }

  function handleReport() {
    if (!confirm("Did the seller tell you this item is already sold?")) return;
    startTransition(async () => {
      try {
        const result = await reportUnavailable(listingId);
        if (result.success) {
          setHasReported(true);
          toast.success("Thanks! We'll check with the seller.");
          router.refresh();
        } else {
          toast.error(result.error ?? "Could not send the report");
        }
      } catch (error) {
        console.error("reportUnavailable client error:", error);
        toast.error("Could not send the report. Please try again.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button
        size="lg"
        className="w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
        onClick={handleContact}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <MessageCircle className="mr-2 h-4 w-4" />
        )}
        {contacted ? "Chat again on WhatsApp" : "Chat on WhatsApp"}
      </Button>
      {contacted ? (
        hasReported ? (
          <p className="text-sm text-muted-foreground">
            You reported this as sold. We&apos;ve asked the seller to confirm.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Seller said it&apos;s gone?{" "}
            <button
              type="button"
              onClick={handleReport}
              disabled={isPending}
              className="font-medium text-foreground underline underline-offset-2"
            >
              Report as sold
            </button>
          </p>
        )
      ) : (
        <p className="text-sm text-muted-foreground">
          Opens WhatsApp with a message about this item. Pay and pick up in
          person.
        </p>
      )}
    </div>
  );
}
