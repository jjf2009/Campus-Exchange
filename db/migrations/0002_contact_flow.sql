ALTER TYPE "public"."listing_status" RENAME VALUE 'PENDING_APPROVAL' TO 'RESERVED';--> statement-breakpoint
ALTER TYPE "public"."listing_status" ADD VALUE IF NOT EXISTS 'EXPIRED';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE IF NOT EXISTS 'NEW_CONTACT';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE IF NOT EXISTS 'CONFIRM_AVAILABILITY';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE IF NOT EXISTS 'LISTING_EXPIRED';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE IF NOT EXISTS 'LISTING_REPORTED';--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "last_confirmed_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "nudged_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "sold_to_user_id" uuid;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_sold_to_user_id_users_id_fk" FOREIGN KEY ("sold_to_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
UPDATE "listings" SET "last_confirmed_at" = "updated_at";--> statement-breakpoint
CREATE TABLE "listing_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"reported_unavailable_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "listing_contacts" ADD CONSTRAINT "listing_contacts_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_contacts" ADD CONSTRAINT "listing_contacts_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "listing_contacts_listing_buyer_idx" ON "listing_contacts" USING btree ("listing_id","buyer_id");--> statement-breakpoint
CREATE INDEX "listing_contacts_buyer_created_idx" ON "listing_contacts" USING btree ("buyer_id","created_at");--> statement-breakpoint
INSERT INTO "listing_contacts" ("listing_id", "buyer_id", "created_at")
SELECT "listing_id", "buyer_id", "created_at" FROM "purchase_requests"
ON CONFLICT DO NOTHING;
