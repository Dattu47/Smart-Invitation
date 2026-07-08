"use client";

import { motion } from "framer-motion";
import { EventDetails } from "../config/event";
import { ThemeStyles } from "../config/themes";

interface HeroSectionProps {
  eventDetails: EventDetails;
  styles: ThemeStyles;
}

export default function HeroSection({ eventDetails, styles }: HeroSectionProps) {
  // If coupleNames is same as title, don't repeat. Otherwise display it elegantly.
  const hasCoupleNames = eventDetails.coupleNames && eventDetails.coupleNames !== eventDetails.title;

  return (
    <motion.section 
      initial={{ opacity: 0, y: -25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className={`flex flex-col items-center text-center px-4 py-8 md:py-12 select-none ${styles.fontClass}`}
    >
      {/* Decorative Top Emoji */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-4xl md:text-5xl mb-4 animate-bounce duration-[3s] cursor-default"
      >
        🎉
      </motion.div>

      {/* Welcome Tag */}
      <motion.span 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className={`text-xs uppercase tracking-[0.25em] font-semibold mb-2 ${styles.subtitleColorClass}`}
      >
        Welcome
      </motion.span>

      {/* Invitation Text */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="text-lg md:text-xl font-light text-wedding-gold-light italic max-w-sm mb-6"
      >
        "You are invited to celebrate with us"
      </motion.p>

      {/* Event Title */}
      <motion.h1 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, duration: 1, type: "spring", stiffness: 50 }}
        className={`text-4xl md:text-6xl font-bold tracking-wide leading-tight mb-4 filter drop-shadow-[0_2px_10px_rgba(255,255,255,0.05)] ${styles.titleGradientClass}`}
      >
        {eventDetails.title}
      </motion.h1>

      <motion.div 
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: "60px" }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className={`h-[1px] my-3 ${styles.dividerBgClass}`}
      />

      {/* Tagline / Subtitle */}
      {hasCoupleNames && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className={`text-sm tracking-widest uppercase font-medium mt-1 ${styles.subtitleColorClass}`}
        >
          {eventDetails.coupleNames}
        </motion.p>
      )}
    </motion.section>
  );
}
