import { cookies } from "next/headers";
import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { MenuFilters } from "@/components/menu/menu-filters";
import { MenuGrid } from "@/components/menu/menu-grid";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { getMenuItems } from "@/lib/menu/queries";
import { getLocationById } from "@/lib/locations/queries";
import type { CategoryType, DietaryType } from "@/lib/menu/queries";
import Link from "next/link";

interface MenuPageProps {
  searchParams: Promise<{
    category?: string;
    dietary?: string;
    search?: string;
  }>;
}

function MenuSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-muted rounded-lg h-96" />
      ))}
    </div>
  );
}

function NoLocationMessage() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-6 max-w-md text-center">
        <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Select a Location</h3>
        <p className="text-muted-foreground mb-4">
          Please select a location to view available menu items.
        </p>
        <Button asChild>
          <Link href="/locations">Choose Location</Link>
        </Button>
      </div>
    </div>
  );
}

function EmptyResults() {
  return (
    <div className="text-center py-16">
      <p className="text-lg text-muted-foreground mb-4">
        No menu items found matching your criteria.
      </p>
      <Button variant="outline" asChild>
        <Link href="/menu">Clear filters</Link>
      </Button>
    </div>
  );
}

async function MenuContent({
  locationId,
  category,
  dietaryTypes,
  search,
}: {
  locationId: string;
  category?: CategoryType;
  dietaryTypes?: DietaryType[];
  search?: string;
}) {
  const items = await getMenuItems({
    locationId,
    category,
    dietaryTypes,
    search,
    availableOnly: false,
  });

  if (items.length === 0) {
    return <EmptyResults />;
  }

  return <MenuGrid items={items} />;
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const cookieStore = await cookies();
  const locationId = cookieStore.get("location-id")?.value;
  const params = await searchParams;

  // Parse filters from URL
  const category =
    params.category && params.category !== "all"
      ? (params.category as CategoryType)
      : undefined;
  const dietaryTypes = params.dietary
    ? (params.dietary.split(",").filter(Boolean) as DietaryType[])
    : undefined;
  const search = params.search || undefined;

  // Fetch location details if we have a locationId
  const location = locationId ? await getLocationById(locationId) : null;

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

        <Suspense fallback={null}>
          <MenuFilters />
        </Suspense>

        {!location ? (
          <NoLocationMessage />
        ) : (
          <Suspense fallback={<MenuSkeleton />}>
            <MenuContent
              locationId={location.id}
              category={category}
              dietaryTypes={dietaryTypes}
              search={search}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
