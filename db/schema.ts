import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const listingStatusEnum = pgEnum("listing_status", [
  "AVAILABLE",
  "PENDING_APPROVAL",
  "SOLD",
  "ARCHIVED",
]);

export const requestStatusEnum = pgEnum("request_status", [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  branch: text("branch"),
  year: text("year"),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const listings = pgTable(
  "listings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    price: integer("price").notNull(),
    category: text("category").notNull(),
    condition: text("condition").notNull(),
    imageUrl: text("image_url"),
    status: listingStatusEnum("status").notNull().default("AVAILABLE"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("listings_seller_id_idx").on(table.sellerId),
    index("listings_status_idx").on(table.status),
    index("listings_category_idx").on(table.category),
    index("listings_title_idx").on(table.title),
  ]
);

export const purchaseRequests = pgTable(
  "purchase_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    buyerId: uuid("buyer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: requestStatusEnum("status").notNull().default("PENDING"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("purchase_requests_listing_id_idx").on(table.listingId),
    index("purchase_requests_buyer_id_idx").on(table.buyerId),
    index("purchase_requests_status_idx").on(table.status),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  purchaseRequests: many(purchaseRequests),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  seller: one(users, {
    fields: [listings.sellerId],
    references: [users.id],
  }),
  purchaseRequests: many(purchaseRequests),
}));

export const purchaseRequestsRelations = relations(
  purchaseRequests,
  ({ one }) => ({
    listing: one(listings, {
      fields: [purchaseRequests.listingId],
      references: [listings.id],
    }),
    buyer: one(users, {
      fields: [purchaseRequests.buyerId],
      references: [users.id],
    }),
  })
);

export type DbUser = typeof users.$inferSelect;
export type NewDbUser = typeof users.$inferInsert;
export type DbListing = typeof listings.$inferSelect;
export type NewDbListing = typeof listings.$inferInsert;
export type DbPurchaseRequest = typeof purchaseRequests.$inferSelect;
export type NewDbPurchaseRequest = typeof purchaseRequests.$inferInsert;
