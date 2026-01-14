"use client";

import { useState, useEffect } from "react";
import { useLocation } from "@/lib/locations/context";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";

export function LocationIndicator() {
  const [mounted, setMounted] = useState(false);
  const { currentLocation, openLocationModal, isLoading } = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state during SSR and before mount to prevent hydration mismatch
  if (!mounted || isLoading) {
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
      onClick={() => openLocationModal()}
      className="gap-2"
    >
      <MapPin className="h-4 w-4" />
      <span className="hidden sm:inline">
        {currentLocation?.name || "Select Location"}
      </span>
    </Button>
  );
}
