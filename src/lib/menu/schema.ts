import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  decimal,
  boolean,
  integer,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";

export const categoryEnum = pgEnum("menu_category", [
  "mains",
  "sides",
  "desserts",
  "drinks",
]);

export const dietaryTypeEnum = pgEnum("dietary_type", [
  "vegetarian",
  "vegan",
  "gluten-free",
]);

export const menuItems = pgTable(
  "menu_items",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    shortDescription: text("short_description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    image: text("image"),
    category: categoryEnum("category").notNull(),
    isAvailable: boolean("is_available").default(true).notNull(),
    remainingCount: integer("remaining_count"),
    nutritionalInfo: text("nutritional_info"),
    allergens: text("allergens"),
    featured: boolean("featured").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("menu_items_category_idx").on(table.category),
    index("menu_items_slug_idx").on(table.slug),
    index("menu_items_featured_idx").on(table.featured),
  ],
);

export const menuItemDietaryTypes = pgTable(
  "menu_item_dietary_types",
  {
    id: text("id").primaryKey(),
    menuItemId: text("menu_item_id")
      .notNull()
      .references(() => menuItems.id, { onDelete: "cascade" }),
    dietaryType: dietaryTypeEnum("dietary_type").notNull(),
  },
  (table) => [
    index("menu_item_dietary_types_menuItemId_idx").on(table.menuItemId),
  ],
);

export const menuItemsRelations = relations(menuItems, ({ many }) => ({
  dietaryTypes: many(menuItemDietaryTypes),
  customizationOptions: many(customizationOptions),
}));

export const menuItemDietaryTypesRelations = relations(
  menuItemDietaryTypes,
  ({ one }) => ({
    menuItem: one(menuItems, {
      fields: [menuItemDietaryTypes.menuItemId],
      references: [menuItems.id],
    }),
  }),
);

export const customizationOptions = pgTable(
  "customization_options",
  {
    id: text("id").primaryKey(),
    menuItemId: text("menu_item_id")
      .notNull()
      .references(() => menuItems.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull(), // "select", "multi-select", "text"
    required: boolean("required").default(false).notNull(),
    options: text("options"), // JSON array of option values
    priceModifier: decimal("price_modifier", { precision: 10, scale: 2 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("customization_options_menuItemId_idx").on(table.menuItemId),
  ],
);

export const customizationOptionsRelations = relations(
  customizationOptions,
  ({ one }) => ({
    menuItem: one(menuItems, {
      fields: [customizationOptions.menuItemId],
      references: [menuItems.id],
    }),
  }),
);
