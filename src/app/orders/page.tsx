import { redirect } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { getUserOrders } from "@/lib/orders/queries";
import { Package, Clock, ChefHat } from "lucide-react";

export default async function OrderHistoryPage() {
  const session = await auth.api.getSession({
    headers: await (async () => {
      const { headers } = await import("next/headers");
      return headers();
    })(),
  });

  if (!session?.user) {
    redirect("/sign-in?redirect=/orders");
  }

  const orders = await getUserOrders(session.user.id);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      pending: "outline",
      confirmed: "secondary",
      preparing: "secondary",
      ready: "default",
      out_for_delivery: "default",
      delivered: "default",
      cancelled: "destructive",
    };

    return variants[status] || "default";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pending",
      confirmed: "Confirmed",
      preparing: "Preparing",
      ready: "Ready",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };

    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Order History
            </h1>
            <p className="text-muted-foreground">
              View and track all your past orders
            </p>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <div className="inline-flex p-4 bg-muted rounded-full mb-4">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start exploring our menu and place your first order!
                </p>
                <Button asChild>
                  <Link href="/menu">Browse Menu</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((orderData) => {
                const order = orderData;
                const items = orderData.items;
                const isActive = !["delivered", "cancelled"].includes(
                  order.status,
                );

                return (
                  <Card
                    key={order.id}
                    className="hover:border-primary/50 transition-colors"
                  >
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <CardTitle className="text-base font-mono">
                            Order #{order.orderNumber}
                          </CardTitle>
                          <CardDescription>
                            {formatDate(order.createdAt)} • {items.length} item
                            {items.length !== 1 ? "s" : ""}
                          </CardDescription>
                        </div>
                        <Badge variant={getStatusBadge(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Items Preview */}
                        <div className="text-sm text-muted-foreground">
                          {items.slice(0, 2).map((item, index) => (
                            <span key={item.id}>
                              {item.itemName}
                              {index < Math.min(items.length, 2) - 1 && ", "}
                            </span>
                          ))}
                          {items.length > 2 && (
                            <span> and {items.length - 2} more</span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button variant="outline" asChild className="flex-1">
                            <Link href={`/orders/${order.id}`}>
                              {isActive ? (
                                <>
                                  <Clock className="mr-2 h-4 w-4" />
                                  Track Order
                                </>
                              ) : (
                                "View Details"
                              )}
                            </Link>
                          </Button>
                          {order.status === "delivered" && (
                            <Button
                              variant="default"
                              asChild
                              className="flex-1"
                            >
                              <Link href="/menu">
                                <ChefHat className="mr-2 h-4 w-4" />
                                Order Again
                              </Link>
                            </Button>
                          )}
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center pt-3 border-t">
                          <span className="text-sm text-muted-foreground">
                            Total
                          </span>
                          <span className="text-lg font-semibold">
                            ${order.total}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
