"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createRequest } from "@/actions/requests";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface RequestButtonProps {
  listingId: string;
  disabled?: boolean;
  disabledReason?: string;
  alreadyRequested?: boolean;
}

export function RequestButton({
  listingId,
  disabled,
  disabledReason,
  alreadyRequested,
}: RequestButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (alreadyRequested) {
    return (
      <Button disabled className="w-full sm:w-auto" size="lg">
        Request Sent
      </Button>
    );
  }

  if (disabled) {
    return (
      <div className="space-y-1">
        <Button disabled className="w-full sm:w-auto" size="lg">
          Unavailable
        </Button>
        {disabledReason ? (
          <p className="text-sm text-muted-foreground">{disabledReason}</p>
        ) : null}
      </div>
    );
  }

  function handleRequest() {
    startTransition(async () => {
      const result = await createRequest(listingId);
      if (result.success) {
        toast.success("Request sent. Waiting for seller.");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not send request");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80 sm:w-auto">
        Request Item
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request this item?</DialogTitle>
          <DialogDescription>
            The seller will see your request in their dashboard. If they accept,
            you will get their WhatsApp number to coordinate offline.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose
            render={<Button variant="outline" disabled={isPending} />}
          >
            Cancel
          </DialogClose>
          <Button onClick={handleRequest} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              "Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
