import Link from "next/link";
import { ChefHat } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <ChefHat className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Casper's Kitchen</h3>
                <p className="text-xs text-muted-foreground">
                  Ghost Kitchen Co.
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Comfort food delivered with warmth, fresh from our kitchen to your
              door.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/menu"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Menu
                </Link>
              </li>
              <li>
                <Link
                  href="/locations"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Locations
                </Link>
              </li>
              <li>
                <Link
                  href="/orders/track"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-semibold mb-4">Delivery Hours</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Monday - Friday: 10am - 11pm</li>
              <li>Saturday: 9am - 12am</li>
              <li>Sunday: 9am - 11pm</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Casper's Kitchen Co. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
