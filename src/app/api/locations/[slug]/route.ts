import { NextResponse } from "next/server";
import {
  getLocationBySlug,
  isLocationOpen,
  getNextOpeningTime,
} from "@/lib/locations/queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const location = await getLocationBySlug(slug);

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 },
      );
    }

    const isOpen = isLocationOpen(location);
    const nextOpeningTime = !isOpen ? getNextOpeningTime(location) : null;

    return NextResponse.json({
      location: {
        ...location,
        isOpen,
        nextOpeningTime,
      },
    });
  } catch (error) {
    console.error("Error fetching location:", error);
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 },
    );
  }
}
