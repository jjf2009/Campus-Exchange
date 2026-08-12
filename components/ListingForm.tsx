"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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
import { CATEGORIES, CONDITIONS, MAX_IMAGE_SIZE } from "@/lib/constants";
import { listingSchema, validateImageFile } from "@/lib/validations";
import type { DbListing } from "@/db/schema";

interface ListingFormProps {
  mode: "create" | "edit";
  listing?: DbListing;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ListingForm({ mode, listing }: ListingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState(listing?.category ?? "");
  const [condition, setCondition] = useState(listing?.condition ?? "");
  const [fileName, setFileName] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setImageError(null);

    if (!file) {
      setFileName(null);
      return;
    }

    const result = validateImageFile(file);
    if (!result.ok) {
      setFileName(null);
      setImageError(result.error);
      toast.error(result.error);
      // Clear the input so a bad file cannot be submitted.
      event.target.value = "";
      return;
    }

    setFileName(`${file.name} (${formatBytes(file.size)})`);
  }

  function handleSubmit(formData: FormData) {
    setFieldError(null);

    if (!category) {
      const message = "Please select a category";
      setFieldError(message);
      toast.error(message);
      return;
    }

    if (!condition) {
      const message = "Please select condition";
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

    const image = formData.get("image");
    if (image instanceof File && image.size > 0) {
      const imageCheck = validateImageFile(image);
      if (!imageCheck.ok) {
        setImageError(imageCheck.error);
        toast.error(imageCheck.error);
        return;
      }
    }

    startTransition(async () => {
      try {
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
      } catch (error) {
        console.error("ListingForm submit error:", error);
        toast.error(
          "Could not save listing. If you attached a photo, try a smaller image (under 5 MB)."
        );
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6" noValidate>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={listing?.title}
          placeholder="e.g. Engineering Drawing Boiler"
          maxLength={100}
          minLength={3}
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
          minLength={10}
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
            step={1}
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
              onChange={handleImageChange}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG or WEBP up to {formatBytes(MAX_IMAGE_SIZE)}. Large images
            are blocked before upload so the app does not crash.
            {fileName ? ` Selected: ${fileName}` : null}
            {mode === "edit" && listing?.imageUrl && !fileName
              ? " Current image will be kept if you skip this."
              : null}
          </p>
          {imageError ? (
            <p className="text-xs text-destructive" role="alert">
              {imageError}
            </p>
          ) : null}
        </div>
      </div>

      {fieldError ? (
        <p className="text-sm text-destructive" role="alert">
          {fieldError}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          render={<Link href={mode === "edit" && listing ? `/listing/${listing.id}` : "/marketplace"} />}
          nativeButton={false}
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
