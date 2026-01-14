import { db } from "@/lib/db/client";
import { carts, cartItems } from "./schema";
import { menuItems } from "@/lib/menu/schema";
import { eq, and } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";

export interface CartItemWithMenu {
  id: string;
  cartId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: string;
  customizations: string | null;
  createdAt: Date;
  updatedAt: Date;
  menuItem: {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string | null;
    price: string;
    image: string | null;
    category: string;
    isAvailable: boolean;
  };
}

export interface CartWithItems {
  id: string;
  userId: string | null;
  sessionId: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: CartItemWithMenu[];
}

export async function getOrCreateCart(
  userId?: string,
  sessionId?: string,
): Promise<string> {
  if (!userId && !sessionId) {
    throw new Error("Either userId or sessionId must be provided");
  }

  // Try to find existing cart
  const existingCart = await db.query.carts.findFirst({
    where: userId
      ? eq(carts.userId, userId)
      : sessionId
        ? eq(carts.sessionId, sessionId)
        : undefined,
  });

  if (existingCart) {
    return existingCart.id;
  }

  // Create new cart
  const [newCart] = await db
    .insert(carts)
    .values({
      id: uuidv7(),
      userId,
      sessionId,
    })
    .returning();

  return newCart.id;
}

export async function getCart(
  userId?: string,
  sessionId?: string,
): Promise<CartWithItems | null> {
  if (!userId && !sessionId) {
    return null;
  }

  const cart = await db.query.carts.findFirst({
    where: userId
      ? eq(carts.userId, userId)
      : sessionId
        ? eq(carts.sessionId, sessionId)
        : undefined,
    with: {
      items: {
        with: {
          menuItem: true,
        },
      },
    },
  });

  return cart as CartWithItems | null;
}

export async function addItemToCart(params: {
  userId?: string;
  sessionId?: string;
  menuItemId: string;
  quantity: number;
  unitPrice: string;
  customizations?: string;
}): Promise<CartItemWithMenu> {
  const cartId = await getOrCreateCart(params.userId, params.sessionId);

  // Check if item with same customizations already exists
  const existingItem = await db.query.cartItems.findFirst({
    where: and(
      eq(cartItems.cartId, cartId),
      eq(cartItems.menuItemId, params.menuItemId),
      params.customizations
        ? eq(cartItems.customizations, params.customizations)
        : eq(cartItems.customizations, ""),
    ),
  });

  if (existingItem) {
    // Update quantity
    const [updatedItem] = await db
      .update(cartItems)
      .set({
        quantity: existingItem.quantity + params.quantity,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, existingItem.id))
      .returning();

    const itemWithMenu = await db.query.cartItems.findFirst({
      where: eq(cartItems.id, updatedItem.id),
      with: {
        menuItem: true,
      },
    });

    return itemWithMenu as CartItemWithMenu;
  }

  // Add new item
  const [newItem] = await db
    .insert(cartItems)
    .values({
      id: uuidv7(),
      cartId,
      menuItemId: params.menuItemId,
      quantity: params.quantity,
      unitPrice: params.unitPrice,
      customizations: params.customizations || null,
    })
    .returning();

  const itemWithMenu = await db.query.cartItems.findFirst({
    where: eq(cartItems.id, newItem.id),
    with: {
      menuItem: true,
    },
  });

  return itemWithMenu as CartItemWithMenu;
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number,
): Promise<CartItemWithMenu> {
  const [updatedItem] = await db
    .update(cartItems)
    .set({
      quantity,
      updatedAt: new Date(),
    })
    .where(eq(cartItems.id, itemId))
    .returning();

  const itemWithMenu = await db.query.cartItems.findFirst({
    where: eq(cartItems.id, updatedItem.id),
    with: {
      menuItem: true,
    },
  });

  return itemWithMenu as CartItemWithMenu;
}

export async function removeCartItem(itemId: string): Promise<void> {
  await db.delete(cartItems).where(eq(cartItems.id, itemId));
}

export async function clearCart(cartId: string): Promise<void> {
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
}

export async function getCartItemCount(
  userId?: string,
  sessionId?: string,
): Promise<number> {
  const cart = await getCart(userId, sessionId);
  if (!cart) return 0;

  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export async function mergeGuestCartToUser(
  sessionId: string,
  userId: string,
): Promise<void> {
  // Find guest cart
  const guestCart = await db.query.carts.findFirst({
    where: eq(carts.sessionId, sessionId),
    with: {
      items: true,
    },
  });

  if (!guestCart || guestCart.items.length === 0) {
    return;
  }

  // Get or create user cart
  const userCartId = await getOrCreateCart(userId);

  // Move items to user cart
  for (const item of guestCart.items) {
    await addItemToCart({
      userId,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      customizations: item.customizations || undefined,
    });
  }

  // Delete guest cart
  await db.delete(carts).where(eq(carts.id, guestCart.id));
}
