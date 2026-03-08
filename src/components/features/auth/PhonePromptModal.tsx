"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, X, Loader } from "lucide-react";
import {
  savePhoneNumber,
  incrementPhoneDismissCount,
} from "@/lib/actions/users";

type PhonePromptModalProps = {
  isOpen: boolean;
  canDismiss: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function PhonePromptModal({
  isOpen,
  canDismiss,
  onClose,
  onSaved,
}: PhonePromptModalProps) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number");
      return;
    }

    setIsSubmitting(true);
    const result = await savePhoneNumber(phone);
    setIsSubmitting(false);

    if (result.success) {
      onSaved();
    } else {
      setError(result.error || "Failed to save phone number");
    }
  };

  const handleDismiss = async () => {
    setIsSubmitting(true);
    await incrementPhoneDismissCount();
    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {canDismiss && (
              <button
                onClick={handleDismiss}
                disabled={isSubmitting}
                className="absolute top-4 right-4 cursor-pointer rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#2F2582]/10">
              <Phone className="h-6 w-6 text-[#2F2582]" />
            </div>

            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Add your phone number
            </h2>
            <p className="mb-6 text-sm text-gray-500">
              {canDismiss
                ? "We'd love to have your phone number for order updates and support."
                : "A phone number is required to continue using Reliable Drapes."}
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="phone-prompt"
                  className="mb-2 block text-xs font-medium tracking-widest text-gray-600 uppercase"
                >
                  Mobile Number
                </label>
                <div className="flex items-center rounded-lg border border-gray-300 transition-colors focus-within:border-[#2F2582] focus-within:ring-2 focus-within:ring-[#2F2582]/20">
                  <span className="pr-1 pl-3 text-sm text-gray-500">+91</span>
                  <input
                    id="phone-prompt"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                      setError("");
                    }}
                    disabled={isSubmitting}
                    className="w-full rounded-r-lg border-0 bg-transparent px-2 py-3 text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50"
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="mt-1.5 text-xs text-red-500">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || phone.length < 10}
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#2F2582] text-sm font-medium text-white transition-colors hover:bg-[#241c66] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting && <Loader className="h-4 w-4 animate-spin" />}
                Save Phone Number
              </button>

              {canDismiss && (
                <button
                  type="button"
                  onClick={handleDismiss}
                  disabled={isSubmitting}
                  className="mt-3 w-full cursor-pointer py-2 text-center text-sm text-gray-500 transition-colors hover:text-gray-700 disabled:opacity-50"
                >
                  Skip for now
                </button>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
