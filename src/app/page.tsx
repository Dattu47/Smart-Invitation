"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Copy, 
  Download, 
  ExternalLink,
  Check,
  X,
  Share2
} from "lucide-react";
import QRCode from "qrcode";
import confetti from "canvas-confetti";
import EventCreationForm from "@/components/forms/EventCreationForm";
import { EventData } from "@/types";

export default function Home() {
  const [createdEvent, setCreatedEvent] = useState<EventData | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [eventLink, setEventLink] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Generate event URL and trigger QR Code generation on success
  const handleSuccess = async (event: EventData, documentId: string) => {
    try {
      const eventUrl = `${window.location.origin}/invite/${documentId}`;
      setEventLink(eventUrl);
      
      // Generate QR data URL
      const qrData = await QRCode.toDataURL(eventUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: "#0e051d", // Deep purple
          light: "#ffffff",
        },
      });
      
      setQrCodeUrl(qrData);
      
      const newEvent = { ...event, id: documentId };
      setCreatedEvent(newEvent);
      
      // Save to localStorage for Dashboard history
      const savedEvents = JSON.parse(localStorage.getItem("smart_invitations") || "[]");
      localStorage.setItem("smart_invitations", JSON.stringify([newEvent, ...savedEvents]));

      // Trigger celebratory confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#d4af37", "#fbcfe8", "#fda4af", "#aa841c"],
      });
    } catch (err) {
      console.error("Failed to generate QR Code image", err);
    }
  };

  const handleCopyLink = () => {
    if (!eventLink) return;
    navigator.clipboard.writeText(eventLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl || !createdEvent) return;
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    // Friendly file name
    const slug = (createdEvent.eventName || "event")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_");
    link.download = `qr_${slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareModal = async () => {
    if (!eventLink || !createdEvent) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: createdEvent.eventName || "Smart Invitation",
          text: `You're invited to ${createdEvent.eventName || "an event"} at ${createdEvent.venueName || "venue"}. Click to view details and map location!`,
          url: eventLink,
        });
      } catch (err) {
        console.error("Error sharing invitation:", err);
      }
    } else {
      // Fallback: Copy Link
      handleCopyLink();
    }
  };

  const closeSuccessModal = () => {
    setCreatedEvent(null);
    setQrCodeUrl("");
    setEventLink("");
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start bg-wedding-purple-dark text-white overflow-hidden py-10 px-4 md:py-16">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-15%] w-[70%] aspect-square rounded-full bg-gradient-to-br from-wedding-purple-mid to-wedding-purple-light opacity-30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[70%] aspect-square rounded-full bg-gradient-to-br from-wedding-purple-light to-wedding-pink opacity-25 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <main className="w-full max-w-lg flex flex-col gap-8 relative z-10">
        
        {/* Header Section */}
        <header className="flex flex-col items-center text-center gap-2 select-none">
          <div className="flex items-center justify-between w-full mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-wedding-gold animate-pulse" />
              <span className="font-serif text-lg font-bold text-gold-gradient">Smart Invitation</span>
            </div>
            <Link 
              href="/dashboard"
              className="text-xs font-semibold text-wedding-gold hover:text-wedding-gold-light border border-wedding-gold/20 hover:border-wedding-gold/40 px-3.5 py-2 rounded-xl backdrop-blur-md bg-white/5 transition-all cursor-pointer select-none"
            >
              My Dashboard
            </Link>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-wide text-gold-gradient leading-tight mt-4">
            Create Smart QR
          </h1>
          <p className="text-sm text-wedding-pink/60 uppercase tracking-widest font-semibold mt-1">
            Zero-Database Free Invitation
          </p>
        </header>

        {/* Event Form */}
        <div className="w-full bg-wedding-purple-mid/20 border border-white/[0.03] rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
          <EventCreationForm onSuccess={handleSuccess} />
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-500/50 mt-4 select-none">
          <p>© 2026 Smart Invitation Portal. All rights reserved.</p>
        </footer>
      </main>

      {/* Success / QR Code Modal Overlay */}
      <AnimatePresence>
        {createdEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-wedding-purple-dark/95 border border-wedding-gold/30 rounded-3xl p-6 shadow-[0_10px_50px_rgba(212,175,55,0.15)] text-center text-white"
            >
              {/* Close Button */}
              <button
                onClick={closeSuccessModal}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <Sparkles className="w-10 h-10 text-wedding-gold mx-auto mb-3 animate-pulse" />
              <h2 className="font-serif text-2xl font-semibold text-gold-gradient tracking-wide mb-1">
                Invitation Generated!
              </h2>
              <p className="text-xs text-gray-300 mb-6">
                Your free QR Code invitation is ready to be shared.
              </p>

              {/* QR Code Container */}
              {qrCodeUrl && (
                <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl mb-6 shadow-inner flex items-center justify-center">
                  <img src={qrCodeUrl} alt="Event Invitation QR Code" className="w-full h-full object-contain" />
                </div>
              )}

              {/* Event Link Row */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs flex items-center justify-between gap-3 mb-6 select-all">
                <span className="text-gray-300 truncate text-left flex-1">
                  {eventLink}
                </span>
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-1.5 py-3 px-1.5 rounded-xl border border-white/10 hover:border-wedding-gold/40 text-[11px] font-semibold bg-white/[0.02] hover:bg-white/[0.06] transition-all cursor-pointer truncate"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      <span className="text-green-400 truncate">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-wedding-gold shrink-0" />
                      <span className="truncate">Copy Link</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadQR}
                  className="flex items-center justify-center gap-1.5 py-3 px-1.5 rounded-xl border border-white/10 hover:border-wedding-gold/40 text-[11px] font-semibold bg-white/[0.02] hover:bg-white/[0.06] transition-all cursor-pointer truncate"
                >
                  <Download className="w-3.5 h-3.5 text-wedding-gold shrink-0" />
                  <span className="truncate">Download QR</span>
                </button>
                <button
                  onClick={handleShareModal}
                  className="flex items-center justify-center gap-1.5 py-3 px-1.5 rounded-xl border border-white/10 hover:border-wedding-gold/40 text-[11px] font-semibold bg-white/[0.02] hover:bg-white/[0.06] transition-all cursor-pointer truncate"
                >
                  <Share2 className="w-3.5 h-3.5 text-wedding-gold shrink-0" />
                  <span className="truncate">Share QR</span>
                </button>
              </div>

              {/* View Live Invitation Link */}
              <Link
                href={eventLink}
                target="_blank"
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-wedding-gold-dark via-wedding-gold to-wedding-gold-dark text-wedding-purple-dark font-bold text-sm shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Live Invitation</span>
              </Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
