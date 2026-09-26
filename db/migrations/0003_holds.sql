ALTER TABLE "listings" ADD COLUMN "held_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "held_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_held_by_user_id_users_id_fk" FOREIGN KEY ("held_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "listings_held_by_user_id_idx" ON "listings" USING btree ("held_by_user_id");--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "nudged_at";--> statement-breakpoint
ALTER TABLE "listing_contacts" DROP COLUMN "reported_unavailable_at";
