"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Sparkles, 
  Calendar, 
  Info, 
  ChevronDown, 
  Phone, 
  Loader2
} from "lucide-react";
import { EventData } from "@/types";
import LZString from "lz-string";

// Load Leaflet component dynamically only on client side to prevent Next SSR failures
const MapComponent = dynamic(() => import("../MapComponent"), { 
  ssr: false,
  loading: () => (
    <div className="h-[250px] w-full rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
      <div className="flex items-center gap-2 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin text-wedding-gold" />
        <span>Loading map system...</span>
      </div>
    </div>
  )
});

interface EventCreationFormProps {
  initialData?: EventData;
  onSuccess: (event: EventData, compressedData: string) => void;
}

export default function EventCreationForm({ initialData, onSuccess }: EventCreationFormProps) {
  // Form States
  const [address, setAddress] = useState(initialData?.address || "");
  const [latitude, setLatitude] = useState<number>(initialData?.latitude || 17.385044);
  const [longitude, setLongitude] = useState<number>(initialData?.longitude || 78.486671);

  const [eventName, setEventName] = useState(initialData?.eventName || "");
  const [hostName, setHostName] = useState(initialData?.hostName || "");
  const [venueName, setVenueName] = useState(initialData?.venueName || "");
  const [description, setDescription] = useState(initialData?.description || "");

  const [date, setDate] = useState(initialData?.date || "");
  const [startTime, setStartTime] = useState(initialData?.startTime || "");
  const [endTime, setEndTime] = useState(initialData?.endTime || "");

  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [website, setWebsite] = useState(initialData?.website || "");
  const [dressCode, setDressCode] = useState(initialData?.dressCode || "");
  const [parkingInfo, setParkingInfo] = useState(initialData?.parkingInfo || "");

  // UI accordion status states
  const [openSection, setOpenSection] = useState<string | null>("location");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleLocationSelect = (lat: number, lng: number, addr: string) => {
    setLatitude(lat);
    setLongitude(lng);
    setAddress(addr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || latitude === undefined || longitude === undefined) {
      setErrorMsg("Please select a location destination on the map first.");
      setOpenSection("location");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    // Simulate short loading state for UX
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const payload: Omit<EventData, "id" | "createdAt" | "updatedAt"> = {
        eventName: eventName || undefined,
        hostName: hostName || undefined,
        venueName: venueName || undefined,
        address,
        latitude,
        longitude,
        date: date || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        description: description || undefined,
        phone: phone || undefined,
        dressCode: dressCode || undefined,
        parkingInfo: parkingInfo || undefined,
        website: website || undefined,
        email: email || undefined,
      };

      // Strip out undefined values to save compression space
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined && v !== "")
      );

      // Compress data for URL embedding
      const jsonString = JSON.stringify(cleanPayload);
      const compressedString = LZString.compressToEncodedURIComponent(jsonString);

      // Construct a faux EventData to keep UI compatibility
      const fauxEvent: EventData = {
        id: "compressed", // Not used for DB anymore
        ...cleanPayload,
        address: address, // Ensure required fields
        latitude: latitude,
        longitude: longitude,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSuccess(fauxEvent, compressedString);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to generate invitation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-lg mx-auto select-none">
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-2 animate-pulse">
          <span className="font-bold">Error:</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Location Section (Required) */}
      <div className="rounded-2xl bg-wedding-purple-mid/40 border border-white/5 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("location")}
          className="w-full flex items-center justify-between p-4 font-semibold text-wedding-gold-light hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-wedding-gold" />
            <span>Destination Location (Required)</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openSection === "location" ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence initial={false}>
          {openSection === "location" && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t border-white/5 p-4 overflow-hidden"
            >
              <MapComponent
                onLocationSelect={handleLocationSelect}
                initialLat={latitude}
                initialLng={longitude}
                initialAddress={address}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Event Metadata Section (Optional) */}
      <div className="rounded-2xl bg-wedding-purple-mid/40 border border-white/5 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("details")}
          className="w-full flex items-center justify-between p-4 font-semibold text-wedding-gold-light hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-wedding-gold" />
            <span>Event Info (Optional)</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openSection === "details" ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence initial={false}>
          {openSection === "details" && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t border-white/5 p-4 space-y-4 overflow-hidden"
            >
              {/* Event Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Event Name</label>
                <input
                  type="text"
                  placeholder="e.g. John & Emma Wedding, Tech Gala, Birthday Party"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-wedding-gold/40 transition-colors"
                />
              </div>

              {/* Host and Venue Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Host Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Emma & Family"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-wedding-gold/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Venue Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Grand Convention Hall"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-wedding-gold/40 transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea
                  placeholder="Tell guests about your event..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-wedding-gold/40 transition-colors resize-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Date & Schedule Section (Optional) */}
      <div className="rounded-2xl bg-wedding-purple-mid/40 border border-white/5 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("schedule")}
          className="w-full flex items-center justify-between p-4 font-semibold text-wedding-gold-light hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-wedding-gold" />
            <span>Date & Schedule (Optional)</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openSection === "schedule" ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence initial={false}>
          {openSection === "schedule" && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t border-white/5 p-4 space-y-4 overflow-hidden"
            >
              {/* Date Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-wedding-gold/40 transition-colors"
                />
              </div>

              {/* Start & End Times */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-wedding-gold/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-wedding-gold/40 transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Details / Contact & Dress Section (Optional) */}
      <div className="rounded-2xl bg-wedding-purple-mid/40 border border-white/5 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("extra")}
          className="w-full flex items-center justify-between p-4 font-semibold text-wedding-gold-light hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-wedding-gold" />
            <span>Additional Info (Optional)</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openSection === "extra" ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence initial={false}>
          {openSection === "extra" && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t border-white/5 p-4 space-y-4 overflow-hidden"
            >
              {/* Contact Info (Phone, Email) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-wedding-gold/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Organizer Email</label>
                  <input
                    type="email"
                    placeholder="e.g. help@event.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-wedding-gold/40 transition-colors"
                  />
                </div>
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Website</label>
                <input
                  type="url"
                  placeholder="e.g. https://yoursite.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-wedding-gold/40 transition-colors"
                />
              </div>

              {/* Dress Code & Parking */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Dress Code</label>
                  <input
                    type="text"
                    placeholder="e.g. Formal, Casual"
                    value={dressCode}
                    onChange={(e) => setDressCode(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-wedding-gold/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Parking Info</label>
                  <input
                    type="text"
                    placeholder="e.g. Valet, Free Parking"
                    value={parkingInfo}
                    onChange={(e) => setParkingInfo(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-wedding-gold/40 transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-6 bg-gradient-to-r from-wedding-gold-dark via-wedding-gold to-wedding-gold-dark text-wedding-purple-dark py-4 px-6 rounded-2xl text-lg font-bold shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.45)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-80 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generating Invitation...</span>
          </>
        ) : (
          <span>Generate Invitation QR</span>
        )}
      </button>
    </form>
  );
}
