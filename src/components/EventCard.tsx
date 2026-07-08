"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";
import { EventDetails } from "../config/event";
import { ThemeStyles } from "../config/themes";

interface EventCardProps {
  eventDetails: EventDetails;
  styles: ThemeStyles;
}

export default function EventCard({ eventDetails, styles }: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 1, type: "spring", stiffness: 60 }}
      className={`w-full max-w-md mx-auto p-6 md:p-8 rounded-3xl relative overflow-hidden select-none border ${styles.cardBgClass} ${styles.fontClass}`}
    >
      {/* Decorative Corner Glows */}
      <div className="absolute -top-12 -left-12 w-24 h-24 rounded-full bg-wedding-pink/5 blur-xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-24 h-24 rounded-full bg-wedding-gold/5 blur-xl pointer-events-none" />

      {/* Event Header inside Card */}
      <div className="text-center mb-6">
        <h2 className={`text-2xl md:text-3xl font-medium tracking-wide ${styles.titleGradientClass}`}>
          {eventDetails.title}
        </h2>
        <p className={`text-xs uppercase tracking-widest mt-1 ${styles.labelColorClass}`}>
          Event Details
        </p>
      </div>

      <div className="space-y-6">
        {/* Date Row */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl border ${styles.iconContainerBgClass}`}>
            <Calendar className={`w-6 h-6 ${styles.iconColorClass}`} />
          </div>
          <div>
            <p className={`text-xs uppercase tracking-wider font-semibold ${styles.labelColorClass}`}>Date</p>
            <p className={`text-lg font-medium tracking-wide mt-0.5 ${styles.valueColorClass}`}>
              {eventDetails.date}
            </p>
          </div>
        </div>

        {/* Time Row */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl border ${styles.iconContainerBgClass}`}>
            <Clock className={`w-6 h-6 ${styles.iconColorClass}`} />
          </div>
          <div>
            <p className={`text-xs uppercase tracking-wider font-semibold ${styles.labelColorClass}`}>Time</p>
            <p className={`text-lg font-medium tracking-wide mt-0.5 ${styles.valueColorClass}`}>
              {eventDetails.time}
            </p>
          </div>
        </div>

        {/* Venue / Address Row */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl border ${styles.iconContainerBgClass} shrink-0`}>
            <MapPin className={`w-6 h-6 ${styles.iconColorClass}`} />
          </div>
          <div>
            <p className={`text-xs uppercase tracking-wider font-semibold ${styles.labelColorClass}`}>Venue</p>
            <h3 className={`text-lg font-medium tracking-wide mt-0.5 leading-tight ${styles.valueColorClass}`}>
              {eventDetails.venueName}
            </h3>
            <p className="text-sm text-gray-300 tracking-wide mt-1 leading-relaxed">
              {eventDetails.address}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
