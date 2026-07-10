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

function detectTheme(eventName?: string, themeQuery?: string | null): InvitationTheme {
  if (themeQuery === "party" || themeQuery === "corporate" || themeQuery === "wedding") {
    return themeQuery as InvitationTheme;
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

// Helper to transform viewer URLs to raw image URLs (like Google Drive)
function getDirectImageUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  
  // Google Drive: https://drive.google.com/file/d/1B_xyz.../view
  const gdriveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gdriveMatch) {
    return `https://drive.google.com/uc?export=view&id=${gdriveMatch[1]}`;
  }
  
  // Imgur: https://imgur.com/abc -> https://i.imgur.com/abc.jpg
  if (url.includes("imgur.com") && !url.includes("i.imgur.com")) {
    const imgurMatch = url.match(/imgur\.com\/([a-zA-Z0-9]+)$/);
    if (imgurMatch) {
      return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
    }
  }

  // Dropbox: dl=1 for direct download
  if (url.includes("dropbox.com")) {
    return url.replace("?dl=0", "").replace("www.dropbox.com", "dl.dropboxusercontent.com");
  }

  return url;
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
    <div className={`relative min-h-screen w-full flex flex-col items-center justify-start text-white overflow-x-hidden py-10 px-4 md:py-16 transition-colors duration-700 ${styles.bodyBgClass} ${styles.fontClass}`}>
      
      {/* Background Ambient Glows */}
      <div className={`fixed top-[-10%] left-[-15%] w-[70%] aspect-square rounded-full bg-gradient-to-br opacity-40 blur-[140px] pointer-events-none ${styles.glow1Class}`} />
      <div className={`fixed bottom-[-10%] right-[-15%] w-[70%] aspect-square rounded-full bg-gradient-to-br opacity-30 blur-[140px] pointer-events-none ${styles.glow2Class}`} />

      {/* Floating Sparkle Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
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
      <main className="w-full max-w-md flex flex-col gap-6 relative z-10 mt-4">
        
        {/* Main invitation info card with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="w-full rounded-[2rem] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-2xl bg-white/[0.04] overflow-hidden relative"
        >
          {/* Subtle noise texture overlay for premium feel */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

          {/* Photo URL Integration */}
          {event.coverImage ? (
            <div className="w-full h-56 relative overflow-hidden group">
              <img 
                src={getDirectImageUrl(event.coverImage)} 
                alt="Event Cover" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              
              {/* Event Name overlaid on image */}
              <div className="absolute bottom-6 left-6 right-6 text-left drop-shadow-lg">
                <h1 className={`text-3xl font-bold tracking-wide leading-tight text-white`}>
                  {event.eventName || "You're Invited!"}
                </h1>
                {event.hostName && (
                  <p className="text-xs uppercase tracking-widest font-semibold mt-1.5 text-white/90 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Hosted by {event.hostName}</span>
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Header without image */
            <div className={`w-full p-8 text-center bg-gradient-to-br ${styles.titleGradientClass.includes('gold') ? 'from-white/5 to-white/0' : 'from-white/10 to-white/0'} border-b border-white/10`}>
              <h1 className={`text-3xl md:text-4xl font-bold tracking-wide leading-tight filter drop-shadow-md ${styles.titleGradientClass}`}>
                {event.eventName || "You're Invited!"}
              </h1>
              {event.hostName && (
                <p className={`text-[10px] uppercase tracking-widest font-bold mt-3 ${styles.subtitleColorClass} flex items-center justify-center gap-1.5`}>
                  <User className="w-3.5 h-3.5" />
                  <span>Hosted by {event.hostName}</span>
                </p>
              )}
            </div>
          )}

          {/* Details Section */}
          <div className="p-6 md:p-8 space-y-7 relative z-10">
            {/* Date & Time */}
            {hasSchedule && (
              <div className="flex items-start gap-4 group">
                <div className={`p-3.5 rounded-2xl bg-white/5 border border-white/10 shadow-inner group-hover:bg-white/10 transition-colors duration-300 shrink-0`}>
                  <Calendar className={`w-5 h-5 ${styles.iconColorClass}`} />
                </div>
                <div>
                  <p className={`text-[10px] uppercase tracking-widest font-bold ${styles.labelColorClass}`}>Schedule</p>
                  <p className={`text-base font-medium mt-1 text-white tracking-wide`}>
                    {eventDetails.date}
                  </p>
                  <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <span>{eventDetails.time}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Location details */}
            <div className="flex items-start gap-4 group">
              <div className={`p-3.5 rounded-2xl bg-white/5 border border-white/10 shadow-inner group-hover:bg-white/10 transition-colors duration-300 shrink-0`}>
                <MapPin className={`w-5 h-5 ${styles.iconColorClass}`} />
              </div>
              <div className="flex-1">
                <p className={`text-[10px] uppercase tracking-widest font-bold ${styles.labelColorClass}`}>Destination Location</p>
                {event.venueName && (
                  <p className={`text-base font-medium mt-1 text-white tracking-wide`}>
                    {event.venueName}
                  </p>
                )}
                <p className="text-sm text-gray-400 leading-relaxed mt-1 font-medium">
                  {event.address}
                </p>
              </div>
            </div>

            {/* Description details */}
            {event.description && (
              <div className="flex items-start gap-4 pt-5 border-t border-white/10 group">
                <div className={`p-3.5 rounded-2xl bg-white/5 border border-white/10 shadow-inner group-hover:bg-white/10 transition-colors duration-300 shrink-0`}>
                  <FileText className={`w-5 h-5 ${styles.iconColorClass}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-[10px] uppercase tracking-widest font-bold ${styles.labelColorClass}`}>About Event</p>
                  <p className="text-sm text-gray-300 mt-1.5 leading-relaxed whitespace-pre-line font-medium">
                    {event.description}
                  </p>
                </div>
              </div>
            )}

            {/* Dress & Parking details */}
            {(event.dressCode || event.parkingInfo) && (
              <div className="pt-5 border-t border-white/10 grid grid-cols-2 gap-6">
                {event.dressCode && (
                  <div className="flex gap-3 items-start group">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors duration-300">
                      <Shirt className={`w-4 h-4 ${styles.iconColorClass}`} />
                    </div>
                    <div>
                      <p className={`text-[9px] uppercase font-bold tracking-widest ${styles.labelColorClass}`}>Dress Code</p>
                      <p className="text-xs text-white font-medium mt-1">{event.dressCode}</p>
                    </div>
                  </div>
                )}
                {event.parkingInfo && (
                  <div className="flex gap-3 items-start group">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors duration-300">
                      <Car className={`w-4 h-4 ${styles.iconColorClass}`} />
                    </div>
                    <div>
                      <p className={`text-[9px] uppercase font-bold tracking-widest ${styles.labelColorClass}`}>Parking</p>
                      <p className="text-xs text-white font-medium mt-1">{event.parkingInfo}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Dynamic call to actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col gap-4 w-full px-1"
        >
          {/* 📍 Get Directions */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[1.2rem] opacity-30 group-hover:opacity-60 blur transition duration-500 pointer-events-none" />
            <DirectionsButton
              latitude={event.latitude}
              longitude={event.longitude}
              address={event.address}
              styles={styles}
              onNotify={showToast}
            />
          </div>

          {/* Add to Calendar */}
          {hasSchedule && (
            <CalendarButton
              eventDetails={eventDetails}
              styles={styles}
              onNotify={showToast}
            />
          )}

          {/* Organizer Call Dial */}
          {event.phone && (
            <a
              href={`tel:${event.phone}`}
              className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-[1.1rem] bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] text-white text-base font-bold tracking-wide shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 select-none backdrop-blur-md"
            >
              <Phone className="w-5 h-5 text-green-400" />
              <span>Call Organizer</span>
            </a>
          )}
        </motion.div>

        {/* Contact links card */}
        {(event.email || event.website) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className={`w-full px-1 flex justify-center gap-4 text-xs ${styles.fontClass}`}
          >
            {event.email && (
              <a href={`mailto:${event.email}`} className="flex items-center gap-2 py-2 px-4 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all backdrop-blur-md">
                <Mail className={`w-3.5 h-3.5 ${styles.iconColorClass}`} />
                <span>{event.email}</span>
              </a>
            )}
            {event.website && (
              <a href={event.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-2 px-4 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all backdrop-blur-md">
                <Globe className={`w-3.5 h-3.5 ${styles.iconColorClass}`} />
                <span>Website</span>
              </a>
            )}
          </motion.div>
        )}

        {/* Branding Footer */}
        <footer className="w-full text-center py-6 mt-4 select-none opacity-60 hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className={`h-[1px] w-12 bg-gradient-to-r from-transparent to-white/30`} />
            <Heart className={`w-3.5 h-3.5 animate-pulse ${styles.footerHeartColorClass}`} />
            <div className={`h-[1px] w-12 bg-gradient-to-l from-transparent to-white/30`} />
          </div>
          <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
            Smart Invitation
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
