"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export interface CartItemWithMenu {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: string;
  customizations: string | null;
  menuItem: {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string | null;
    price: string;
    image: string | null;
    category: string;
    isAvailable: boolean;
  };
}

interface CartContextType {
  items: CartItemWithMenu[];
  itemCount: number;
  isOpen: boolean;
  loadingItemId: string | null;
  openCart: () => void;
  closeCart: () => void;
  addItem: (params: {
    menuItemId: string;
    quantity: number;
    unitPrice: string;
    customizations?: string;
    menuItemName: string;
  }) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemWithMenu[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const refreshCart = async () => {
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = async (params: {
    menuItemId: string;
    quantity: number;
    unitPrice: string;
    customizations?: string;
    menuItemName: string;
  }) => {
    setLoadingItemId(params.menuItemId);
    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuItemId: params.menuItemId,
          quantity: params.quantity,
          unitPrice: params.unitPrice,
          customizations: params.customizations,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }

      await refreshCart();
      toast.success(`${params.menuItemName} added to cart`);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error("Failed to add item to cart. Please try again.");
    } finally {
      setLoadingItemId(null);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      await refreshCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity. Please try again.");
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      await refreshCart();
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item. Please try again.");
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        isOpen,
        loadingItemId,
        openCart,
        closeCart,
        addItem,
        updateQuantity,
        removeItem,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
