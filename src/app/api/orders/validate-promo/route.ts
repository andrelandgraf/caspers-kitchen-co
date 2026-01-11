import { NextRequest, NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/orders/queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;

    if (!code || !subtotal) {
      return NextResponse.json(
        { valid: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const promo = await validatePromoCode(code, parseFloat(subtotal));

    if (!promo) {
      return NextResponse.json(
        { valid: false, message: "Invalid or expired promo code" },
        { status: 400 },
      );
    }

    // Calculate discount
    let discountAmount = 0;
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

    return NextResponse.json({
      valid: true,
      discountAmount,
      description: promo.description,
    });
  } catch (error) {
    console.error("Error validating promo code:", error);
    return NextResponse.json(
      { valid: false, message: "Failed to validate promo code" },
      { status: 500 },
    );
  }
}
