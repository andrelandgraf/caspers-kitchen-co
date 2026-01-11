import { pgTable, text, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const locations = pgTable("locations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(), // e.g., "San Francisco"
  slug: text("slug").notNull().unique(), // e.g., "san-francisco"
  address: text("address").notNull(),
  neighborhood: text("neighborhood"), // e.g., "Mission District"
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),

  // Coordinates for distance calculations
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),

  // Operating hours (JSON: { monday: { open: "09:00", close: "21:00" }, ... })
  operatingHours: json("operating_hours")
    .$type<Record<string, { open: string; close: string; closed?: boolean }>>()
    .notNull(),

  // Delivery info
  deliveryFee: text("delivery_fee").notNull().default("5.99"),
  deliveryZoneRadius: text("delivery_zone_radius").notNull().default("10"), // miles
  deliveryZoneDescription: text("delivery_zone_description"), // e.g., "Downtown SF, Mission, SOMA"

  // Status
  isActive: boolean("is_active").notNull().default(true),
  isTemporarilyClosed: boolean("is_temporarily_closed")
    .notNull()
    .default(false),
  closureReason: text("closure_reason"),

  // Metadata
  description: text("description"),
  imageUrl: text("image_url"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Junction table for menu items available at specific locations
export const menuItemLocations = pgTable("menu_item_locations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  menuItemId: text("menu_item_id").notNull(),
  locationId: text("location_id")
    .notNull()
    .references(() => locations.id, { onDelete: "cascade" }),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Track user's preferred location
export const userLocations = pgTable("user_locations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id").notNull().unique(),
  locationId: text("location_id")
    .notNull()
    .references(() => locations.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
