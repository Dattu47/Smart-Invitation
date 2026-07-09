"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Search, MapPin, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
}

// Leaflet default icon configuration to resolve Next.js path resolution problems
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function MapComponent({
  onLocationSelect,
  initialLat = 17.385044, // Default to Hyderabad Charminar area
  initialLng = 78.486671,
  initialAddress = "",
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Reverse Geocoding (Coordinates -> Address string) via OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsSearching(true);
    try {
      // Adding email parameter to comply with Nominatim's Usage Policy and reduce rate limiting
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&email=smartinvitation@example.com`,
        { headers: { "Accept-Language": "en" } }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      const formattedAddress = data.display_name || `Location at ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      onLocationSelect(lat, lng, formattedAddress);
    } catch (err) {
      console.error("Reverse geocoding fail:", err);
      const fallbackAddress = `Location at ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      onLocationSelect(lat, lng, fallbackAddress);
    } finally {
      setIsSearching(false);
    }
  };

  // Direct Geocoding (Address string -> Coordinates) via Nominatim Search API
  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Adding email parameter to comply with Nominatim's Usage Policy and reduce rate limiting
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1&addressdetails=1&email=smartinvitation@example.com`,
        { headers: { "Accept-Language": "en" } }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const results = await response.json();

      if (results && results.length > 0) {
        const { lat, lon, display_name } = results[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);

        if (leafletMap.current && markerRef.current) {
          leafletMap.current.setView([newLat, newLng], 14);
          markerRef.current.setLatLng([newLat, newLng]);
          onLocationSelect(newLat, newLng, display_name);
        }
      } else {
        alert("Location not found on OpenStreetMap. Try refining your query or dropping the pin manually.");
      }
    } catch (err) {
      console.error("Geocoding search failure:", err);
      alert("Failed to search location. Please check your network or try again later.");
    } finally {
      setIsSearching(false);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Initialize Leaflet Map instance
    leafletMap.current = L.map(mapRef.current).setView([initialLat, initialLng], 13);

    // Load OpenStreetMap Tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(leafletMap.current);

    // Create and add initial marker
    markerRef.current = L.marker([initialLat, initialLng], {
      icon: markerIcon,
      draggable: true,
    }).addTo(leafletMap.current);

    // Reverse geocode on marker drag end
    markerRef.current.on("dragend", async () => {
      if (!markerRef.current) return;
      const pos = markerRef.current.getLatLng();
      await reverseGeocode(pos.lat, pos.lng);
    });

    // Handle map clicks to relocate pin
    leafletMap.current.on("click", async (e) => {
      if (!markerRef.current) return;
      const { lat, lng } = e.latlng;
      markerRef.current.setLatLng([lat, lng]);
      await reverseGeocode(lat, lng);
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update map view if initial position updates (e.g., when editing existing event)
  useEffect(() => {
    if (leafletMap.current && markerRef.current && initialLat && initialLng) {
      const latLng = L.latLng(initialLat, initialLng);
      markerRef.current.setLatLng(latLng);
      leafletMap.current.setView(latLng, 14);
    }
  }, [initialLat, initialLng]);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Geocoding Address Search bar */}
      <form onSubmit={handleAddressSearch} className="flex gap-2 w-full">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search venue or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 focus:border-wedding-gold/40 rounded-xl px-4 py-3 pl-10 text-sm outline-none text-white transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="bg-wedding-purple-light hover:bg-wedding-purple-light/80 text-white rounded-xl px-4 py-3 text-sm font-semibold border border-wedding-gold/20 flex items-center gap-2 cursor-pointer transition-all duration-300 disabled:opacity-50 shrink-0"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>Search</span>
        </button>
      </form>

      {/* Interactive Map Canvas Container */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-wedding-purple-mid">
        <div ref={mapRef} className="h-[250px] w-full z-10" />
        {isSearching && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-wedding-purple-dark border border-wedding-gold/30 rounded-xl p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-wedding-gold" />
              <span className="text-xs font-semibold text-wedding-gold-light">Syncing Location...</span>
            </div>
          </div>
        )}
      </div>

      {/* Selection Display Info */}
      {initialAddress && (
        <div className="flex items-start gap-2 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-gray-300">
          <MapPin className="w-4 h-4 text-wedding-gold shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-wedding-gold-light mb-0.5">Selected Coordinates/Address:</p>
            <p className="leading-relaxed">{initialAddress}</p>
          </div>
        </div>
      )}
    </div>
  );
}

