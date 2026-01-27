import { NextRequest, NextResponse } from "next/server";
import { updateCartItemQuantity, removeCartItem } from "@/lib/cart/queries";
import { auth } from "@/lib/auth/server";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db/client";
import { cartItems } from "@/lib/cart/schema";
import { eq } from "drizzle-orm";
import {
  trackCartItemUpdated,
  trackCartItemRemoved,
} from "@/lib/databricks/zerobus/events";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    const { quantity } = body;

    if (!quantity || quantity < 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    // Get current item for tracking
    const currentItem = await db.query.cartItems.findFirst({
      where: eq(cartItems.id, itemId),
      with: { menuItem: true },
    });
    const previousQuantity = currentItem?.quantity ?? 0;

    const item = await updateCartItemQuantity(itemId, quantity);

    // Get user context for tracking
    const session = await auth.api.getSession({ headers: await headers() });
    const sessionId = (await cookies()).get("cart_session_id")?.value;

    // Track event (fire and forget)
    trackCartItemUpdated({
      userId: session?.user?.id,
      sessionId,
      source: "ui",
      cartItemId: itemId,
      menuItemName: item.menuItem.name,
      previousQuantity,
      newQuantity: quantity,
    }).catch((err) => console.error("Failed to track cart_item_updated:", err));

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const { itemId } = await params;

    // Get item details before deletion for tracking
    const itemToRemove = await db.query.cartItems.findFirst({
      where: eq(cartItems.id, itemId),
      with: { menuItem: true },
    });

    await removeCartItem(itemId);

    // Get user context for tracking
    const session = await auth.api.getSession({ headers: await headers() });
    const sessionId = (await cookies()).get("cart_session_id")?.value;

    // Track event (fire and forget)
    trackCartItemRemoved({
      userId: session?.user?.id,
      sessionId,
      source: "ui",
      cartItemId: itemId,
      menuItemName: itemToRemove?.menuItem.name,
    }).catch((err) => console.error("Failed to track cart_item_removed:", err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing cart item:", error);
    return NextResponse.json(
      { error: "Failed to remove cart item" },
      { status: 500 },
    );
  }
}
