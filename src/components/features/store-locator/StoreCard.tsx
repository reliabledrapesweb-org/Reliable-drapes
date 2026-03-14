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

type StoreCardProps = {
  store: Store;
  onLocateStore?: (store: Store) => void;
};

export function StoreCard({ store, onLocateStore }: StoreCardProps) {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const handleLocateStore = () => {
    setIsMapModalOpen(true);
    onLocateStore?.(store);
  };

  const handlePhoneCall = () => {
    if (store.phone) {
      // Remove any non-numeric characters except +
      const cleanPhone = store.phone.replace(/[^0-9+]/g, "");
      window.location.href = `tel:${cleanPhone}`;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="group relative overflow-hidden rounded-[2.5rem] border-[6px] border-white bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)] md:p-6"
      >
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white to-[#F3F3F3] opacity-50" />

        <div className="relative z-10">
          {/* Store Name */}
          <h3 className="mb-4 text-lg font-bold tracking-tight text-[#1a1a1a] md:text-[24px]">
            {store.name}
          </h3>

          <div className="space-y-3">
            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                <MapPinIcon className="h-5 w-5 text-black" />
              </div>
              <p className="text-sm leading-relaxed font-medium text-[#666666] md:text-[16px]">
                {store.address}
              </p>
            </div>

            {/* Phone - Clickable */}
            {store.phone && (
              <button
                onClick={handlePhoneCall}
                className="group/phone flex items-center gap-3 transition-colors hover:text-[#2f2582]"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                  <Phone
                    className="h-4 w-4 text-black transition-colors group-hover/phone:text-[#2f2582]"
                    fill="currentColor"
                  />
                </div>
                <p className="text-sm font-medium text-[#666666] transition-colors group-hover/phone:text-[#2f2582] md:text-[16px]">
                  {store.phone}
                </p>
              </button>
            )}
          </div>

          {/* Locate Store Button */}
          <div className="mt-6">
            <button
              onClick={handleLocateStore}
              className="inline-flex cursor-pointer items-center justify-center rounded-[1.5rem] bg-[#2f2582] px-6 py-3 text-[12px] font-bold tracking-[2px] text-white uppercase transition-all hover:bg-[#251e66] hover:shadow-lg active:scale-95 md:text-[16px]"
            >
              Locate Store
            </button>
          </div>
        </div>
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
