"use client";

import { useState, useEffect } from "react";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { MenuFilters } from "@/components/menu/menu-filters";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { useCart } from "@/lib/cart/context";
import type {
  MenuItemWithRelations,
  CategoryType,
  DietaryType,
  MenuFilters as MenuFiltersType,
} from "@/lib/menu/queries";

export default function MenuPage() {
  const [items, setItems] = useState<MenuItemWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<
    CategoryType | "all"
  >("all");
  const [selectedDietaryTypes, setSelectedDietaryTypes] = useState<
    DietaryType[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { addItem } = useCart();

  useEffect(() => {
    async function fetchMenuItems() {
      setLoading(true);
      try {
        const filters: MenuFiltersType = {
          availableOnly: false,
        };

        if (selectedCategory !== "all") {
          filters.category = selectedCategory;
        }

        if (selectedDietaryTypes.length > 0) {
          filters.dietaryTypes = selectedDietaryTypes;
        }

        if (searchQuery) {
          filters.search = searchQuery;
        }

        const queryParams = new URLSearchParams();
        if (filters.category) queryParams.set("category", filters.category);
        if (filters.dietaryTypes)
          queryParams.set("dietaryTypes", filters.dietaryTypes.join(","));
        if (filters.search) queryParams.set("search", filters.search);
        queryParams.set("availableOnly", "false");

        const response = await fetch(`/api/menu?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch menu items");
        }

        const data = await response.json();
        setItems(data.items);
      } catch (error) {
        console.error("Error fetching menu items:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMenuItems();
  }, [selectedCategory, selectedDietaryTypes, searchQuery]);

  const handleCategoryChange = (category: CategoryType | "all") => {
    setSelectedCategory(category);
  };

  const handleDietaryTypeToggle = (type: DietaryType) => {
    setSelectedDietaryTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleQuickAdd = async (item: MenuItemWithRelations) => {
    await addItem({
      menuItemId: item.id,
      quantity: 1,
      unitPrice: item.price,
      menuItemName: item.name,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Our Menu</h1>
          <p className="text-lg text-muted-foreground">
            Discover our selection of comfort food classics, made fresh daily
          </p>
        </div>

        <MenuFilters
          selectedCategory={selectedCategory}
          selectedDietaryTypes={selectedDietaryTypes}
          searchQuery={searchQuery}
          onCategoryChange={handleCategoryChange}
          onDietaryTypeToggle={handleDietaryTypeToggle}
          onSearchChange={handleSearchChange}
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-muted rounded-lg h-96" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground mb-4">
              No menu items found matching your criteria.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory("all");
                setSelectedDietaryTypes([]);
                setSearchQuery("");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
