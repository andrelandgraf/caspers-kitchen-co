"use client";

import { useCart } from "@/lib/cart/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

export function OrderSummary() {
  const { items } = useCart();

  if (!items || items.length === 0) {
    return null;
  }

  const subtotal = items.reduce((sum, item) => {
    return sum + parseFloat(item.unitPrice) * item.quantity;
  }, 0);

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Your Order</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                  {item.menuItem.image ? (
                    <Image
                      src={item.menuItem.image}
                      alt={item.menuItem.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                      <span className="text-2xl">🍽️</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.menuItem.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                  {item.customizations && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.customizations}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-medium">
                    ${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-6 space-y-2 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span>$5.99</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (estimated)</span>
            <span>${(subtotal * 0.0875).toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Estimated Total</span>
            <span>${(subtotal + 5.99 + subtotal * 0.0875).toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
