"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";

type Location = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  isOpen?: boolean;
  nextOpeningTime?: string | null;
};

type LocationContextType = {
  currentLocation: Location | null;
  setLocation: (location: Location) => void;
  isLocationModalOpen: boolean;
  openLocationModal: (onSelect?: () => void) => void;
  closeLocationModal: () => void;
  isLoading: boolean;
};

const LocationContext = createContext<LocationContextType | undefined>(
  undefined,
);

const LOCATION_STORAGE_KEY = "caspers-kitchen-location";
const LOCATION_COOKIE_KEY = "location-id";

function setLocationCookie(locationId: string) {
  document.cookie = `${LOCATION_COOKIE_KEY}=${locationId}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

function getLocationCookie(): string | null {
  const match = document.cookie.match(
    new RegExp(`${LOCATION_COOKIE_KEY}=([^;]+)`),
  );
  return match ? match[1] : null;
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [onSelectCallback, setOnSelectCallback] = useState<(() => void) | null>(
    null,
  );

  // Load location from localStorage or user preferences on mount
  useEffect(() => {
    const loadLocation = async () => {
      try {
        // Try to load from localStorage first (for guest users)
        const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
        if (stored) {
          const location = JSON.parse(stored);
          setCurrentLocation(location);
          // Sync cookie for SSR
          setLocationCookie(location.id);
          setIsLoading(false);
          return;
        }

        // Try to fetch user's saved location
        const response = await fetch("/api/locations/user");
        if (response.ok) {
          const data = await response.json();
          if (data.location) {
            setCurrentLocation(data.location);
            // Sync cookie for SSR
            setLocationCookie(data.location.id);
            setIsLoading(false);
            return;
          }
        }

        // No location saved - just finish loading, don't auto-open modal
        // Modal will be triggered when user tries to order
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading location:", error);
        setIsLoading(false);
      }
    };

    loadLocation();
  }, []);

  const setLocation = async (location: Location) => {
    setCurrentLocation(location);

    // Save to localStorage
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));

    // Sync cookie for SSR
    setLocationCookie(location.id);

    // Try to save to user preferences if authenticated
    try {
      await fetch("/api/locations/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId: location.id }),
      });
    } catch (error) {
      console.error("Error saving location to user preferences:", error);
    }

    toast.success(`Location changed to ${location.name}`);

    // Call the callback if one was set (e.g., navigate to menu)
    if (onSelectCallback) {
      onSelectCallback();
      setOnSelectCallback(null);
    }
  };

  const openLocationModal = (onSelect?: () => void) => {
    if (onSelect) {
      setOnSelectCallback(() => onSelect);
    }
    setIsLocationModalOpen(true);
  };

  const closeLocationModal = () => {
    setIsLocationModalOpen(false);
    setOnSelectCallback(null);
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        setLocation,
        isLocationModalOpen,
        openLocationModal,
        closeLocationModal,
        isLoading,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
