"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Phone, Navigation, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Store } from "@/lib/actions/stores";

interface StoreMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store;
}

export function StoreMapModal({ isOpen, onClose, store }: StoreMapModalProps) {
  const [isMapLoading, setIsMapLoading] = useState(true);

  // Reset loading state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsMapLoading(true);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Build Google Maps embed URL (using standard embed without API key)
  const getMapEmbedUrl = () => {
    if (store.latitude && store.longitude) {
      // Use coordinates if available - standard Google Maps embed
      return `https://maps.google.com/maps?q=${store.latitude},${store.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    } else {
      // Fallback to address - standard Google Maps embed
      const query = encodeURIComponent(`${store.address}, ${store.city}, ${store.country}`);
      return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
  };

  // Open in Google Maps app/web
  const openInGoogleMaps = () => {
    if (store.latitude && store.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`;
      window.open(url, "_blank");
    } else {
      const query = encodeURIComponent(`${store.address}, ${store.city}, ${store.country}`);
      const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
      window.open(url, "_blank");
    }
  };

  // Make phone call
  const handlePhoneCall = () => {
    if (store.phone) {
      const cleanPhone = store.phone.replace(/[^0-9+]/g, "");
      window.location.href = `tel:${cleanPhone}`;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#2f2582] text-white p-4 md:p-5 flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                    <MapPin className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" fill="currentColor" />
                    <h2 className="text-base md:text-lg font-bold line-clamp-1">{store.name}</h2>
                  </div>
                  <p className="text-xs md:text-sm text-white/90 line-clamp-1">
                    {store.address}
                  </p>
                  <p className="text-xs text-white/80 mt-0.5">
                    {store.city}
                    {store.state && `, ${store.state}`}
                    {`, ${store.country}`}
                  </p>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="flex-shrink-0 rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5 md:h-6 md:w-6" />
                </button>
              </div>
            </div>

            {/* Map Container */}
            <div className="relative w-full h-[250px] md:h-[350px] bg-gray-200 flex-shrink-0">
              {/* Loading Overlay */}
              {isMapLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-100">
                  <Loader2 className="h-8 w-8 md:h-10 md:w-10 text-[#2f2582] animate-spin mb-3" />
                  <p className="text-sm md:text-base text-gray-600 font-medium">Loading map...</p>
                </div>
              )}
              
              <iframe
                src={getMapEmbedUrl()}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map location of ${store.name}`}
                className="w-full h-full"
                onLoad={() => setIsMapLoading(false)}
              />
            </div>

            {/* Actions Footer */}
            <div className="p-4 md:p-5 bg-gray-50 border-t border-gray-200 overflow-y-auto flex-1">
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                {/* Phone Call Button */}
                {store.phone && (
                  <button
                    onClick={handlePhoneCall}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium text-sm transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <Phone className="h-4 w-4" fill="currentColor" />
                    <span>Call Store</span>
                  </button>
                )}

                {/* Get Directions Button */}
                <button
                  onClick={openInGoogleMaps}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2f2582] text-white rounded-lg font-medium text-sm transition-colors hover:bg-[#251e66] focus:outline-none focus:ring-2 focus:ring-[#2f2582] focus:ring-offset-2"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Get Directions</span>
                </button>
              </div>

              {/* Store Info */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {store.phone && (
                    <div className="space-y-1">
                      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Phone</p>
                      <p className="text-gray-900 font-medium text-base">{store.phone}</p>
                    </div>
                  )}
                  {store.email && (
                    <div className="space-y-1">
                      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Email</p>
                      <p className="text-gray-900 font-medium text-base break-all">{store.email}</p>
                    </div>
                  )}
                </div>

                {/* Operating Hours */}
                {store.hours && typeof store.hours === "object" && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Operating Hours</p>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {Object.entries(store.hours).slice(0, 7).map(([day, hours]) => {
                        const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day.toLowerCase();
                        return (
                          <div 
                            key={day} 
                            className={`flex justify-between items-center py-1.5 px-2 rounded ${
                              isToday ? 'bg-green-50 border border-green-200' : ''
                            }`}
                          >
                            <span className={`capitalize font-medium ${
                              isToday ? 'text-green-900' : 'text-gray-700'
                            }`}>
                              {day}:
                            </span>
                            <span className={`font-semibold ${
                              isToday ? 'text-green-700' : 'text-gray-900'
                            }`}>
                              {hours}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
