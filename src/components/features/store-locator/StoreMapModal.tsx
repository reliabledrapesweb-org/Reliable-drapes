"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Phone,
  Navigation,
  Loader2,
  Mail,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Store } from "@/lib/actions/stores";

// Custom MapPin icon with proper filled design
const MapPinIcon = ({ className }: { className?: string }) => (
  <svg
    fill="currentColor"
    viewBox="0 0 256 256"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M127.99414,15.9971a88.1046,88.1046,0,0,0-88,88c0,75.29688,80,132.17188,83.40625,134.55469a8.023,8.023,0,0,0,9.1875,0c3.40625-2.38281,83.40625-59.25781,83.40625-134.55469A88.10459,88.10459,0,0,0,127.99414,15.9971ZM128,72a32,32,0,1,1-32,32A31.99909,31.99909,0,0,1,128,72Z"></path>
  </svg>
);

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
      const query = encodeURIComponent(
        `${store.address}, ${store.city}, ${store.country}`,
      );
      return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
  };

  // Open in Google Maps app/web
  const openInGoogleMaps = () => {
    if (store.latitude && store.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`;
      window.open(url, "_blank");
    } else {
      const query = encodeURIComponent(
        `${store.address}, ${store.city}, ${store.country}`,
      );
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

  // Check if store is currently open
  const getStoreStatus = () => {
    if (!store.hours) return null;

    const now = new Date();
    const day = now
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const hoursStr = store.hours[day];

    if (!hoursStr || hoursStr.toLowerCase() === "closed") {
      return { isOpen: false, text: "Closed" };
    }

    try {
      // Expected format: "9:00 AM - 6:00 PM"
      const [startStr, endStr] = hoursStr.split("-").map((s) => s.trim());

      const parseTime = (timeStr: string) => {
        const [time, modifier] = timeStr.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (modifier === "PM" && hours < 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;
        const d = new Date();
        d.setHours(hours, minutes, 0, 0);
        return d;
      };

      const startTime = parseTime(startStr);
      const endTime = parseTime(endStr);

      if (now >= startTime && now <= endTime) {
        return { isOpen: true, text: "Open Now" };
      }
      return { isOpen: false, text: "Closed" };
    } catch (e) {
      return null;
    }
  };

  const status = getStoreStatus();

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center p-4"
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
            className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="shrink-0 bg-[#2f2582] p-4 text-white md:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2 md:mb-2 md:gap-3">
                    <MapPinIcon className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
                    <h2 className="line-clamp-1 text-base font-bold md:text-lg">
                      {store.name}
                    </h2>
                  </div>
                  <p className="line-clamp-1 text-xs text-white/90 md:text-sm">
                    {store.address}
                  </p>
                  <p className="mt-0.5 text-xs text-white/80">
                    {store.city}
                    {store.state && `, ${store.state}`}
                    {`, ${store.country}`}
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="shrink-0 rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5 md:h-6 md:w-6" />
                </button>
              </div>
            </div>

            {/* Map Container */}
            <div className="relative h-[250px] w-full shrink-0 bg-gray-200 md:h-[350px]">
              {/* Loading Overlay */}
              {isMapLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-100">
                  <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#2f2582] md:h-10 md:w-10" />
                  <p className="text-sm font-medium text-gray-600 md:text-base">
                    Loading map...
                  </p>
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
                className="h-full w-full"
                onLoad={() => setIsMapLoading(false)}
              />
            </div>

            {/* Actions Footer */}
            <div className="flex-1 overflow-y-auto border-t border-gray-200 bg-gray-50 p-4 md:p-5">
              <div className="flex flex-col gap-2 sm:flex-row md:gap-3">
                {/* Phone Call Button */}
                {store.phone && (
                  <button
                    onClick={handlePhoneCall}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
                  >
                    <Phone className="h-4 w-4" fill="currentColor" />
                    <span>Call Store</span>
                  </button>
                )}

                {/* Get Directions Button */}
                <button
                  onClick={openInGoogleMaps}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#2f2582] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#251e66] focus:ring-2 focus:ring-[#2f2582] focus:ring-offset-2 focus:outline-none"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Get Directions</span>
                </button>
              </div>

              {/* Store Info */}
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {store.phone && (
                    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:shadow-md">
                      <div className="rounded-lg bg-green-50 p-2 text-green-600">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                          Phone Number
                        </p>
                        <a
                          href={`tel:${store.phone.replace(/[^0-9+]/g, "")}`}
                          className="flex items-center gap-1 text-sm font-semibold text-gray-900 transition-colors hover:text-[#2f2582]"
                        >
                          {store.phone}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                        </a>
                      </div>
                    </div>
                  )}
                  {store.email && (
                    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:shadow-md">
                      <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                          Email Address
                        </p>
                        <a
                          href={`mailto:${store.email}`}
                          className="text-sm font-semibold break-all text-gray-900 transition-colors hover:text-[#2f2582]"
                        >
                          {store.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Operating Hours */}
                {store.hours && typeof store.hours === "object" && (
                  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                          <Clock className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-bold tracking-tight text-gray-900 uppercase">
                          Operating Hours
                        </h3>
                      </div>
                      {status && (
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${
                            status.isOpen
                              ? "border border-green-200 bg-green-100 text-green-700"
                              : "border border-red-200 bg-red-100 text-red-700"
                          }`}
                        >
                          {status.text}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-1">
                      {Object.entries(store.hours)
                        .slice(0, 7)
                        .map(([day, hours]) => {
                          const isToday =
                            new Date()
                              .toLocaleDateString("en-US", { weekday: "long" })
                              .toLowerCase() === day.toLowerCase();
                          const isClosed = hours.toLowerCase() === "closed";

                          return (
                            <div
                              key={day}
                              className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                                isToday
                                  ? "border border-[#2f2582]/10 bg-[#2f2582]/5"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <span
                                className={`text-xs font-semibold capitalize ${
                                  isToday ? "text-[#2f2582]" : "text-gray-600"
                                }`}
                              >
                                {day}
                              </span>
                              <span
                                className={`text-xs font-bold ${
                                  isToday
                                    ? "text-[#2f2582]"
                                    : isClosed
                                      ? "text-red-500"
                                      : "text-gray-900"
                                }`}
                              >
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
