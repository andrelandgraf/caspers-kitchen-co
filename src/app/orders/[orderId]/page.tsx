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
import { OrderStatusTimeline } from "@/components/orders/order-status-timeline";
import { getOrder } from "@/lib/orders/queries";
import { MapPin, Clock, Phone, Mail, Store } from "lucide-react";

export default async function OrderTrackingPage({
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

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getTimeRemaining = () => {
    if (!order.estimatedDeliveryTime) return null;
    const now = new Date();
    const estimated = new Date(order.estimatedDeliveryTime);
    const diff = estimated.getTime() - now.getTime();

    if (diff < 0) return "Soon";

    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Track Your Order
          </h1>
          <p className="text-muted-foreground">
            Order #{order.orderNumber} • Placed {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Status Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
                <CardDescription>
                  Track your order from kitchen to doorstep
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrderStatusTimeline currentStatus={order.status} />
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start pb-4 border-b last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.itemName}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
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
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Delivery Info */}
            {order.status !== "delivered" && order.status !== "cancelled" && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold">Estimated Delivery</p>
                      <p className="text-2xl font-bold text-primary">
                        {getTimeRemaining()}
                      </p>
                      {order.estimatedDeliveryTime && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Around {formatTime(order.estimatedDeliveryTime)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.deliveryAddress}</p>
                <p className="text-sm">
                  {order.deliveryCity}, {order.deliveryState}{" "}
                  {order.deliveryZip}
                </p>
                {order.deliveryInstructions && (
                  <p className="text-sm text-muted-foreground mt-2 italic">
                    Note: {order.deliveryInstructions}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Location Information */}
            {order.location && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Prepared at
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">
                    Casper's Kitchen - {order.location.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.location.address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.location.city}, {order.location.state}{" "}
                    {order.location.zipCode}
                  </p>
                  {order.location.phone && (
                    <a
                      href={`tel:${order.location.phone}`}
                      className="text-sm text-primary hover:underline mt-2 inline-block"
                    >
                      {order.location.phone}
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact */}
            {order.status === "out_for_delivery" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a
                    href="tel:+14155551234"
                    className="flex items-center gap-2 text-sm hover:text-primary"
                  >
                    <Phone className="h-4 w-4" />
                    (415) 555-1234
                  </a>
                  <a
                    href="mailto:support@casperskitchen.com"
                    className="flex items-center gap-2 text-sm hover:text-primary"
                  >
                    <Mail className="h-4 w-4" />
                    support@casperskitchen.com
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.subtotal}</span>
                </div>
                {order.discountAmount &&
                  parseFloat(order.discountAmount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
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
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${order.total}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {order.status === "delivered" && (
              <div className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href={`/orders/${orderId}/reorder`}>Order Again</Link>
                </Button>
                <Button variant="outline" className="w-full">
                  Download Receipt
                </Button>
              </div>
            )}

            {order.status === "pending" || order.status === "confirmed" ? (
              <Button variant="destructive" className="w-full">
                Cancel Order
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
