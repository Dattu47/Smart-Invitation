"use client";

import { useEffect, useState } from "react";
import { GoogleMap, useLoadScript, MarkerF, Autocomplete } from "@react-google-maps/api";
import { Search, MapPin, Loader2 } from "lucide-react";

const libraries: ("places")[] = ["places"];

interface MapComponentProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
}

const mapContainerStyle = {
  width: "100%",
  height: "250px",
};

export default function MapComponent({
  onLocationSelect,
  initialLat = 17.385044, 
  initialLng = 78.486671,
  initialAddress = "",
}: MapComponentProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const [center, setCenter] = useState({ lat: initialLat, lng: initialLng });
  const [markerPos, setMarkerPos] = useState({ lat: initialLat, lng: initialLng });
  const [currentAddress, setCurrentAddress] = useState(initialAddress);
  const [isSearching, setIsSearching] = useState(false);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  // Sync with initial props
  useEffect(() => {
    if (initialLat && initialLng) {
      setCenter({ lat: initialLat, lng: initialLng });
      setMarkerPos({ lat: initialLat, lng: initialLng });
    }
    if (initialAddress) {
      setCurrentAddress(initialAddress);
    }
  }, [initialLat, initialLng, initialAddress]);

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsSearching(true);
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const formattedAddress = results[0].formatted_address;
          setCurrentAddress(formattedAddress);
          onLocationSelect(lat, lng, formattedAddress);
        } else {
          const fallbackAddress = `Location at ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setCurrentAddress(fallbackAddress);
          onLocationSelect(lat, lng, fallbackAddress);
        }
        setIsSearching(false);
      });
    } catch (err) {
      console.error("Reverse geocoding fail:", err);
      setIsSearching(false);
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPos({ lat, lng });
      reverseGeocode(lat, lng);
    }
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPos({ lat, lng });
      reverseGeocode(lat, lng);
    }
  };

  const onLoadAutocomplete = (autoC: google.maps.places.Autocomplete) => {
    setAutocomplete(autoC);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || place.name || "";
        
        setCenter({ lat, lng });
        setMarkerPos({ lat, lng });
        setCurrentAddress(address);
        onLocationSelect(lat, lng, address);
      }
    }
  };

  if (loadError) {
    return (
      <div className="h-[250px] w-full rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col items-center justify-center p-4 text-center">
        <p className="text-red-400 text-sm font-semibold mb-2">Failed to load Google Maps</p>
        <p className="text-red-300 text-xs">Please check your NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Geocoding Address Search bar */}
      {!isLoaded ? (
        <div className="relative w-full h-[46px] bg-white/5 animate-pulse rounded-xl" />
      ) : (
        <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged} className="w-full">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search venue or address..."
              className="w-full bg-white/5 border border-white/10 focus:border-wedding-gold/40 rounded-xl px-4 py-3 pl-10 text-sm outline-none text-white transition-all"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // Prevent form submission on enter
                }
              }}
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          </div>
        </Autocomplete>
      )}

      {/* Interactive Map Canvas Container */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-wedding-purple-mid h-[250px]">
        {!isLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-wedding-gold" />
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={14}
            onClick={handleMapClick}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
            }}
          >
            <MarkerF
              position={markerPos}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
            />
          </GoogleMap>
        )}

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
      {currentAddress && (
        <div className="flex items-start gap-2 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-gray-300">
          <MapPin className="w-4 h-4 text-wedding-gold shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-wedding-gold-light mb-0.5">Selected Coordinates/Address:</p>
            <p className="leading-relaxed">{currentAddress}</p>
          </div>
        </div>
      )}
    </div>
  );
}
