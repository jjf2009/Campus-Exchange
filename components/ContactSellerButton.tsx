import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_ACTIVE_HOLDS } from "@/lib/constants";

export type ContactState =
  /** Live: tapping puts it on hold and opens WhatsApp. */
  | "available"
  /** On hold for the viewer: reopen the chat. */
  | "held-by-you"
  /** On hold for someone else. */
  | "held"
  | "sold"
  | "hidden";

const ERRORS: Record<string, string> = {
  taken: "Someone else just started a chat about this item.",
  limit: `You already have ${MAX_ACTIVE_HOLDS} items on hold. Finish those deals first (or ask the seller to relist them).`,
  daily: "You've contacted a lot of sellers today. Try again tomorrow.",
  nophone: "This seller hasn't added a WhatsApp number yet.",
  own: "This is your own listing.",
};

const UNAVAILABLE: Record<Exclude<ContactState, "available" | "held-by-you">, string> = {
  held: "Someone is already talking to the seller about this. Check back later: it comes back if the deal falls through.",
  sold: "This item has been sold.",
  hidden: "This listing is hidden right now.",
};

/**
 * A plain form post (no client JS): the server puts the item on hold and
 * redirects straight to WhatsApp in a new tab.
 */
export function ContactSellerButton({
  listingId,
  state,
  error,
}: {
  listingId: string;
  state: ContactState;
  error?: string;
}) {
  const errorMessage = error ? ERRORS[error] : undefined;

  if (state !== "available" && state !== "held-by-you") {
    return (
      <div className="space-y-2">
        <Button disabled variant="outline" className="w-full" size="xl">
          {state === "held" ? "On hold" : "Unavailable"}
        </Button>
        <p className="text-sm font-medium text-muted-foreground">
          {UNAVAILABLE[state]}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {errorMessage ? (
        <p
          role="alert"
          className="rounded-lg border-2 border-ink bg-pink px-3 py-2 text-sm font-semibold"
        >
          {errorMessage}
        </p>
      ) : null}
      <form action={`/listing/${listingId}/chat`} method="post" target="_blank">
        <Button type="submit" size="xl" variant="whatsapp" className="w-full">
          <MessageCircle className="size-5" />
          {state === "held-by-you" ? "Open WhatsApp again" : "Chat on WhatsApp"}
        </Button>
      </form>
      <p className="text-sm font-medium text-muted-foreground">
        {state === "held-by-you"
          ? "📌 This item is on hold for you and hidden from everyone else."
          : "Opens WhatsApp with the seller. The item is held for you while you talk."}
      </p>
    </div>
  );
}
