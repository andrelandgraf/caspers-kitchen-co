"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import type { CategoryType, DietaryType } from "@/lib/menu/queries";

const categories: Array<{ value: CategoryType | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "mains", label: "Mains" },
  { value: "sides", label: "Sides" },
  { value: "desserts", label: "Desserts" },
  { value: "drinks", label: "Drinks" },
];

const dietaryTypes: Array<{ value: DietaryType; label: string }> = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten-Free" },
];

export function MenuFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategory = (searchParams.get("category") ?? "all") as
    | CategoryType
    | "all";
  const selectedDietaryTypes = (searchParams
    .get("dietary")
    ?.split(",")
    .filter(Boolean) ?? []) as DietaryType[];
  const searchQuery = searchParams.get("search") ?? "";

  const [localSearch, setLocalSearch] = useState(searchQuery);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const queryString = params.toString();
      router.push(queryString ? `/menu?${queryString}` : "/menu");
    },
    [router, searchParams],
  );

  const handleCategoryChange = (category: CategoryType | "all") => {
    updateParams({ category: category === "all" ? null : category });
  };

  const handleDietaryTypeToggle = (type: DietaryType) => {
    const newTypes = selectedDietaryTypes.includes(type)
      ? selectedDietaryTypes.filter((t) => t !== type)
      : [...selectedDietaryTypes, type];
    updateParams({ dietary: newTypes.length > 0 ? newTypes.join(",") : null });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: localSearch || null });
  };

  const handleSearchClear = () => {
    setLocalSearch("");
    updateParams({ search: null });
  };

  const handleClearAll = () => {
    setLocalSearch("");
    router.push("/menu");
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedDietaryTypes.length > 0 ||
    searchQuery;

  return (
    <div className="space-y-6 mb-8">
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search menu items..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {localSearch && (
          <button
            type="button"
            onClick={handleSearchClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      <div>
        <h3 className="text-sm font-medium mb-3">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={
                selectedCategory === category.value ? "default" : "outline"
              }
              size="sm"
              onClick={() => handleCategoryChange(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Dietary Preferences</h3>
        <div className="flex flex-wrap gap-2">
          {dietaryTypes.map((type) => (
            <Badge
              key={type.value}
              variant={
                selectedDietaryTypes.includes(type.value)
                  ? "default"
                  : "outline"
              }
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => handleDietaryTypeToggle(type.value)}
            >
              {type.label}
            </Badge>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
