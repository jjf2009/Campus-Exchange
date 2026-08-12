import { z } from "zod";
import { BRANCHES, CATEGORIES, CONDITIONS, YEARS } from "@/lib/constants";

/** Digits-only Indian mobile number (exactly 10). */
export const PHONE_REGEX = /^\d{10}$/;

export function normalizePhone(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\D/g, "");
}

export function isValidPhone(phone: string | null | undefined): boolean {
  return Boolean(phone && PHONE_REGEX.test(phone));
}

export const profileSchema = z.object({
  branch: z.enum(BRANCHES as [string, ...string[]], {
    error: "Please select your branch",
  }),
  year: z.enum(YEARS as [string, ...string[]], {
    error: "Please select your year",
  }),
  phone: z.preprocess(
    (value) => normalizePhone(value),
    z
      .string()
      .length(10, "Phone number must be exactly 10 digits")
      .regex(PHONE_REGEX, "Phone number must be exactly 10 digits")
  ),
});

export const listingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be under 100 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be under 2000 characters"),
  price: z.coerce
    .number({ error: "Enter a valid price" })
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
  id: z.string().uuid("Invalid listing id"),
});

export const requestSchema = z.object({
  listingId: z.string().uuid("Invalid listing id"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type ListingInput = z.infer<typeof listingSchema>;
