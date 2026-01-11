import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  decimal,
  integer,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { menuItems } from "@/lib/menu/schema";
import { users } from "@/lib/auth/schema";

export const orderStatus = pgEnum("order_status", [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);

export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "processing",
  "succeeded",
  "failed",
  "refunded",
]);

export const paymentMethod = pgEnum("payment_method", [
  "card",
  "cash",
  "gift_card",
]);

export const deliveryType = pgEnum("delivery_type", ["delivery", "pickup"]);

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    orderNumber: text("order_number").notNull().unique(), // Human-readable order number
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    // Guest user info
    guestEmail: text("guest_email"),
    guestName: text("guest_name"),
    guestPhone: text("guest_phone"),

    // Order status
    status: orderStatus("status").notNull().default("pending"),

    // Pricing
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 })
      .notNull()
      .default("5.99"),
    taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
    taxRate: decimal("tax_rate", { precision: 5, scale: 4 })
      .notNull()
      .default("0.0875"), // 8.75%
    discountAmount: decimal("discount_amount", {
      precision: 10,
      scale: 2,
    }).default("0"),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),

    // Delivery details
    deliveryType: deliveryType("delivery_type").notNull().default("delivery"),
    deliveryAddress: text("delivery_address").notNull(),
    deliveryCity: text("delivery_city").notNull(),
    deliveryState: text("delivery_state").notNull(),
    deliveryZip: text("delivery_zip").notNull(),
    deliveryInstructions: text("delivery_instructions"),

    // Timing
    scheduledFor: timestamp("scheduled_for"), // null = ASAP
    estimatedDeliveryTime: timestamp("estimated_delivery_time"),

    // Payment
    paymentMethod: paymentMethod("payment_method").notNull(),
    paymentStatus: paymentStatus("payment_status").notNull().default("pending"),
    paymentIntentId: text("payment_intent_id"), // Stripe payment intent ID

    // Promo code
    promoCode: text("promo_code"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("orders_userId_idx").on(table.userId),
    index("orders_status_idx").on(table.status),
    index("orders_createdAt_idx").on(table.createdAt),
    index("orders_guestEmail_idx").on(table.guestEmail),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    menuItemId: text("menu_item_id")
      .notNull()
      .references(() => menuItems.id, { onDelete: "restrict" }),

    // Snapshot item details (in case menu item changes later)
    itemName: text("item_name").notNull(),
    itemDescription: text("item_description"),

    quantity: integer("quantity").notNull().default(1),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),

    customizations: text("customizations"), // JSON string of customizations

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("order_items_orderId_idx").on(table.orderId),
    index("order_items_menuItemId_idx").on(table.menuItemId),
  ],
);

export const promoCodes = pgTable(
  "promo_codes",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(),
    description: text("description"),

    // Discount
    discountType: text("discount_type").notNull(), // "percentage" | "fixed"
    discountValue: decimal("discount_value", {
      precision: 10,
      scale: 2,
    }).notNull(),

    // Constraints
    minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }),
    maxDiscountAmount: decimal("max_discount_amount", {
      precision: 10,
      scale: 2,
    }),

    // Usage limits
    usageLimit: integer("usage_limit"), // null = unlimited
    usageCount: integer("usage_count").notNull().default(0),

    // Validity
    validFrom: timestamp("valid_from").notNull(),
    validUntil: timestamp("valid_until"),

    active: integer("active").notNull().default(1), // 1 = active, 0 = inactive

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("promo_codes_code_idx").on(table.code),
    index("promo_codes_active_idx").on(table.active),
  ],
);

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));

export type Order = typeof orders.$inferSelect;
export type OrderInsert = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderItemInsert = typeof orderItems.$inferInsert;
export type PromoCode = typeof promoCodes.$inferSelect;
export type PromoCodeInsert = typeof promoCodes.$inferInsert;
