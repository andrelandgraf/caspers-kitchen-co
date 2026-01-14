"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart/context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";

export function CartIcon() {
  const [mounted, setMounted] = useState(false);
  const { itemCount, openCart } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={openCart}
      aria-label="Open cart"
    >
      <ShoppingBag className="h-5 w-5" />
      {/* Only show badge after mount to prevent hydration mismatch */}
      {mounted && itemCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
        >
          {itemCount > 9 ? "9+" : itemCount}
        </Badge>
      )}
    </Button>
  );
}
