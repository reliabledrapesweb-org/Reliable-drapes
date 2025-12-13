import { Phone } from "lucide-react";
import { motion } from "framer-motion";
import type { Store } from "@/lib/actions/stores";
import { useState } from "react";
import { StoreMapModal } from "./StoreMapModal";

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
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const handleLocateStore = () => {
    setIsMapModalOpen(true);
    onLocateStore(store);
  };

  const handlePhoneCall = () => {
    if (store.phone) {
      // Remove any non-numeric characters except +
      const cleanPhone = store.phone.replace(/[^0-9+]/g, '');
      window.location.href = `tel:${cleanPhone}`;
    }
  };

  return (
    <>
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
        <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
          <MapPinIcon className="h-4 w-4 md:h-5 md:w-5 text-[#2a2a2a] mt-0.5 flex-shrink-0" />
          <p className="text-xs md:text-sm text-[#6a6a6a] leading-relaxed">
            {store.address}
          </p>
        </div>

        {/* Phone - Clickable */}
        {store.phone && (
          <button
            onClick={handlePhoneCall}
            className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 w-full text-left group transition-colors hover:text-[#2f2582]"
          >
            <Phone className="h-4 w-4 md:h-5 md:w-5 text-[#2a2a2a] flex-shrink-0 group-hover:text-[#2f2582]" fill="currentColor" />
            <p className="text-xs md:text-sm text-[#6a6a6a] group-hover:text-[#2f2582] underline decoration-dotted underline-offset-2">
              {store.phone}
            </p>
          </button>
        )}

        {/* Locate Store Button */}
        <button
          onClick={handleLocateStore}
          className="w-full md:w-auto cursor-pointer rounded-full bg-[#2f2582] px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-semibold tracking-[1.5px] md:tracking-[2px] text-white uppercase transition-all hover:bg-[#251e66] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#2f2582]/20"
        >
          Locate Store
        </button>
      </motion.div>

      {/* Map Modal */}
      <StoreMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        store={store}
      />
    </>
  );
}