export type ListingStatus =
  | "AVAILABLE"
  | "PENDING_APPROVAL"
  | "SOLD"
  | "ARCHIVED";

export type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type Branch =
  | "Computer"
  | "Information Technology"
  | "Electronics & Telecommunication"
  | "Electrical"
  | "Mechanical"
  | "Civil"
  | "Mining"
  | "VLSI";

export type Year =
  | "First Year"
  | "Second Year"
  | "Third Year"
  | "Final Year";

export type Condition = "New" | "Like New" | "Good" | "Fair" | "Poor";

export type Category =
  | "Boiler"
  | "Bomber"
  | "Drafter"
  | "Mini Drafter"
  | "Drawing Kit"
  | "Books"
  | "Laptop"
  | "Calculator"
  | "Monitor"
  | "Keyboard"
  | "Mouse"
  | "Chair"
  | "Mattress"
  | "Bucket"
  | "Table"
  | "Cooler"
  | "Fan"
  | "Induction"
  | "Others";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  branch: Branch | null;
  year: Year | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  condition: Condition;
  imageUrl: string | null;
  status: ListingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseRequest {
  id: string;
  listingId: string;
  buyerId: string;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListingWithSeller extends Listing {
  seller: Pick<User, "id" | "name" | "branch" | "year" | "avatarUrl">;
}

export interface RequestWithDetails extends PurchaseRequest {
  listing: Listing;
  buyer: Pick<User, "id" | "name" | "branch" | "year" | "avatarUrl">;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
