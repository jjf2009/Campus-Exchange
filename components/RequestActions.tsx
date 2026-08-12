"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { acceptRequest, rejectRequest } from "@/actions/requests";
import { Button } from "@/components/ui/button";

interface RequestActionsProps {
  requestId: string;
  canAct: boolean;
}

export function RequestActions({ requestId, canAct }: RequestActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!canAct) return null;

  function handleAccept() {
    if (
      !confirm(
        "Accept this buyer? Other pending requests will be rejected and your WhatsApp will be shared."
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        const result = await acceptRequest(requestId);
        if (result.success) {
          toast.success("Request accepted");
          router.refresh();
        } else {
          toast.error(result.error ?? "Failed to accept");
        }
      } catch (error) {
        console.error("acceptRequest client error:", error);
        toast.error("Failed to accept. Please try again.");
      }
    });
  }

  function handleReject() {
    if (!confirm("Reject this request?")) return;
    startTransition(async () => {
      try {
        const result = await rejectRequest(requestId);
        if (result.success) {
          toast.success("Request rejected");
          router.refresh();
        } else {
          toast.error(result.error ?? "Failed to reject");
        }
      } catch (error) {
        console.error("rejectRequest client error:", error);
        toast.error("Failed to reject. Please try again.");
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={handleAccept} disabled={isPending}>
        {isPending ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Check className="mr-1.5 h-3.5 w-3.5" />
        )}
        Accept
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleReject}
        disabled={isPending}
      >
        <X className="mr-1.5 h-3.5 w-3.5" />
        Reject
      </Button>
    </div>
  );
}
