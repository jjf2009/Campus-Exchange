import type { Branch, Category, Condition, Year } from "@/types";

export const APP_NAME = "GEC Exchange";
export const APP_DESCRIPTION ="Campus marketplace for Goa College of Engineering students to buy and sell used academic equipment.";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

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
  Hostel: ["Mattress", "Cooler","Fan", "Induction"] as Category[],
  Others: ["Others"] as Category[],
} as const;

export const LISTING_IMAGE_BUCKET = "listing-images";
