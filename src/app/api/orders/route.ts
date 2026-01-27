import { NextRequest, NextResponse } from "next/server";
import { createOrder, CreateOrderInput, getOrder } from "@/lib/orders/queries";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { trackOrderCreated } from "@/lib/databricks/zerobus/events";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const body = await request.json();

    const orderInput: CreateOrderInput = {
      userId: session?.user?.id,
      locationId: body.locationId,
      guestEmail: body.guestEmail,
      guestName: body.guestName,
      guestPhone: body.guestPhone,
      cartId: body.cartId,
      deliveryAddress: body.deliveryAddress,
      deliveryCity: body.deliveryCity,
      deliveryState: body.deliveryState,
      deliveryZip: body.deliveryZip,
      deliveryInstructions: body.deliveryInstructions,
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined,
      paymentMethod: body.paymentMethod || "card",
      paymentIntentId: body.paymentIntentId,
      promoCode: body.promoCode,
    };

    const result = await createOrder(orderInput);

    // Get order details for tracking
    const order = await getOrder(result.orderId);
    const sessionId = (await cookies()).get("cart_session_id")?.value;

    // Track event (fire and forget)
    trackOrderCreated({
      userId: session?.user?.id,
      sessionId,
      source: "ui",
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      total: order?.total ?? "0",
      itemCount: order?.items.length ?? 0,
      locationId: body.locationId,
      paymentMethod: body.paymentMethod || "card",
    }).catch((err) => console.error("Failed to track order_created:", err));

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create order",
      },
      { status: 500 },
    );
  }
}
