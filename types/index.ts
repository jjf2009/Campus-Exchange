export type ListingStatus =
  "AVAILABLE" | "RESERVED" | "SOLD" | "ARCHIVED" | "EXPIRED";

export type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type NotificationType =
  | "NEW_REQUEST"
  | "REQUEST_ACCEPTED"
  | "REQUEST_REJECTED"
  | "LISTING_SOLD"
  | "NEW_CONTACT"
  | "CONFIRM_AVAILABILITY"
  | "LISTING_EXPIRED"
  | "LISTING_REPORTED";

export interface NotificationData {
  href?: string;
  [key: string]:
    string | number | boolean | null | undefined | NotificationData;
}

export type Branch =
  | "Computer"
  | "Information Technology"
  | "Electronics & Telecommunication"
  | "Electrical"
  | "Mechanical"
  | "Civil"
  | "Mining"
  | "VLSI";

export type Year = "First Year" | "Second Year" | "Third Year" | "Final Year";

export type Condition = "New" | "Like New" | "Good" | "Fair" | "Poor";

export type Category =
  | "Boiler"
  | "Bomber"
  | "Drafter"
  | "Calculator"
  | "Mattress"
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

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: NotificationData;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NavbarNotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  href: string;
  isRead: boolean;
  createdAt: string;
}

export interface NavbarNotificationSummary {
  unreadCount: number;
  items: NavbarNotificationItem[];
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
