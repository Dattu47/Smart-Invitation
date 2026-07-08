"use client";

import { useState } from "react";
import { Navigation, Loader2 } from "lucide-react";
import { ThemeStyles } from "../config/themes";

interface DirectionsButtonProps {
  latitude: number;
  longitude: number;
  styles: ThemeStyles;
  onNotify: (message: string, type: "success" | "error" | "info") => void;
}

export default function DirectionsButton({
  latitude,
  longitude,
  styles,
  onNotify,
}: DirectionsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetDirections = () => {
    setIsLoading(true);

    if (!navigator.geolocation) {
      onNotify(
        "Geolocation is not supported by your browser. Opening destination in Google Maps.",
        "error"
      );
      const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
      window.open(fallbackUrl, "_blank");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const navUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${latitude},${longitude}&travelmode=driving`;
        window.open(navUrl, "_blank");
        onNotify("Opening Google Maps with directions from your location.", "success");
        setIsLoading(false);
      },
      (error) => {
        let errorMsg = "Geolocation is unavailable. Opening destination in Google Maps.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Location permission was not granted. Opening destination in Google Maps.";
        }
        onNotify(errorMsg, "error");
        const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
        window.open(fallbackUrl, "_blank");
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
    );
  };

  return (
    <button
      onClick={handleGetDirections}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl text-lg font-bold tracking-wide hover:scale-[1.02] active:scale-[0.98] disabled:opacity-85 transition-all duration-300 select-none cursor-pointer ${styles.directionButtonClass}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Locating...</span>
        </>
      ) : (
        <>
          <Navigation className="w-6 h-6 fill-current" />
          <span>Get Directions</span>
        </>
      )}
    </button>
  );
}
