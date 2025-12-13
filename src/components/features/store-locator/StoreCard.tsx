import { Phone, Mail, Clock } from "lucide-react";
import { motion } from "framer-motion";
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

interface StoreCardProps {
  store: Store;
  onLocateStore: (store: Store) => void;
}

export function StoreCard({ store, onLocateStore }: StoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-[1.5rem] md:rounded-[2rem] border-2 md:border-4 border-white bg-[#fafafa] p-4 md:p-6 shadow-md transition-all hover:bg-[#f7f7f7] hover:shadow-lg hover:border-white"
    >
      {/* Store Name */}
      <h3 className="text-lg md:text-xl font-semibold text-[#2a2a2a] mb-3 md:mb-4 leading-tight">
        {store.name}
      </h3>

      {/* Address */}
      <div className="flex items-start gap-3 md:gap-4 mb-2 md:mb-3">
        <MapPinIcon className="h-4 w-4 md:h-5 md:w-5 text-[#2a2a2a] mt-0.5 flex-shrink-0" />
        <p className="text-xs md:text-sm text-[#6a6a6a] leading-relaxed">
          {store.address}
        </p>
      </div>

      {/* Phone */}
      {store.phone && (
        <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-3">
          <Phone className="h-4 w-4 md:h-5 md:w-5 text-[#2a2a2a] flex-shrink-0" fill="currentColor" />
          <p className="text-xs md:text-sm text-[#6a6a6a]">
            {store.phone}
          </p>
        </div>
      )}

      {/* Email */}
      {store.email && (
        <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-3">
          <Mail className="h-4 w-4 md:h-5 md:w-5 text-[#2a2a2a] flex-shrink-0" fill="currentColor" />
          <p className="text-xs md:text-sm text-[#6a6a6a]">
            {store.email}
          </p>
        </div>
      )}

      {/* Hours (if available) */}
      {store.hours && (
        <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
          <Clock className="h-4 w-4 md:h-5 md:w-5 text-[#2a2a2a] mt-0.5 flex-shrink-0" />
          <div className="text-xs md:text-sm text-[#6a6a6a]">
            <p className="font-medium mb-1">Hours:</p>
            {typeof store.hours === 'object' && (
              <p className="text-xs">
                {store.hours.monday || 'Closed'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Locate Store Button */}
      <button
        onClick={() => onLocateStore(store)}
        className="w-full md:w-auto cursor-pointer rounded-full bg-[#2f2582] px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-semibold tracking-[1.5px] md:tracking-[2px] text-white uppercase transition-all hover:bg-[#251e66] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#2f2582]/20"
      >
        Locate Store
      </button>
    </motion.div>
  );
}