CREATE TABLE "locations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"address" text NOT NULL,
	"neighborhood" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"latitude" text NOT NULL,
	"longitude" text NOT NULL,
	"operating_hours" json NOT NULL,
	"delivery_fee" text DEFAULT '5.99' NOT NULL,
	"delivery_zone_radius" text DEFAULT '10' NOT NULL,
	"delivery_zone_description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_temporarily_closed" boolean DEFAULT false NOT NULL,
	"closure_reason" text,
	"description" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "locations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "menu_item_locations" (
	"id" text PRIMARY KEY NOT NULL,
	"menu_item_id" text NOT NULL,
	"location_id" text NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_locations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"location_id" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_locations_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "location_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "menu_item_locations" ADD CONSTRAINT "menu_item_locations_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_locations" ADD CONSTRAINT "user_locations_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "orders_locationId_idx" ON "orders" USING btree ("location_id");