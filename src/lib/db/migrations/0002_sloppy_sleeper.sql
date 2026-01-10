CREATE TYPE "public"."menu_category" AS ENUM('mains', 'sides', 'desserts', 'drinks');--> statement-breakpoint
CREATE TYPE "public"."dietary_type" AS ENUM('vegetarian', 'vegan', 'gluten-free');--> statement-breakpoint
CREATE TABLE "customization_options" (
	"id" text PRIMARY KEY NOT NULL,
	"menu_item_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"options" text,
	"price_modifier" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_item_dietary_types" (
	"id" text PRIMARY KEY NOT NULL,
	"menu_item_id" text NOT NULL,
	"dietary_type" "dietary_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"short_description" text,
	"price" numeric(10, 2) NOT NULL,
	"image" text,
	"category" "menu_category" NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"remaining_count" integer,
	"nutritional_info" text,
	"allergens" text,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "menu_items_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "customization_options" ADD CONSTRAINT "customization_options_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_item_dietary_types" ADD CONSTRAINT "menu_item_dietary_types_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customization_options_menuItemId_idx" ON "customization_options" USING btree ("menu_item_id");--> statement-breakpoint
CREATE INDEX "menu_item_dietary_types_menuItemId_idx" ON "menu_item_dietary_types" USING btree ("menu_item_id");--> statement-breakpoint
CREATE INDEX "menu_items_category_idx" ON "menu_items" USING btree ("category");--> statement-breakpoint
CREATE INDEX "menu_items_slug_idx" ON "menu_items" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "menu_items_featured_idx" ON "menu_items" USING btree ("featured");