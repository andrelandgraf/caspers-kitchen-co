import { NextResponse } from "next/server";
import {
  getAllLocations,
  isLocationOpen,
  getNextOpeningTime,
  calculateDistance,
} from "@/lib/locations/queries";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    const locations = await getAllLocations();

    // Enhance locations with open status and distance
    const enhancedLocations = locations.map((location) => {
      const isOpen = isLocationOpen(location);
      const nextOpeningTime = !isOpen ? getNextOpeningTime(location) : null;

      let distance: number | undefined;
      if (lat && lon) {
        distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lon),
          parseFloat(location.latitude),
          parseFloat(location.longitude),
        );
      }

      return {
        id: location.id,
        name: location.name,
        slug: location.slug,
        city: location.city,
        state: location.state,
        neighborhood: location.neighborhood,
        isOpen,
        nextOpeningTime,
        distance,
      };
    });

    // Sort by distance if available
    if (lat && lon) {
      enhancedLocations.sort(
        (a, b) => (a.distance || Infinity) - (b.distance || Infinity),
      );
    }

    return NextResponse.json({ locations: enhancedLocations });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 },
    );
  }
}
