import { db } from "@/lib/db/client";
import { locations, userLocations, menuItemLocations } from "./schema";
import { eq, and } from "drizzle-orm";

/**
 * Get all active locations
 */
export async function getAllLocations() {
  return await db
    .select()
    .from(locations)
    .where(eq(locations.isActive, true))
    .orderBy(locations.name);
}

/**
 * Get location by slug
 */
export async function getLocationBySlug(slug: string) {
  const result = await db
    .select()
    .from(locations)
    .where(and(eq(locations.slug, slug), eq(locations.isActive, true)))
    .limit(1);

  return result[0] || null;
}

/**
 * Get location by ID
 */
export async function getLocationById(id: string) {
  const result = await db
    .select()
    .from(locations)
    .where(and(eq(locations.id, id), eq(locations.isActive, true)))
    .limit(1);

  return result[0] || null;
}

/**
 * Check if location is currently open
 */
export function isLocationOpen(
  location: typeof locations.$inferSelect,
): boolean {
  if (location.isTemporarilyClosed) {
    return false;
  }

  const now = new Date();
  const dayName = now
    .toLocaleDateString("en-US", {
      weekday: "long",
    })
    .toLowerCase() as keyof typeof location.operatingHours;
  const hours = location.operatingHours[dayName];

  if (!hours || hours.closed) {
    return false;
  }

  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  return currentTime >= hours.open && currentTime <= hours.close;
}

/**
 * Get next opening time for a location
 */
export function getNextOpeningTime(
  location: typeof locations.$inferSelect,
): string | null {
  if (location.isTemporarilyClosed) {
    return location.closureReason || "Temporarily closed";
  }

  const now = new Date();
  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const currentDay = now.getDay();

  // Check next 7 days
  for (let i = 0; i < 7; i++) {
    const checkDay = (currentDay + i) % 7;
    const dayName = daysOfWeek[checkDay];
    const hours = location.operatingHours[dayName];

    if (hours && !hours.closed) {
      if (i === 0) {
        // Today - check if still to open
        const currentTime = now.toTimeString().slice(0, 5);
        if (currentTime < hours.open) {
          return `Opens today at ${formatTime(hours.open)}`;
        }
      } else {
        return `Opens ${dayName.charAt(0).toUpperCase() + dayName.slice(1)} at ${formatTime(hours.open)}`;
      }
    }
  }

  return null;
}

/**
 * Format 24h time to 12h format
 */
function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get user's saved location
 */
export async function getUserLocation(userId: string) {
  const result = await db
    .select()
    .from(userLocations)
    .where(eq(userLocations.userId, userId))
    .limit(1);

  if (!result[0]) {
    return null;
  }

  return await getLocationById(result[0].locationId);
}

/**
 * Set user's preferred location
 */
export async function setUserLocation(userId: string, locationId: string) {
  // Check if user already has a location
  const existing = await db
    .select()
    .from(userLocations)
    .where(eq(userLocations.userId, userId))
    .limit(1);

  if (existing[0]) {
    // Update existing
    await db
      .update(userLocations)
      .set({ locationId, updatedAt: new Date() })
      .where(eq(userLocations.userId, userId));
  } else {
    // Insert new
    await db.insert(userLocations).values({
      userId,
      locationId,
    });
  }

  return await getLocationById(locationId);
}

/**
 * Check if menu item is available at location
 */
export async function isMenuItemAvailableAtLocation(
  menuItemId: string,
  locationId: string,
): Promise<boolean> {
  const result = await db
    .select()
    .from(menuItemLocations)
    .where(
      and(
        eq(menuItemLocations.menuItemId, menuItemId),
        eq(menuItemLocations.locationId, locationId),
        eq(menuItemLocations.isAvailable, true),
      ),
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Get all menu items available at a location
 */
export async function getMenuItemsForLocation(locationId: string) {
  return await db
    .select({ menuItemId: menuItemLocations.menuItemId })
    .from(menuItemLocations)
    .where(
      and(
        eq(menuItemLocations.locationId, locationId),
        eq(menuItemLocations.isAvailable, true),
      ),
    );
}
