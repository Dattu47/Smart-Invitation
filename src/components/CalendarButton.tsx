"use client";

import { useState } from "react";
import { CalendarRange, Loader2 } from "lucide-react";
import { EventDetails } from "../config/event";
import { ThemeStyles } from "../config/themes";
import { generateICSContent, downloadICSFile } from "../utils/calendar";

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
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCalendar = () => {
    setIsLoading(true);

    try {
      const icsContent = generateICSContent({
        title: eventDetails.title,
        location: `${eventDetails.venueName}, ${eventDetails.address}`,
        description: eventDetails.description,
        startDate: eventDetails.startDateTime,
        endDate: eventDetails.endDateTime,
      });

      // Generate a friendly filename based on event title
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
    }
  };

  return (
    <button
      onClick={handleAddToCalendar}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl text-lg font-bold tracking-wide hover:scale-[1.02] active:scale-[0.98] disabled:opacity-85 transition-all duration-300 select-none cursor-pointer ${styles.calendarButtonClass}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <CalendarRange className="w-6 h-6" />
          <span>Add to Calendar</span>
        </>
      )}
    </button>
  );
}
