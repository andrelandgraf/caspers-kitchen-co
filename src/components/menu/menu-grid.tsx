"use client";

import { MenuItemCard } from "./menu-item-card";
import { useCart } from "@/lib/cart/context";
import type { MenuItemWithRelations } from "@/lib/menu/queries";

interface MenuGridProps {
  items: MenuItemWithRelations[];
}

export function MenuGrid({ items }: MenuGridProps) {
  const { addItem } = useCart();

  const handleQuickAdd = async (item: MenuItemWithRelations) => {
    await addItem({
      menuItemId: item.id,
      quantity: 1,
      unitPrice: item.price,
      menuItemName: item.name,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <MenuItemCard key={item.id} item={item} onQuickAdd={handleQuickAdd} />
      ))}
    </div>
  );
}
