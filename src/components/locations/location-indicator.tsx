"use client";

import { useLocation } from "@/lib/locations/context";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";

export function LocationIndicator() {
  const { currentLocation, openLocationModal, isLoading } = useLocation();

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={openLocationModal}
      className="gap-2"
    >
      <MapPin className="h-4 w-4" />
      <span className="hidden sm:inline">
        {currentLocation?.name || "Select Location"}
      </span>
    </Button>
  );
}
