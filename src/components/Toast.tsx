"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-wedding-gold" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-wedding-pink" />,
  };

  const borderColors = {
    success: "border-wedding-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.15)]",
    error: "border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]",
    info: "border-wedding-pink/30 shadow-[0_0_15px_rgba(251,207,232,0.15)]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`fixed bottom-8 left-4 right-4 z-50 flex items-center justify-between gap-3 p-4 rounded-xl border bg-wedding-purple-mid/95 backdrop-blur-md text-white ${borderColors[type]} max-w-md mx-auto sm:left-auto sm:right-8`}
    >
      <div className="flex items-center gap-3">
        {icons[type]}
        <p className="text-sm font-medium tracking-wide text-gray-200">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="p-1 text-gray-400 hover:text-white transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
