"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Shirt, 
  Car, 
  FileText,
  User,
  Heart
} from "lucide-react";
import { EventData } from "@/types";
import { THEME_STYLES_MAP, InvitationTheme } from "@/config/themes";
import DirectionsButton from "@/components/DirectionsButton";
import CalendarButton from "@/components/CalendarButton";
import Toast from "@/components/Toast";

interface InvitationClientViewProps {
  event: EventData;
  themeQuery?: string | null;
}

// Automatically detect best theme based on keywords in the event title
function detectTheme(eventName?: string, themeQuery?: string | null): InvitationTheme {
  if (themeQuery === "party" || themeQuery === "corporate" || themeQuery === "wedding") {
    return themeQuery;
  }
  
  const name = (eventName || "").toLowerCase();
  if (
    name.includes("party") || 
    name.includes("birthday") || 
    name.includes("celebration") || 
    name.includes("dj") || 
    name.includes("dance") || 
    name.includes("club") ||
    name.includes("anniversary")
  ) {
    return "party";
  }
  if (
    name.includes("summit") || 
    name.includes("conference") || 
    name.includes("meeting") || 
    name.includes("tech") || 
    name.includes("seminar") || 
    name.includes("corporate") || 
    name.includes("annual")
  ) {
    return "corporate";
  }
  
  return "wedding"; // Classic elegant purple/gold default
}

