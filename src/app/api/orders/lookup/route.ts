import { NextRequest, NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/orders/queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber, email } = body;

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: "Order number and email are required" },
        { status: 400 },
      );
    }

    const order = await getOrderByNumber(orderNumber, email);

    if (!order) {
      return NextResponse.json(
        { error: "Order not found. Please check your order number and email." },
        { status: 404 },
      );
    }

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error("Error looking up order:", error);
    return NextResponse.json(
      { error: "Failed to lookup order" },
      { status: 500 },
    );
  }
}
