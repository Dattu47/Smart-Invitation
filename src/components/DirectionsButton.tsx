"use client";

import { Navigation } from "lucide-react";
import { ThemeStyles } from "../config/themes";

interface DirectionsButtonProps {
  latitude: number;
  longitude: number;
  address?: string;
  styles: ThemeStyles;
  onNotify: (message: string, type: "success" | "error" | "info") => void;
}

export default function DirectionsButton({
  latitude,
  longitude,
  address,
  styles,
  onNotify,
}: DirectionsButtonProps) {
  const query = (latitude && longitude)
    ? `${latitude},${longitude}`
    : encodeURIComponent(address || "");
  const navUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <a
      href={navUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onNotify("Opening Google Maps...", "success")}
      className={`w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl text-lg font-bold tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 select-none cursor-pointer ${styles.directionButtonClass}`}
    >
      <Navigation className="w-6 h-6 fill-current" />
      <span>Get Directions</span>
    </a>
  );
}
