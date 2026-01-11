import { ThemeSelector } from "@/components/themes/selector";
import { UserMenu } from "@/components/auth/user-menu";
import { CartIcon } from "@/components/cart/cart-icon";
import { LocationIndicator } from "@/components/locations/location-indicator";
import { ChefHat } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="p-2 bg-primary rounded-lg">
            <ChefHat className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">
              Caspers Kitchen
            </h1>
            <p className="text-xs text-muted-foreground">Ghost Kitchen Co.</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <LocationIndicator />
          <CartIcon />
          <ThemeSelector />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
