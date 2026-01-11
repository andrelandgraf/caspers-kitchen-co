import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getOrder } from "@/lib/orders/queries";
import { CheckCircle2 } from "lucide-react";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrder(orderId);

  if (!order) {
    notFound();
  }

  const items = order.items;

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-3xl">Order Confirmed!</CardTitle>
            <CardDescription className="text-lg mt-2">
              Thank you for your order. We'll start preparing it right away.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Order Number and Details */}
            <div className="bg-muted/50 rounded-lg p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Order Number</span>
                <span className="font-mono font-bold text-lg">
                  {order.orderNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Order Date</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  Estimated Delivery
                </span>
                <span className="font-medium">
                  {order.estimatedDeliveryTime
                    ? formatDate(order.estimatedDeliveryTime)
                    : "45-60 minutes"}
                </span>
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <h3 className="font-semibold mb-2">Delivery Address</h3>
              <div className="text-muted-foreground">
                <p>{order.deliveryAddress}</p>
                <p>
                  {order.deliveryCity}, {order.deliveryState}{" "}
                  {order.deliveryZip}
                </p>
                {order.deliveryInstructions && (
                  <p className="mt-2 text-sm italic">
                    Note: {order.deliveryInstructions}
                  </p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold mb-3">Order Items</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start pb-3 border-b last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.itemName}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ${item.unitPrice}
                      </p>
                      {item.customizations && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.customizations}
                        </p>
                      )}
                    </div>
                    <div className="font-medium">${item.totalPrice}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.subtotal}</span>
              </div>
              {order.discountAmount && parseFloat(order.discountAmount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Discount{order.promoCode && ` (${order.promoCode})`}
                  </span>
                  <span>-${order.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>${order.deliveryFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${order.taxAmount}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${order.total}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-primary/5 rounded-lg p-4">
              <p className="text-sm">
                <span className="font-medium">Payment Method:</span>{" "}
                {order.paymentMethod === "card"
                  ? "Credit/Debit Card"
                  : order.paymentMethod === "cash"
                    ? "Cash"
                    : "Gift Card"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Payment will be collected upon delivery
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild className="flex-1">
                <Link href={`/orders/${orderId}`}>Track Your Order</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/menu">Continue Shopping</Link>
              </Button>
            </div>

            {/* Confirmation Email Notice */}
            <p className="text-sm text-center text-muted-foreground pt-4 border-t">
              A confirmation email has been sent to{" "}
              {order.guestEmail || "your email address"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
