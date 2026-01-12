"use client";

import { useState, useEffect } from "react";
import { useLocation } from "@/lib/locations/context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Location = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  neighborhood?: string;
  isOpen: boolean;
  nextOpeningTime?: string | null;
  distance?: number;
};

export function LocationSelectorModal() {
  const {
    currentLocation,
    setLocation,
    isLocationModalOpen,
    closeLocationModal,
  } = useLocation();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  // Fetch locations with optional geolocation
  useEffect(() => {
    if (!isLocationModalOpen) return;

    const fetchLocations = async (lat?: number, lon?: number) => {
      try {
        const url =
          lat && lon
            ? `/api/locations?lat=${lat}&lon=${lon}`
            : "/api/locations";
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setLocations(data.locations);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Try to get user's geolocation first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords({ lat: latitude, lon: longitude });
          fetchLocations(latitude, longitude);
        },
        () => {
          // Geolocation denied or unavailable - fetch without coords
          fetchLocations();
        },
      );
    } else {
      // No geolocation support - fetch without coords
      fetchLocations();
    }
  }, [isLocationModalOpen]);

  // Sort locations by distance if geolocation available
  const sortedLocations = userCoords
    ? [...locations].sort(
        (a, b) => (a.distance || Infinity) - (b.distance || Infinity),
      )
    : locations;

  const handleSelectLocation = (location: Location) => {
    setLocation(location);
    closeLocationModal();
  };

  return (
    <Dialog
      open={isLocationModalOpen}
      onOpenChange={(open) => !open && currentLocation && closeLocationModal()}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Your Location</DialogTitle>
          <DialogDescription>
            Select the kitchen closest to you for the best delivery experience
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            {sortedLocations.map((location) => (
              <button
                key={location.id}
                onClick={() => handleSelectLocation(location)}
                className={cn(
                  "text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50 hover:bg-primary/5",
                  currentLocation?.id === location.id
                    ? "border-primary bg-primary/5"
                    : "border-border",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">{location.name}</h3>
                      {location.distance && (
                        <span className="text-sm text-muted-foreground">
                          ({location.distance.toFixed(1)} mi)
                        </span>
                      )}
                    </div>
                    {location.neighborhood && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {location.neighborhood}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      {location.isOpen ? (
                        <>
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">
                            Open Now
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-600">
                            Closed
                            {location.nextOpeningTime &&
                              ` • ${location.nextOpeningTime}`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {currentLocation?.id === location.id && (
                    <div className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      Selected
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {!isLoading && locations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No locations available at the moment.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
