"use client";

import { Heart, Image as ImageIcon, Share2, ClipboardList, Info } from "lucide-react";
import { ThemeStyles } from "../config/themes";

interface FooterProps {
  styles: ThemeStyles;
}

export default function Footer({ styles }: FooterProps) {
  const futureFeatures = [
    { name: "RSVP", icon: ClipboardList },
    { name: "Photo Gallery", icon: ImageIcon },
    { name: "Parking Info", icon: Info },
    { name: "Share Invitation", icon: Share2 },
  ];

  return (
    <footer className={`w-full max-w-md mx-auto mt-12 mb-8 px-4 text-center select-none ${styles.fontClass}`}>
      {/* Decorative separator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className={`h-[1px] w-12 ${styles.dividerBgClass}`} />
        <Heart className={`w-4 h-4 animate-pulse ${styles.footerHeartColorClass}`} />
        <div className={`h-[1px] w-12 ${styles.dividerBgClass}`} />
      </div>

      {/* Future Extensions - Feature Teasers */}
      <div className="mb-8">
        <p className={`text-xs uppercase tracking-widest mb-4 font-semibold ${styles.subtitleColorClass}`}>
          Guest Features (Coming Soon)
        </p>
        <div className="grid grid-cols-4 gap-2">
          {futureFeatures.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] opacity-40 hover:opacity-70 transition-opacity cursor-default relative group"
                title={`${feature.name} - Coming Soon`}
              >
                <Icon className={`w-4 h-4 ${styles.iconColorClass}`} />
                <span className="text-[10px] font-medium text-gray-400 tracking-wide leading-none">
                  {feature.name}
                </span>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/95 text-white text-[9px] px-1.5 py-0.5 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                  Coming Soon
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Brand & Credits */}
      <p className="text-xs text-gray-400/40 tracking-wider">
        © 2026 Smart Invitation Portal. All rights reserved.
      </p>
      <p className="text-[10px] text-gray-400/35 tracking-widest uppercase mt-2">
        Powered by <span className={`font-medium ${styles.titleGradientClass}`}>Smart Invitation</span>
      </p>
    </footer>
  );
}
