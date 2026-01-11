import { NextRequest, NextResponse } from "next/server";
import { getMenuItems } from "@/lib/menu/queries";
import type { MenuFilters } from "@/lib/menu/queries";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters: MenuFilters = {};

    const category = searchParams.get("category");
    if (category && category !== "all") {
      filters.category = category as MenuFilters["category"];
    }

    const dietaryTypesParam = searchParams.get("dietaryTypes");
    if (dietaryTypesParam) {
      filters.dietaryTypes = dietaryTypesParam.split(
        ",",
      ) as MenuFilters["dietaryTypes"];
    }

    const search = searchParams.get("search");
    if (search) {
      filters.search = search;
    }

    const availableOnly = searchParams.get("availableOnly");
    if (availableOnly === "true") {
      filters.availableOnly = true;
    }

    const locationId = searchParams.get("locationId");
    if (locationId) {
      filters.locationId = locationId;
    }

    const items = await getMenuItems(filters);

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 },
    );
  }
}
