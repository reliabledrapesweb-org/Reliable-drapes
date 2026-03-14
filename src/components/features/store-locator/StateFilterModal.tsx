"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type StateFilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  states: string[];
  selectedStates: string[];
  onApply: (states: string[]) => void;
};

export function StateFilterModal({
  isOpen,
  onClose,
  states,
  selectedStates,
  onApply,
}: StateFilterModalProps) {
  const [localSelected, setLocalSelected] = useState<string[]>(selectedStates);

  useEffect(() => {
    setLocalSelected(selectedStates);
  }, [selectedStates, isOpen]);

  const allSelected = localSelected.length === states.length;

  const toggleAll = () => {
    setLocalSelected(allSelected ? [] : [...states]);
  };

  const toggleState = (state: string) => {
    setLocalSelected((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state],
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Filter by State
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <label className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-gray-300 text-[#2F2582] focus:ring-[#2F2582]"
              />
              <span className="text-sm font-semibold text-gray-700">
                All States
              </span>
            </label>

            <div className="mb-6 grid max-h-64 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
              {states.map((state) => (
                <label key={state} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localSelected.includes(state)}
                    onChange={() => toggleState(state)}
                    className="h-4 w-4 rounded border-gray-300 text-[#2F2582] focus:ring-[#2F2582]"
                  />
                  <span className="text-sm text-gray-600">{state}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setLocalSelected([]);
                  onApply([]);
                  onClose();
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Clear All
              </button>
              <button
                onClick={() => {
                  onApply(localSelected);
                  onClose();
                }}
                className="rounded-lg bg-[#2F2582] px-6 py-2 text-sm font-semibold text-white hover:bg-[#241d66]"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
