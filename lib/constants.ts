import type { Branch, Category, Condition, Year } from "@/types";

export const APP_NAME = "GEC Exchange";
export const APP_DESCRIPTION =
  "Campus marketplace for Goa College of Engineering students to buy and sell used academic equipment.";

export const DEFAULT_PAGE_SIZE = 20;

export const BRANCHES: Branch[] = [
  "Computer",
  "Information Technology",
  "Electronics & Telecommunication",
  "Electrical",
  "Mechanical",
  "Civil",
  "Mining",
  "VLSI"
];

export const YEARS: Year[] = [
  "First Year",
  "Second Year",
  "Third Year",
  "Final Year",
];

export const CONDITIONS: Condition[] = [
  "New",
  "Like New",
  "Good",
  "Fair",
  "Poor",
];

export const CATEGORIES: Category[] = [
  "Boiler",
  "Bomber",
  "Drafter",
  "Calculator",
  "Mattress",
  "Cooler",
  "Fan",
  "Induction",
  "Others",
];

export const CATEGORY_GROUPS = {
  Academic: ["Boiler", "Bomber", "Drafter"] as Category[],
  Electronics: ["Calculator"] as Category[],
  Hostel: ["Mattress", "Cooler", "Fan", "Induction"] as Category[],
  Others: ["Others"] as Category[],
} as const;

/** Static images in /public — one per category (no user uploads). */
export const CATEGORY_IMAGES: Record<Category, string> = {
  Boiler: "/Boiler_suit.jpg",
  Bomber: "/bomber.jpg",
  Drafter: "/drafter.jpg",
  Calculator: "/calculator.jpg",
  Mattress: "/mattress.jpg",
  Cooler: "/cooler.jpg",
  Fan: "/fan.jpg",
  Induction: "/induction.jpg",
  Others: "/other.png",
};

export function getCategoryImage(category: string | null | undefined): string {
  if (category && category in CATEGORY_IMAGES) {
    return CATEGORY_IMAGES[category as Category];
  }
  return CATEGORY_IMAGES.Others;
}

export const LISTING_IMAGE_BUCKET = "listing-images";
