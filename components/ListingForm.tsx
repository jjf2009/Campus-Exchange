"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
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
import { CATEGORIES, CONDITIONS } from "@/lib/constants";
import type { DbListing } from "@/db/schema";

interface ListingFormProps {
  mode: "create" | "edit";
  listing?: DbListing;
}

export function ListingForm({ mode, listing }: ListingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState(listing?.category ?? "");
  const [condition, setCondition] = useState(listing?.condition ?? "");
  const [fileName, setFileName] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    formData.set("category", category);
    formData.set("condition", condition);
    if (listing) {
      formData.set("id", listing.id);
    }

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createListing(formData)
          : await updateListing(formData);

      if (result.success) {
        toast.success(
          mode === "create" ? "Listing created!" : "Listing updated!"
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
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={listing?.title}
          placeholder="e.g. Engineering Drawing Boiler"
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={listing?.description}
          placeholder="Condition details, included accessories, hostel block, etc."
          rows={5}
          maxLength={2000}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            required
            min={1}
            max={500000}
            defaultValue={listing?.price}
            placeholder="850"
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
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

        <div className="space-y-2">
          <Label>Condition</Label>
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
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Photo {mode === "edit" ? "(optional)" : ""}</Label>
          <div className="relative">
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="cursor-pointer"
              onChange={(e) =>
                setFileName(e.target.files?.[0]?.name ?? null)
              }
            />
          </div>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG or WEBP up to 5 MB.
            {fileName ? ` Selected: ${fileName}` : null}
            {mode === "edit" && listing?.imageUrl && !fileName
              ? " Current image will be kept if you skip this."
              : null}
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending || !category || !condition}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === "create" ? "Publishing…" : "Saving…"}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {mode === "create" ? "Publish Listing" : "Save Changes"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
