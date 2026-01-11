import { db } from "@/lib/db/client";
import { orders, orderItems, promoCodes } from "./schema";
import { eq, and, desc, gte, lte, or, sql } from "drizzle-orm";
import { carts, cartItems } from "@/lib/cart/schema";
import { menuItems } from "@/lib/menu/schema";
import { nanoid } from "nanoid";

export interface CreateOrderInput {
  userId?: string;
  guestEmail?: string;
  guestName?: string;
  guestPhone?: string;
  cartId: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
  deliveryInstructions?: string;
  scheduledFor?: Date;
  paymentMethod: "card" | "cash" | "gift_card";
  paymentIntentId?: string;
  promoCode?: string;
}

function generateOrderNumber(): string {
  // Generate a readable order number like CK-20240110-1234
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `CK-${year}${month}${day}-${random}`;
}

export async function calculateOrderTotals(cartId: string, promoCode?: string) {
  // Get cart items
  const cart = await db.query.carts.findFirst({
    where: eq(carts.id, cartId),
    with: {
      items: {
        with: {
          menuItem: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // Calculate subtotal
  const subtotal = cart.items.reduce((sum, item) => {
    return sum + Number(item.unitPrice) * item.quantity;
  }, 0);

  // Delivery fee (could be dynamic based on location)
  const deliveryFee = 5.99;

  // Apply promo code discount
  let discountAmount = 0;
  let validPromoCode: typeof promoCodes.$inferSelect | null = null;

  if (promoCode) {
    const promo = await validatePromoCode(promoCode, subtotal);
    if (promo) {
      validPromoCode = promo;
      if (promo.discountType === "percentage") {
        discountAmount = (subtotal * Number(promo.discountValue)) / 100;
        if (
          promo.maxDiscountAmount &&
          discountAmount > Number(promo.maxDiscountAmount)
        ) {
          discountAmount = Number(promo.maxDiscountAmount);
        }
      } else {
        discountAmount = Number(promo.discountValue);
      }
    }
  }

  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxRate = 0.0875; // 8.75%
  const taxAmount = subtotalAfterDiscount * taxRate;
  const total = subtotalAfterDiscount + deliveryFee + taxAmount;

  return {
    subtotal: subtotal.toFixed(2),
    deliveryFee: deliveryFee.toFixed(2),
    discountAmount: discountAmount.toFixed(2),
    taxRate: taxRate.toFixed(4),
    taxAmount: taxAmount.toFixed(2),
    total: total.toFixed(2),
    promoCode: validPromoCode,
  };
}

export async function validatePromoCode(code: string, orderSubtotal: number) {
  const promo = await db.query.promoCodes.findFirst({
    where: and(
      eq(promoCodes.code, code.toUpperCase()),
      eq(promoCodes.active, 1),
    ),
  });

  if (!promo) {
    return null;
  }

  const now = new Date();

  // Check validity period
  if (promo.validFrom && new Date(promo.validFrom) > now) {
    return null;
  }
  if (promo.validUntil && new Date(promo.validUntil) < now) {
    return null;
  }

  // Check usage limit
  if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
    return null;
  }

  // Check minimum order amount
  if (promo.minOrderAmount && orderSubtotal < Number(promo.minOrderAmount)) {
    return null;
  }

  return promo;
}

export async function createOrder(input: CreateOrderInput) {
  const orderId = nanoid();
  const orderNumber = generateOrderNumber();

  // Calculate totals
  const totals = await calculateOrderTotals(input.cartId, input.promoCode);

  // Get cart items for order items
  const cart = await db.query.carts.findFirst({
    where: eq(carts.id, input.cartId),
    with: {
      items: {
        with: {
          menuItem: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // Estimate delivery time (45-60 minutes from now)
  const estimatedMinutes = 45 + Math.floor(Math.random() * 15);
  const estimatedDeliveryTime = new Date(Date.now() + estimatedMinutes * 60000);

  // Create order
  await db.transaction(async (tx) => {
    // Insert order
    await tx.insert(orders).values({
      id: orderId,
      orderNumber,
      userId: input.userId,
      guestEmail: input.guestEmail,
      guestName: input.guestName,
      guestPhone: input.guestPhone,
      status: "pending",
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      taxAmount: totals.taxAmount,
      taxRate: totals.taxRate,
      discountAmount: totals.discountAmount,
      total: totals.total,
      deliveryType: "delivery",
      deliveryAddress: input.deliveryAddress,
      deliveryCity: input.deliveryCity,
      deliveryState: input.deliveryState,
      deliveryZip: input.deliveryZip,
      deliveryInstructions: input.deliveryInstructions,
      scheduledFor: input.scheduledFor,
      estimatedDeliveryTime,
      paymentMethod: input.paymentMethod,
      paymentStatus: "pending",
      paymentIntentId: input.paymentIntentId,
      promoCode: input.promoCode?.toUpperCase(),
    });

    // Insert order items
    for (const item of cart.items) {
      await tx.insert(orderItems).values({
        id: nanoid(),
        orderId,
        menuItemId: item.menuItemId,
        itemName: item.menuItem.name,
        itemDescription: item.menuItem.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: (Number(item.unitPrice) * item.quantity).toFixed(2),
        customizations: item.customizations,
      });
    }

    // Increment promo code usage
    if (totals.promoCode) {
      await tx
        .update(promoCodes)
        .set({
          usageCount: sql`${promoCodes.usageCount} + 1`,
        })
        .where(eq(promoCodes.id, totals.promoCode.id));
    }

    // Clear cart
    await tx.delete(cartItems).where(eq(cartItems.cartId, input.cartId));
  });

  return { orderId, orderNumber };
}

export async function getOrder(orderId: string) {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      items: {
        with: {
          menuItem: true,
        },
      },
    },
  });

  return order;
}

export async function getOrderByNumber(orderNumber: string, email?: string) {
  let whereClause = eq(orders.orderNumber, orderNumber);

  // For guest orders, verify email
  if (email) {
    whereClause = and(
      whereClause,
      eq(orders.guestEmail, email),
    ) as typeof whereClause;
  }

  const order = await db.query.orders.findFirst({
    where: whereClause,
    with: {
      items: {
        with: {
          menuItem: true,
        },
      },
    },
  });

  return order;
}

export async function getUserOrders(userId: string) {
  return await db.query.orders.findMany({
    where: eq(orders.userId, userId),
    orderBy: [desc(orders.createdAt)],
    with: {
      items: {
        with: {
          menuItem: true,
        },
      },
    },
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: (typeof orders.$inferSelect)["status"],
) {
  await db.update(orders).set({ status }).where(eq(orders.id, orderId));
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: (typeof orders.$inferSelect)["paymentStatus"],
) {
  await db.update(orders).set({ paymentStatus }).where(eq(orders.id, orderId));
}

export async function cancelOrder(orderId: string) {
  // Can only cancel if order is pending or confirmed
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (!["pending", "confirmed"].includes(order.status)) {
    throw new Error("Order cannot be cancelled at this stage");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({ status: "cancelled", paymentStatus: "refunded" })
      .where(eq(orders.id, orderId));
  });
}

export type OrderWithItems = Awaited<ReturnType<typeof getOrder>>;
