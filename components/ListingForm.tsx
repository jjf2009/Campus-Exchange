"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Package, Tag, Type, AlignLeft } from "lucide-react";
import { toast } from "sonner";
import { createListing, updateListing } from "@/actions/listings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, CONDITIONS, getCategoryImage } from "@/lib/constants";
import { listingSchema } from "@/lib/validations";
import type { DbListing } from "@/db/schema";

interface ListingFormProps {
  mode: "create" | "edit";
  listing?: DbListing;
}

const CONDITION_HINTS: Record<string, string> = {
  "Brand New": "Unused, still in packaging",
  "Like New": "Used once or twice, no wear",
  Good: "Light signs of use, fully functional",
  Fair: "Visible wear, works fine",
  Poor: "Heavy wear, functional with caveats",
};

export function ListingForm({ mode, listing }: ListingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState(listing?.category ?? "");
  const [condition, setCondition] = useState(listing?.condition ?? "");
  const [fieldError, setFieldError] = useState<string | null>(null);

  const previewImage = category ? getCategoryImage(category) : null;

  function handleSubmit(formData: FormData) {
    setFieldError(null);

    if (!category) {
      const message = "Please select a category";
      setFieldError(message);
      toast.error(message);
      return;
    }

    if (!condition) {
      const message = "Please select a condition";
      setFieldError(message);
      toast.error(message);
      return;
    }

    formData.set("category", category);
    formData.set("condition", condition);
    if (listing) {
      formData.set("id", listing.id);
    }

    const clientParsed = listingSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      price: formData.get("price"),
      category,
      condition,
    });

    if (!clientParsed.success) {
      const message =
        clientParsed.error.issues[0]?.message ?? "Please fix the form errors";
      setFieldError(message);
      toast.error(message);
      return;
    }

    startTransition(async () => {
      try {
        const result =
          mode === "create"
            ? await createListing(formData)
            : await updateListing(formData);

        if (result.success) {
          toast.success(
            mode === "create"
              ? "Listing live! Buyers can now see it."
              : "Changes saved."
          );
          if (mode === "create" && result.data?.id) {
            router.push(`/listing/${result.data.id}`);
          } else if (listing) {
            router.push(`/listing/${listing.id}`);
          } else {
            router.push("/dashboard/listings");
          }
          router.refresh();
        } else {
          toast.error(result.error ?? "Something went wrong");
        }
      } catch (error) {
        console.error("ListingForm submit error:", error);
        toast.error("Couldn't save listing. Please try again.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-8" noValidate>
      {/* ── Step 1: What are you selling? ───────────────────────── */}
      <FormSection
        number="1"
        title="What are you selling?"
        hint="Use a specific title — e.g. 'Casio fx-991 Scientific Calculator'"
      >
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Title
            <span className="text-destructive ml-1" aria-hidden="true">*</span>
          </Label>
          <div className="relative">
            <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <Input
              id="title"
              name="title"
              required
              defaultValue={listing?.title}
              placeholder="e.g. Engineering Drawing Boiler, Casio Calculator…"
              maxLength={100}
              minLength={3}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Description
            <span className="text-destructive ml-1" aria-hidden="true">*</span>
          </Label>
          <div className="relative">
            <AlignLeft className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <Textarea
              id="description"
              name="description"
              required
              defaultValue={listing?.description}
              placeholder="Condition details, what's included, hostel block, how to collect, anything a buyer needs to know…"
              rows={4}
              maxLength={2000}
              minLength={10}
              className="pl-9 resize-none"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            More detail = faster deal. Mention accessories, defects, hostel location.
          </p>
        </div>
      </FormSection>

      {/* ── Step 2: Price + Category ─────────────────────────────── */}
      <FormSection
        number="2"
        title="Price and category"
        hint="Set a fair price — batchmates are your buyers, not strangers."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium">
              Price (₹)
              <span className="text-destructive ml-1" aria-hidden="true">*</span>
            </Label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
              <Input
                id="price"
                name="price"
                type="number"
                required
                min={1}
                max={500000}
                step={1}
                defaultValue={listing?.price}
                placeholder="850"
                className="pl-9"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Category
              <span className="text-destructive ml-1" aria-hidden="true">*</span>
            </Label>
            <Select
              value={category || null}
              onValueChange={(value) => setCategory(value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Condition
              <span className="text-destructive ml-1" aria-hidden="true">*</span>
            </Label>
            <Select
              value={condition || null}
              onValueChange={(value) => setCondition(value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    <div>
                      <span className="font-medium">{c}</span>
                      {CONDITION_HINTS[c] ? (
                        <span className="ml-2 text-xs text-muted-foreground">
                          — {CONDITION_HINTS[c]}
                        </span>
                      ) : null}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {condition && CONDITION_HINTS[condition] ? (
              <p className="text-xs text-muted-foreground">
                {CONDITION_HINTS[condition]}
              </p>
            ) : null}
          </div>

          {/* Photo preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Photo preview
            </Label>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt={category ? `${category} — stock photo` : "Category preview"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 300px"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground">
                  <Package className="h-9 w-9 opacity-30" aria-hidden="true" />
                  <p className="text-xs leading-snug">
                    Select a category to see its photo
                  </p>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Photos are shared per category — no upload needed.
            </p>
          </div>
        </div>
      </FormSection>

      {/* ── Error banner ────────────────────────────────────────── */}
      {fieldError ? (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {fieldError}
        </div>
      ) : null}

      {/* ── Actions ─────────────────────────────────────────────── */}
      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          render={
            <Link
              href={
                mode === "edit" && listing
                  ? `/listing/${listing.id}`
                  : "/"
              }
            />
          }
          nativeButton={false}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending || !category || !condition}
          className="gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {mode === "create" ? "Publishing…" : "Saving…"}
            </>
          ) : (
            <>
              {mode === "create" ? "Publish listing" : "Save changes"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

/* ── FormSection wrapper ─────────────────────────────────────────────── */
function FormSection({
  number,
  title,
  hint,
  children,
}: {
  number: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-[200px_1fr]">
      {/* Step label — sidebar on desktop, inline on mobile */}
      <div className="sm:pt-1">
        <div className="flex items-center gap-2 sm:block">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {number}
          </span>
          <h2 className="text-sm font-semibold text-foreground sm:mt-2">
            {title}
          </h2>
        </div>
        {hint && (
          <p className="mt-1 hidden text-xs leading-relaxed text-muted-foreground sm:block">
            {hint}
          </p>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-5">{children}</div>
    </div>
  );
}
