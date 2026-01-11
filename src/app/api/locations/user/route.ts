import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserLocation, setUserLocation } from "@/lib/locations/queries";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await (async () => {
        const { headers } = await import("next/headers");
        return headers();
      })(),
    });

    if (!session?.user) {
      return NextResponse.json({ location: null });
    }

    const location = await getUserLocation(session.user.id);

    return NextResponse.json({ location });
  } catch (error) {
    console.error("Error fetching user location:", error);
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await (async () => {
        const { headers } = await import("next/headers");
        return headers();
      })(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { locationId } = await request.json();

    if (!locationId) {
      return NextResponse.json(
        { error: "Location ID is required" },
        { status: 400 },
      );
    }

    const location = await setUserLocation(session.user.id, locationId);

    return NextResponse.json({ location });
  } catch (error) {
    console.error("Error setting user location:", error);
    return NextResponse.json(
      { error: "Failed to set location" },
      { status: 500 },
    );
  }
}
