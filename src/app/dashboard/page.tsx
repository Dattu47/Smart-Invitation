"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Plus, 
  Search, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Edit2, 
  Copy, 
  Download, 
  Trash2, 
  Loader2, 
  Check, 
  X 
} from "lucide-react";
import QRCode from "qrcode";
import { EventData } from "@/types";
import EventCreationForm from "@/components/forms/EventCreationForm";

// Self-contained dynamic QR Code renderer for card listings
function DashboardQR({ eventId }: { eventId: string }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    if (!eventId) return;
    const url = `${window.location.origin}/invite/${eventId}`;
    QRCode.toDataURL(url, { margin: 1, width: 200, color: { dark: "#0e051d" } })
      .then(setSrc)
      .catch((e) => console.error(e));
  }, [eventId]);

  return src ? (
    <img src={src} alt="Event QR" className="w-16 h-16 rounded-xl object-contain bg-white p-1" />
  ) : (
    <div className="w-16 h-16 rounded-xl bg-white/5 animate-pulse" />
  );
}

export default function Dashboard() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Controls for interactive operations
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchEvents = () => {
    setIsLoading(true);
    try {
      const savedEvents = JSON.parse(localStorage.getItem("smart_invitations") || "[]");
      setEvents(savedEvents);
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch events list on mount
  useEffect(() => {
    Promise.resolve().then(() => {
      fetchEvents();
    });
  }, []);

  const handleCopyLink = (event: EventData) => {
    const url = `${window.location.origin}/invite/${event.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(event.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadQR = async (event: EventData) => {
    try {
      const url = `${window.location.origin}/invite/${event.id}`;
      const qrData = await QRCode.toDataURL(url, { width: 500, margin: 1 });
      
      const link = document.createElement("a");
      link.href = qrData;
      const slug = (event.eventName || "event")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_");
      link.download = `qr_${slug}_${event.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = (id: string) => {
    const updatedEvents = events.filter((e) => e.id !== id);
    setEvents(updatedEvents);
    localStorage.setItem("smart_invitations", JSON.stringify(updatedEvents));
    setDeleteConfirmId(null);
  };

  const handleEditSuccess = (updatedEvent: EventData) => {
    const newEvent = { ...updatedEvent, id: editingEvent!.id };
    const updatedEvents = events.map((e) => (e.id === newEvent.id ? newEvent : e));
    setEvents(updatedEvents);
    localStorage.setItem("smart_invitations", JSON.stringify(updatedEvents));
    setEditingEvent(null);
  };

  // Filter lists based on Search criteria
  const filteredEvents = events.filter((e) => {
    const term = searchQuery.toLowerCase();
    const name = (e.eventName || "Location Event").toLowerCase();
    const host = (e.hostName || "").toLowerCase();
    const venue = (e.venueName || "").toLowerCase();
    const addr = e.address.toLowerCase();
    return name.includes(term) || host.includes(term) || venue.includes(term) || addr.includes(term);
  });

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start bg-wedding-purple-dark text-white overflow-hidden py-10 px-4 md:py-16">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-15%] w-[70%] aspect-square rounded-full bg-gradient-to-br from-wedding-purple-mid to-wedding-purple-light opacity-30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[70%] aspect-square rounded-full bg-gradient-to-br from-wedding-purple-light to-wedding-pink opacity-25 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <main className="w-full max-w-4xl flex flex-col gap-8 relative z-10">
        
        {/* Navigation / Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-wedding-gold" />
            <Link href="/" className="font-serif text-xl font-bold text-gold-gradient cursor-pointer">
              Smart Invitation
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-sm font-semibold text-gray-300">Dashboard</span>
          </div>

          <Link 
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-wedding-gold-dark via-wedding-gold to-wedding-gold-dark text-wedding-purple-dark font-bold text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer select-none shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </Link>
        </header>

        {/* Dashboard Title & Search */}
        <section className="flex flex-col gap-4">
          <h1 className="font-serif text-3xl font-bold text-gold-gradient">
            My Hosted Events
          </h1>

          {/* Search Query Input */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search events by name, venue, host or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-wedding-gold/40 rounded-xl px-4 py-3.5 pl-11 text-sm outline-none text-white transition-all"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-4" />
          </div>
        </section>

        {/* Event Listings */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-wedding-gold" />
            <p className="text-sm text-gray-400">Loading events...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map((event) => {
              const formattedDate = event.date
                ? new Date(event.date).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : null;

              return (
                <div 
                  key={event.id}
                  className="rounded-3xl bg-wedding-purple-mid/20 border border-white/[0.04] p-5 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.15)] flex flex-col justify-between gap-5 relative group overflow-hidden"
                >
                  <div className="flex gap-4">
                    {/* QR Code preview */}
                    <div className="shrink-0">
                      <DashboardQR eventId={event.id} />
                    </div>

                    {/* Metadata summary */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-lg font-semibold text-wedding-gold-light truncate leading-snug">
                          {event.eventName || "Unnamed Location Event"}
                        </h3>
                        <span className="text-[10px] font-mono text-wedding-gold bg-wedding-gold/15 border border-wedding-gold/25 px-1.5 py-0.5 rounded uppercase select-all">
                          {event.id}
                        </span>
                      </div>
                      
                      {event.hostName && (
                        <p className="text-xs text-wedding-pink/60 truncate mt-0.5">
                          Host: {event.hostName}
                        </p>
                      )}

                      <div className="mt-3 space-y-1.5">
                        {formattedDate && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-300">
                            <Calendar className="w-3.5 h-3.5 text-wedding-pink shrink-0" />
                            <span>{formattedDate} {event.startTime || ""}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <MapPin className="w-3.5 h-3.5 text-wedding-pink shrink-0" />
                          <span className="truncate">{event.venueName || event.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Controls footer */}
                  <div className="flex items-center justify-between gap-1 border-t border-white/[0.05] pt-4 mt-auto">
                    <div className="flex items-center gap-1">
                      {/* View Live */}
                      <Link
                        href={`/invite/${event.id}`}
                        target="_blank"
                        className="p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
                        title="View Live Invitation"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      {/* Edit */}
                      <button
                        onClick={() => setEditingEvent(event)}
                        className="p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
                        title="Edit Event"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Copy Link */}
                      <button
                        onClick={() => handleCopyLink(event)}
                        className="p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
                        title="Copy Link"
                      >
                        {copiedId === event.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>

                      {/* Download QR */}
                      <button
                        onClick={() => handleDownloadQR(event)}
                        className="p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
                        title="Download QR Code"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Delete */}
                    {deleteConfirmId === event.id ? (
                      <div className="flex items-center gap-1 animate-pulse">
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(event.id)}
                        className="p-2.5 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all cursor-pointer border border-transparent hover:border-red-500/15"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/[0.02] border border-white/[0.04] rounded-3xl p-8 select-none">
            <p className="text-gray-400 text-sm mb-4">No events found matching your description.</p>
            <Link 
              href="/"
              className="text-xs text-wedding-gold hover:text-wedding-gold-light border border-wedding-gold/20 hover:border-wedding-gold/40 px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Create Your First QR Invitation
            </Link>
          </div>
        )}
      </main>

      {/* Edit Event Modal Backdrop Overlay */}
      <AnimatePresence>
        {editingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-wedding-purple-dark border border-wedding-gold/30 rounded-3xl p-6 shadow-2xl my-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setEditingEvent(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6 select-none">
                <h2 className="font-serif text-2xl font-semibold text-gold-gradient">
                  Edit Event Details
                </h2>
                <p className="text-xs text-gray-400">
                  Update event ID: {editingEvent.id}
                </p>
              </div>

              {/* Populate creation form with initial editing event data */}
              <div className="max-h-[70vh] overflow-y-auto pr-1">
                <EventCreationForm 
                  initialData={editingEvent}
                  onSuccess={handleEditSuccess}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
