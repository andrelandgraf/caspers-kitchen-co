"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLocation } from "@/lib/locations/context";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

type Location = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  address?: string;
  neighborhood?: string;
  phone?: string;
  email?: string;
  deliveryZoneDescription?: string;
  isOpen: boolean;
  nextOpeningTime?: string | null;
  distance?: number;
  operatingHours?: Record<
    string,
    { open: string; close: string; closed?: boolean }
  >;
};

export default function LocationsPage() {
  const { setLocation } = useLocation();
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // Try to get geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const response = await fetch(
                `/api/locations?lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
              );
              if (response.ok) {
                const data = await response.json();
                // Fetch full location details
                const detailedLocations = await Promise.all(
                  data.locations.map(async (loc: any) => {
                    const detailResponse = await fetch(
                      `/api/locations/${loc.slug}`,
                    );
                    if (detailResponse.ok) {
                      const detailData = await detailResponse.json();
                      return {
                        ...detailData.location,
                        isOpen: loc.isOpen,
                        nextOpeningTime: loc.nextOpeningTime,
                        distance: loc.distance,
                      };
                    }
                    return loc;
                  }),
                );
                setLocations(detailedLocations);
              }
              setIsLoading(false);
            },
            async () => {
              // Fallback without geolocation
              const response = await fetch("/api/locations");
              if (response.ok) {
                const data = await response.json();
                const detailedLocations = await Promise.all(
                  data.locations.map(async (loc: any) => {
                    const detailResponse = await fetch(
                      `/api/locations/${loc.slug}`,
                    );
                    if (detailResponse.ok) {
                      const detailData = await detailResponse.json();
                      return {
                        ...detailData.location,
                        isOpen: loc.isOpen,
                        nextOpeningTime: loc.nextOpeningTime,
                      };
                    }
                    return loc;
                  }),
                );
                setLocations(detailedLocations);
              }
              setIsLoading(false);
            },
          );
        } else {
          // No geolocation available
          const response = await fetch("/api/locations");
          if (response.ok) {
            const data = await response.json();
            const detailedLocations = await Promise.all(
              data.locations.map(async (loc: any) => {
                const detailResponse = await fetch(
                  `/api/locations/${loc.slug}`,
                );
                if (detailResponse.ok) {
                  const detailData = await detailResponse.json();
                  return {
                    ...detailData.location,
                    isOpen: loc.isOpen,
                    nextOpeningTime: loc.nextOpeningTime,
                  };
                }
                return loc;
              }),
            );
            setLocations(detailedLocations);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleSelectLocation = (location: Location) => {
    setLocation({
      id: location.id,
      name: location.name,
      slug: location.slug,
      city: location.city,
      state: location.state,
      isOpen: location.isOpen,
      nextOpeningTime: location.nextOpeningTime,
    });
    router.push("/menu");
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Locations
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose the kitchen closest to you for the freshest meals
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {locations.map((location) => (
                <Card
                  key={location.id}
                  className="hover:border-primary/50 transition-all"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <CardTitle className="text-2xl mb-1">
                          {location.name}
                        </CardTitle>
                        {location.neighborhood && (
                          <CardDescription className="text-base">
                            {location.neighborhood}
                          </CardDescription>
                        )}
                      </div>
                      {location.distance && (
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {location.distance.toFixed(1)} mi
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {location.isOpen ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="text-green-600 font-medium">
                            Open Now
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-600" />
                          <span className="text-red-600">
                            Closed
                            {location.nextOpeningTime &&
                              ` • ${location.nextOpeningTime}`}
                          </span>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Address */}
                    {location.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="text-sm">
                          <p>{location.address}</p>
                          <p>
                            {location.city}, {location.state}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Operating Hours */}
                    {location.operatingHours && (
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium mb-1">Hours</p>
                          {Object.entries(location.operatingHours).map(
                            ([day, hours]) => (
                              <div
                                key={day}
                                className="flex justify-between gap-4"
                              >
                                <span className="capitalize">{day}:</span>
                                <span className="text-muted-foreground">
                                  {hours.closed
                                    ? "Closed"
                                    : `${formatTime(hours.open)} - ${formatTime(hours.close)}`}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {/* Delivery Zone */}
                    {location.deliveryZoneDescription && (
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">
                          Delivery Area
                        </p>
                        <p>{location.deliveryZoneDescription}</p>
                      </div>
                    )}

                    {/* Contact */}
                    <div className="space-y-2 pt-4 border-t">
                      {location.phone && (
                        <a
                          href={`tel:${location.phone}`}
                          className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                        >
                          <Phone className="h-4 w-4" />
                          {location.phone}
                        </a>
                      )}
                      {location.email && (
                        <a
                          href={`mailto:${location.email}`}
                          className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                          {location.email}
                        </a>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button
                      className="w-full"
                      onClick={() => handleSelectLocation(location)}
                    >
                      Order from Here
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && locations.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                No locations available at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
