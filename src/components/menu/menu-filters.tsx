"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import type { CategoryType, DietaryType } from "@/lib/menu/queries";

interface MenuFiltersProps {
  selectedCategory: CategoryType | "all";
  selectedDietaryTypes: DietaryType[];
  searchQuery: string;
  onCategoryChange: (category: CategoryType | "all") => void;
  onDietaryTypeToggle: (type: DietaryType) => void;
  onSearchChange: (query: string) => void;
}

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

export function MenuFilters({
  selectedCategory,
  selectedDietaryTypes,
  searchQuery,
  onCategoryChange,
  onDietaryTypeToggle,
  onSearchChange,
}: MenuFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
  };

  const handleSearchClear = () => {
    setLocalSearch("");
    onSearchChange("");
  };

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
              onClick={() => onCategoryChange(category.value)}
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
              onClick={() => onDietaryTypeToggle(type.value)}
            >
              {type.label}
            </Badge>
          ))}
        </div>
      </div>

      {(selectedCategory !== "all" ||
        selectedDietaryTypes.length > 0 ||
        searchQuery) && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onCategoryChange("all");
              selectedDietaryTypes.forEach((type) => onDietaryTypeToggle(type));
              handleSearchClear();
            }}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
