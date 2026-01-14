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
  const { addItem, loadingItemId } = useCart();
  const isLoading = loadingItemId === menuItemId;

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
      <Button size="lg" disabled>
        Sold Out
      </Button>
    );
  }

  return (
    <Button size="lg" onClick={handleClick} disabled={isLoading}>
      {isLoading ? "Adding..." : "Add to Cart"}
    </Button>
  );
}
