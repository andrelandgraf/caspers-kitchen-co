import { NextRequest, NextResponse } from "next/server";
import { addItemToCart } from "@/lib/cart/queries";
import { auth } from "@/lib/auth/server";
import { cookies, headers } from "next/headers";
import { v7 as uuidv7 } from "uuid";
import { trackCartItemAdded } from "@/lib/databricks/zerobus/events";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    let sessionId = (await cookies()).get("cart_session_id")?.value;

    // Create session ID for guest users if not exists
    if (!session && !sessionId) {
      sessionId = uuidv7();
      (await cookies()).set("cart_session_id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    const body = await request.json();
    const { menuItemId, quantity, unitPrice, customizations } = body;

    if (!menuItemId || !quantity || !unitPrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const item = await addItemToCart({
      userId: session?.user?.id,
      sessionId,
      menuItemId,
      quantity,
      unitPrice,
      customizations,
    });

    // Track event (fire and forget)
    trackCartItemAdded({
      userId: session?.user?.id,
      sessionId,
      source: "ui",
      menuItemId,
      menuItemName: item.menuItem.name,
      quantity,
      unitPrice,
    }).catch((err) => console.error("Failed to track cart_item_added:", err));

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 },
    );
  }
}
