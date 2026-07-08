"use client";

import { useState } from "react";
import { CalendarRange, Loader2, Calendar as CalendarIcon, FileDown, ChevronDown } from "lucide-react";
import { EventDetails } from "../config/event";
import { ThemeStyles } from "../config/themes";
import { generateICSContent, downloadICSFile } from "../utils/calendar";
import { motion, AnimatePresence } from "framer-motion";

interface CalendarButtonProps {
  eventDetails: EventDetails;
  styles: ThemeStyles;
  onNotify: (message: string, type: "success" | "error" | "info") => void;
}

export default function CalendarButton({
  eventDetails,
  styles,
  onNotify,
}: CalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleCalendar = () => {
    setIsLoading(true);
    try {
      const gcalBase = "https://calendar.google.com/calendar/render?action=TEMPLATE";
      const title = encodeURIComponent(eventDetails.title);
      const details = encodeURIComponent(eventDetails.description || "");
      const location = encodeURIComponent(`${eventDetails.venueName}, ${eventDetails.address}`);
      
      // Google Calendar format: YYYYMMDDTHHMMSSZ/YYYYMMDDTHHMMSSZ
      const dates = `${eventDetails.startDateTime.replace(/[-:]/g, "")}/${eventDetails.endDateTime.replace(/[-:]/g, "")}`;
      
      const url = `${gcalBase}&text=${title}&details=${details}&location=${location}&dates=${dates}`;
      window.open(url, "_blank");
      onNotify("Opened Google Calendar. You can set your reminders there!", "success");
    } catch (err) {
      console.error(err);
      onNotify("Failed to open Google Calendar.", "error");
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleAppleCalendar = () => {
    setIsLoading(true);
    try {
      const icsContent = generateICSContent({
        title: eventDetails.title,
        location: `${eventDetails.venueName}, ${eventDetails.address}`,
        description: eventDetails.description,
        startDate: eventDetails.startDateTime,
        endDate: eventDetails.endDateTime,
      });

      const sanitizedTitle = eventDetails.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/(^_|_$)/g, "");
      const filename = `${sanitizedTitle || "event"}.ics`;
      
      downloadICSFile(filename, icsContent);

      onNotify(
        "Calendar event (.ics) downloaded. Open it to save to your calendar.",
        "success"
      );
    } catch (err) {
      console.error(err);
      onNotify("Failed to generate calendar file. Please try again.", "error");
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`w-full flex items-center justify-between px-8 py-4.5 rounded-2xl text-lg font-bold tracking-wide hover:scale-[1.01] active:scale-[0.99] disabled:opacity-85 transition-all duration-300 select-none cursor-pointer ${styles.calendarButtonClass}`}
      >
        <div className="flex items-center gap-3">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CalendarRange className="w-5 h-5" />}
          <span>Add to Calendar</span>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl border border-white/10 bg-[#0e051d]/95 backdrop-blur-md shadow-xl z-50 flex flex-col gap-2"
          >
            <button
              onClick={handleGoogleCalendar}
              className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/10 transition-colors text-left text-sm font-semibold text-white cursor-pointer"
            >
              <CalendarIcon className="w-4 h-4 text-[#4285F4]" />
              <span>Google Calendar (Web & Android)</span>
            </button>
            <button
              onClick={handleAppleCalendar}
              className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/10 transition-colors text-left text-sm font-semibold text-white cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-gray-300" />
              <span>Apple / Outlook (.ics File)</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
