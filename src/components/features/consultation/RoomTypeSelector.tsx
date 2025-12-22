import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ROOM_TYPES } from "@/lib/constants/consultation";

interface RoomTypeSelectorProps {
  selectedRooms: string[];
  onChange: (rooms: string[]) => void;
}

export function RoomTypeSelector({ selectedRooms, onChange }: RoomTypeSelectorProps) {
  const toggleRoom = (roomId: string) => {
    if (selectedRooms.includes(roomId)) {
      onChange(selectedRooms.filter(r => r !== roomId));
    } else {
      onChange([...selectedRooms, roomId]);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {ROOM_TYPES.map((room, index) => {
        const isSelected = selectedRooms.includes(room.id);
        
        return (
          <motion.button
            key={room.id}
            type="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => toggleRoom(room.id)}
            className={`relative p-6 rounded-xl border-2 transition-all ${
              isSelected
                ? "border-[#2f2582] bg-[#2f2582]/5 shadow-md"
                : "border-gray-200 hover:border-[#2f2582]/50 hover:shadow-sm"
            }`}
          >
            <div className="text-4xl mb-3">{room.icon}</div>
            <p className={`text-sm font-semibold ${
              isSelected ? "text-[#2f2582]" : "text-gray-700"
            }`}>
              {room.label}
            </p>
            
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-6 h-6 bg-[#2f2582] rounded-full flex items-center justify-center"
              >
                <Check className="h-4 w-4 text-white" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
