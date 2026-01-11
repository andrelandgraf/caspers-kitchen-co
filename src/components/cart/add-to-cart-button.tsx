"use client";

import { useCart } from "@/lib/cart/context";
import { Button } from "@/components/ui/button";

interface AddToCartButtonProps {
  menuItemId: string;
  menuItemName: string;
  price: string;
  isAvailable: boolean;
}

export function AddToCartButton({
  menuItemId,
  menuItemName,
  price,
  isAvailable,
}: AddToCartButtonProps) {
  const { addItem, loading } = useCart();

  const handleClick = async () => {
    await addItem({
      menuItemId,
      quantity: 1,
      unitPrice: price,
      menuItemName,
    });
  };

  if (!isAvailable) {
    return (
      <Button size="lg" disabled className="w-full md:w-auto">
        Sold Out
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      className="w-full md:w-auto"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Adding..." : "Add to Cart"}
    </Button>
  );
}
