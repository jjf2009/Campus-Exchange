import { z } from "zod";
import {
  BRANCHES,
  CATEGORIES,
  CONDITIONS,
  MAX_IMAGE_SIZE,
  YEARS,
} from "@/lib/constants";

export const profileSchema = z.object({
  branch: z.enum(BRANCHES as [string, ...string[]], {
    error: "Please select your branch",
  }),
  year: z.enum(YEARS as [string, ...string[]], {
    error: "Please select your year",
  }),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long")
    .regex(/^[+]?[\d\s-]+$/, "Enter a valid phone number"),
});

export const listingSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be under 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be under 2000 characters"),
  price: z.coerce
    .number()
    .int("Price must be a whole number")
    .min(1, "Price must be at least ₹1")
    .max(500000, "Price is too high"),
  category: z.enum(CATEGORIES as [string, ...string[]], {
    error: "Please select a category",
  }),
  condition: z.enum(CONDITIONS as [string, ...string[]], {
    error: "Please select condition",
  }),
});

export const updateListingSchema = listingSchema.partial().extend({
  id: z.string().uuid(),
});

export const requestSchema = z.object({
  listingId: z.string().uuid(),
});

export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_IMAGE_SIZE, "Image must be under 5 MB")
  .refine(
    (file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    "Only JPEG, PNG, and WEBP images are allowed"
  );

export type ProfileInput = z.infer<typeof profileSchema>;
export type ListingInput = z.infer<typeof listingSchema>;
