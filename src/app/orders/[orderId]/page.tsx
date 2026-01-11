import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getOrder } from "@/lib/orders/queries";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Order #{order.orderNumber}</CardTitle>
            <CardDescription>
              Status: {order.status.replace("_", " ").toUpperCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Order tracking details will be displayed here in a future update.
            </p>
            <div className="mt-4 space-y-2">
              <p>
                <span className="font-medium">Total:</span> ${order.total}
              </p>
              <p>
                <span className="font-medium">Items:</span> {items.length}
              </p>
              <p>
                <span className="font-medium">Delivery Address:</span>{" "}
                {order.deliveryAddress}, {order.deliveryCity}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
