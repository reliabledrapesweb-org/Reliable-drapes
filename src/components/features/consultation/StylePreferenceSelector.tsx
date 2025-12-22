import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { STYLE_PREFERENCES } from "@/lib/constants/consultation";

interface StylePreferenceSelectorProps {
  selectedStyles: string[];
  onChange: (styles: string[]) => void;
  maxSelections?: number;
}

export function StylePreferenceSelector({ 
  selectedStyles, 
  onChange,
  maxSelections = 3 
}: StylePreferenceSelectorProps) {
  const toggleStyle = (styleId: string) => {
    if (selectedStyles.includes(styleId)) {
      onChange(selectedStyles.filter(s => s !== styleId));
    } else if (selectedStyles.length < maxSelections) {
      onChange([...selectedStyles, styleId]);
    }
  };

  return (
    <div>
      <p className="mb-4 text-sm text-gray-600">
        Select up to {maxSelections} styles that resonate with you
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STYLE_PREFERENCES.map((style, index) => {
          const isSelected = selectedStyles.includes(style.id);
          const isDisabled = !isSelected && selectedStyles.length >= maxSelections;
          
          return (
            <motion.button
              key={style.id}
              type="button"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => toggleStyle(style.id)}
              disabled={isDisabled}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? "border-[#2f2582] bg-[#2f2582]/5 shadow-md"
                  : isDisabled
                  ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                  : "border-gray-200 hover:border-[#2f2582]/50 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className={`font-semibold mb-1 ${
                    isSelected ? "text-[#2f2582]" : "text-gray-900"
                  }`}>
                    {style.label}
                  </h4>
                  <p className="text-xs text-gray-600">{style.description}</p>
                </div>
                
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-3 w-6 h-6 bg-[#2f2582] rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <Check className="h-4 w-4 text-white" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
      
      {selectedStyles.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-sm text-[#2f2582] font-medium"
        >
          {selectedStyles.length} of {maxSelections} selected
        </motion.p>
      )}
    </div>
  );
}
