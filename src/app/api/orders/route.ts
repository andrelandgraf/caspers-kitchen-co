import { NextRequest, NextResponse } from "next/server";
import { createOrder, CreateOrderInput } from "@/lib/orders/queries";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const body = await request.json();

    const orderInput: CreateOrderInput = {
      userId: session?.user?.id,
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
