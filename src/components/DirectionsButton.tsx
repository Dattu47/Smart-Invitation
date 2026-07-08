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
    // We instantly open Google Maps with the destination.
    // Google Maps will automatically use the user's current location as the origin.
    // Doing geolocation on our side causes popup blockers to trigger on mobile browsers.
    const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
    window.open(navUrl, "_blank");
    onNotify("Opening Google Maps...", "success");
  };

  return (
    <button
      onClick={handleGetDirections}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl text-lg font-bold tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 select-none cursor-pointer ${styles.directionButtonClass}`}
    >
      <Navigation className="w-6 h-6 fill-current" />
      <span>Get Directions</span>
    </button>
  );
}
