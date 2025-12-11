import { MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";

interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  city: string;
  state: string;
}

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
      className="rounded-[2rem] border-4 border-white bg-[#fafafa] p-6 shadow-md transition-all hover:bg-[#f7f7f7] hover:shadow-lg hover:border-white"
    >
      {/* Store Name */}
      <h3 className="text-xl font-semibold text-[#2a2a2a] mb-4 leading-tight">
        {store.name}
      </h3>

      {/* Address */}
      <div className="flex items-start gap-4 mb-3">
        <MapPin className="h-5 w-5 text-[#2a2a2a] mt-0.5 flex-shrink-0" />
        <p className="text-sm text-[#6a6a6a] leading-relaxed">
          {store.address}
        </p>
      </div>

      {/* Phone */}
      <div className="flex items-center gap-4 mb-6">
        <Phone className="h-5 w-5 text-[#2a2a2a] flex-shrink-0" />
        <p className="text-sm text-[#6a6a6a]">
          {store.phone}
        </p>
      </div>

      {/* Locate Store Button */}
      <button
        onClick={() => onLocateStore(store)}
        className="cursor-pointer rounded-full bg-[#2f2582] px-8 py-4 text-base font-semibold tracking-[2px] text-white uppercase transition-all hover:bg-[#251e66] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#2f2582]/20"
      >
        Locate Store
      </button>
    </motion.div>
  );
}