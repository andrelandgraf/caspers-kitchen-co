import { NextRequest, NextResponse } from "next/server";
import { getCart } from "@/lib/cart/queries";
import { auth } from "@/lib/auth/server";
import { cookies, headers } from "next/headers";
import { nanoid } from "nanoid";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    let sessionId = (await cookies()).get("cart_session_id")?.value;

    // Create session ID for guest users if not exists
    if (!session && !sessionId) {
      sessionId = nanoid();
      (await cookies()).set("cart_session_id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    const cart = await getCart(session?.user?.id, sessionId);

    return NextResponse.json({
      cart: cart || { items: [] },
      items: cart?.items || [],
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 },
    );
  }
}
