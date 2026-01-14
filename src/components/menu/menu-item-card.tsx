"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Leaf, Wheat, UtensilsCrossed } from "lucide-react";
import type { MenuItemWithRelations } from "@/lib/menu/queries";

interface MenuItemCardProps {
  item: MenuItemWithRelations;
  onQuickAdd?: (item: MenuItemWithRelations) => void;
}

export function MenuItemCard({ item, onQuickAdd }: MenuItemCardProps) {
  const getDietaryIcon = (type: string) => {
    switch (type) {
      case "vegetarian":
      case "vegan":
        return <Leaf className="h-3 w-3" />;
      case "gluten-free":
        return <Wheat className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getDietaryLabel = (type: string) => {
    switch (type) {
      case "vegetarian":
        return "Vegetarian";
      case "vegan":
        return "Vegan";
      case "gluten-free":
        return "Gluten-Free";
      default:
        return type;
    }
  };

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all hover:shadow-lg">
      <Link href={`/menu/${item.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <UtensilsCrossed className="h-12 w-12 opacity-30" />
            </div>
          )}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                Sold Out
              </Badge>
            </div>
          )}
          {item.featured && item.isAvailable && (
            <Badge className="absolute top-2 right-2 bg-primary">
              Featured
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/menu/${item.slug}`} className="block">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
            {item.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {item.shortDescription || item.description}
          </p>
        </Link>

        {item.dietaryTypes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.dietaryTypes.map((type) => (
              <Badge
                key={type}
                variant="outline"
                className="text-xs flex items-center gap-1"
              >
                {getDietaryIcon(type)}
                {getDietaryLabel(type)}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            ${parseFloat(item.price).toFixed(2)}
          </span>
          {item.remainingCount !== null &&
            item.remainingCount > 0 &&
            item.remainingCount <= 5 && (
              <Badge variant="secondary" className="text-xs">
                Only {item.remainingCount} left
              </Badge>
            )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {item.isAvailable ? (
          onQuickAdd ? (
            <Button
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                onQuickAdd(item);
              }}
            >
              Quick Add
            </Button>
          ) : (
            <Button className="w-full" asChild>
              <Link href={`/menu/${item.slug}`}>View Details</Link>
            </Button>
          )
        ) : (
          <Button className="w-full" disabled>
            Sold Out
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