export default function InvitationClientView({ event, themeQuery }: InvitationClientViewProps) {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  const activeTheme = detectTheme(event.eventName, themeQuery);
  const styles = THEME_STYLES_MAP[activeTheme];

  // Helper date conversions for calendar utilities
  const hasSchedule = !!(event.date && event.startTime);
  
  // Calculate start/end ISO times for calendar exports if scheduling is provided
  let startISO = "";
  let endISO = "";
  if (hasSchedule && event.date && event.startTime) {
    startISO = `${event.date}T${event.startTime}:00`;
    if (event.endTime) {
      endISO = `${event.date}T${event.endTime}:00`;
    } else {
      // Default to 3 hours duration if end time is omitted
      const [sh, sm] = event.startTime.split(":").map(Number);
      const endH = String((sh + 3) % 24).padStart(2, "0");
      endISO = `${event.date}T${endH}:${String(sm).padStart(2, "0")}:00`;
    }
  }

  // Construct complete EventDetails model to reuse the components
  const eventDetails = {
    title: event.eventName || "Invitation Destination",
    coupleNames: event.hostName || "",
    date: event.date
      ? new Date(event.date).toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "",
    time: event.startTime ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ""}` : "",
    venueName: event.venueName || "Venue Destination",
    address: event.address,
    latitude: event.latitude,
    longitude: event.longitude,
    startDateTime: startISO,
    endDateTime: endISO,
    description: event.description || "We look forward to celebrating with you.",
  };

  // Specs for floating background particles
  const backgroundElements = [
    { size: 120, left: "5%", delay: 0, duration: 18 },
    { size: 80, left: "80%", delay: 2, duration: 22 },
    { size: 140, left: "70%", delay: 6, duration: 26 },
    { size: 100, left: "15%", delay: 9, duration: 20 },
  ];

  return (
    <div className={`relative min-h-screen w-full flex flex-col items-center justify-start text-white overflow-hidden py-10 px-4 md:py-16 transition-colors duration-700 ${styles.bodyBgClass} ${styles.fontClass}`}>
      
      {/* Background Ambient Glows */}
      <div className={`absolute top-[-10%] left-[-15%] w-[70%] aspect-square rounded-full bg-gradient-to-br opacity-30 blur-[120px] pointer-events-none ${styles.glow1Class}`} />
      <div className={`absolute bottom-[-10%] right-[-15%] w-[70%] aspect-square rounded-full bg-gradient-to-br opacity-20 blur-[120px] pointer-events-none ${styles.glow2Class}`} />

      {/* Floating Sparkle Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {backgroundElements.map((el, i) => (
          <div
            key={i}
            className={`absolute rounded-full border backdrop-blur-[2px] animate-float-particle ${styles.particleBorderColorClass}`}
            style={{
              width: `${el.size}px`,
              height: `${el.size}px`,
              left: el.left,
              animationDelay: `${el.delay}s`,
              animationDuration: `${el.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Content wrapper */}
      <main className="w-full max-w-md flex flex-col gap-6 relative z-10">
        


        {/* Hero title info */}
        {event.eventName && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center select-none"
          >
            <h1 className={`text-4xl font-bold tracking-wide leading-tight filter drop-shadow-md ${styles.titleGradientClass}`}>
              {event.eventName}
            </h1>
            {event.hostName && (
              <p className={`text-xs uppercase tracking-widest font-semibold mt-2 ${styles.subtitleColorClass} flex items-center justify-center gap-1.5`}>
                <User className="w-3.5 h-3.5" />
                <span>Hosted by {event.hostName}</span>
              </p>
            )}
          </motion.header>
        )}

        {/* Main invitation info card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 60 }}
          className={`w-full p-6 rounded-3xl border space-y-6 ${styles.cardBgClass}`}
        >
          {/* Card title if hero header was missing */}
          {!event.eventName && (
            <div className="text-center pb-2 select-none">
              <h2 className={`text-2xl font-bold tracking-wide ${styles.titleGradientClass}`}>
                You're Invited!
              </h2>
              <p className={`text-[10px] uppercase tracking-widest mt-1 ${styles.labelColorClass}`}>
                Event Invitation Details
              </p>
            </div>
          )}

          {/* Date & Time (Conditional) */}
          {hasSchedule && (
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl border shrink-0 ${styles.iconContainerBgClass}`}>
                <Calendar className={`w-5 h-5 ${styles.iconColorClass}`} />
              </div>
              <div>
                <p className={`text-xs uppercase tracking-wider font-semibold ${styles.labelColorClass}`}>Schedule</p>
                <p className={`text-base font-semibold mt-0.5 ${styles.valueColorClass}`}>
                  {eventDetails.date}
                </p>
                <p className="text-sm text-gray-300 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{eventDetails.time}</span>
                </p>
              </div>
            </div>
          )}

          {/* Location details */}
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl border shrink-0 ${styles.iconContainerBgClass}`}>
              <MapPin className={`w-5 h-5 ${styles.iconColorClass}`} />
            </div>
            <div>
              <p className={`text-xs uppercase tracking-wider font-semibold ${styles.labelColorClass}`}>Destination Location</p>
              {event.venueName && (
                <p className={`text-base font-semibold mt-0.5 ${styles.valueColorClass}`}>
                  {event.venueName}
                </p>
              )}
              <p className="text-sm text-gray-300 leading-relaxed mt-1">
                {event.address}
              </p>
            </div>
          </div>

          {/* Description details (Conditional) */}
          {event.description && (
            <div className="flex items-start gap-4 pt-2 border-t border-white/[0.05]">
              <div className={`p-3 rounded-2xl border shrink-0 ${styles.iconContainerBgClass}`}>
                <FileText className={`w-5 h-5 ${styles.iconColorClass}`} />
              </div>
              <div className="flex-1">
                <p className={`text-xs uppercase tracking-wider font-semibold ${styles.labelColorClass}`}>About Event</p>
                <p className="text-sm text-gray-200 mt-1 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            </div>
          )}

          {/* Dress & Parking details (Conditional) */}
          {(event.dressCode || event.parkingInfo) && (
            <div className="pt-4 border-t border-white/[0.05] grid grid-cols-2 gap-4">
              {event.dressCode && (
                <div className="flex gap-2">
                  <Shirt className={`w-4 h-4 shrink-0 mt-0.5 ${styles.iconColorClass}`} />
                  <div>
                    <p className={`text-[10px] uppercase font-bold tracking-wide ${styles.labelColorClass}`}>Dress Code</p>
                    <p className="text-xs text-gray-200 font-semibold mt-0.5">{event.dressCode}</p>
                  </div>
                </div>
              )}
              {event.parkingInfo && (
                <div className="flex gap-2">
                  <Car className={`w-4 h-4 shrink-0 mt-0.5 ${styles.iconColorClass}`} />
                  <div>
                    <p className={`text-[10px] uppercase font-bold tracking-wide ${styles.labelColorClass}`}>Parking</p>
                    <p className="text-xs text-gray-200 font-semibold mt-0.5">{event.parkingInfo}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Dynamic call to actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-3.5 w-full px-1"
        >
          {/* 📍 Get Directions (Always required) */}
          <DirectionsButton
            latitude={event.latitude}
            longitude={event.longitude}
            styles={styles}
            onNotify={showToast}
          />

          {/* Add to Calendar (Conditional) */}
          {hasSchedule && (
            <CalendarButton
              eventDetails={eventDetails}
              styles={styles}
              onNotify={showToast}
            />
          )}

          {/* Organizer Call Dials (Conditional) */}
          {event.phone && (
            <a
              href={`tel:${event.phone}`}
              className="w-full flex items-center justify-center gap-3 px-8 py-4.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 text-gray-200 hover:text-white text-base font-bold tracking-wide shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 select-none"
            >
              <Phone className="w-5 h-5 text-green-400 fill-current" />
              <span>Call Organizer</span>
            </a>
          )}
        </motion.div>

        {/* Contact links card (Optional) */}
        {(event.email || event.website) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={`w-full p-4 rounded-2xl border flex flex-col gap-3 text-xs bg-white/[0.01] border-white/[0.05] ${styles.fontClass}`}
          >
            {event.email && (
              <a href={`mailto:${event.email}`} className="flex items-center gap-2.5 text-gray-300 hover:text-white transition-colors">
                <Mail className={`w-4 h-4 ${styles.iconColorClass}`} />
                <span>{event.email}</span>
              </a>
            )}
            {event.website && (
              <a href={event.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-gray-300 hover:text-white transition-colors truncate">
                <Globe className={`w-4 h-4 ${styles.iconColorClass}`} />
                <span>{event.website}</span>
              </a>
            )}
          </motion.div>
        )}

        {/* Branding Footer */}
        <footer className="w-full text-center py-6 select-none">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className={`h-[1px] w-10 ${styles.dividerBgClass}`} />
            <Heart className={`w-3.5 h-3.5 animate-pulse ${styles.footerHeartColorClass}`} />
            <div className={`h-[1px] w-10 ${styles.dividerBgClass}`} />
          </div>
          <p className="text-[10px] text-gray-500 tracking-wider">
            Smart Digital Invitation QR Platform
          </p>
        </footer>
      </main>

      {/* Visual notification popup */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
