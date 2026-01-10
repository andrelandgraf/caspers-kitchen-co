import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getMenuItemBySlug } from "@/lib/menu/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Leaf, Wheat, AlertCircle } from "lucide-react";

interface MenuItemPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function MenuItemPage({ params }: MenuItemPageProps) {
  const { slug } = await params;
  const item = await getMenuItemBySlug(slug);

  if (!item) {
    notFound();
  }

  const getDietaryIcon = (type: string) => {
    switch (type) {
      case "vegetarian":
      case "vegan":
        return <Leaf className="h-4 w-4" />;
      case "gluten-free":
        return <Wheat className="h-4 w-4" />;
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/menu">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Menu
          </Link>
        </Button>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <span>No image available</span>
              </div>
            )}
            {item.featured && (
              <Badge className="absolute top-4 right-4 bg-primary">
                Featured
              </Badge>
            )}
          </div>

          <div>
            <div className="mb-4">
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                {item.name}
              </h1>
              <p className="text-3xl font-bold text-primary">
                ${parseFloat(item.price).toFixed(2)}
              </p>
            </div>

            {item.dietaryTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {item.dietaryTypes.map((type) => (
                  <Badge
                    key={type}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {getDietaryIcon(type)}
                    {getDietaryLabel(type)}
                  </Badge>
                ))}
              </div>
            )}

            <div className="prose prose-sm max-w-none mb-6">
              <p className="text-muted-foreground">{item.description}</p>
            </div>

            {item.allergens && (
              <Card className="mb-6 border-orange-200 dark:border-orange-900">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm mb-1">
                        Allergen Information
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.allergens}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {item.nutritionalInfo && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <p className="font-medium text-sm mb-1">
                    Nutritional Information
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.nutritionalInfo}
                  </p>
                </CardContent>
              </Card>
            )}

            {item.customizationOptions.length > 0 && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <p className="font-medium text-sm mb-3">
                    Customization Options
                  </p>
                  <ul className="space-y-2">
                    {item.customizationOptions.map((option) => (
                      <li
                        key={option.id}
                        className="text-sm text-muted-foreground"
                      >
                        <span className="font-medium text-foreground">
                          {option.name}
                        </span>
                        {option.required && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Required
                          </Badge>
                        )}
                        {option.priceModifier &&
                          parseFloat(option.priceModifier) !== 0 && (
                            <span className="ml-2">
                              (+${parseFloat(option.priceModifier).toFixed(2)})
                            </span>
                          )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {item.remainingCount !== null &&
              item.remainingCount > 0 &&
              item.remainingCount <= 5 && (
                <Badge variant="secondary" className="mb-6">
                  Only {item.remainingCount} left in stock
                </Badge>
              )}

            {item.isAvailable ? (
              <Button size="lg" className="w-full md:w-auto">
                Add to Cart
              </Button>
            ) : (
              <Button size="lg" disabled className="w-full md:w-auto">
                Sold Out
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
