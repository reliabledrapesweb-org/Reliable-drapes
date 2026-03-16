"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader, LucideIcon } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  icon: LucideIcon;
  variant?: "danger" | "primary" | "warning";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  icon: Icon,
  variant = "primary",
}: ConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          iconBg: "bg-red-50",
          iconColor: "text-red-500",
          confirmButton: "bg-red-500 hover:bg-red-600",
        };
      case "warning":
        return {
          iconBg: "bg-yellow-50",
          iconColor: "text-yellow-500",
          confirmButton: "bg-yellow-500 hover:bg-yellow-600",
        };
      default:
        return {
          iconBg: "bg-[#2f2582]/10",
          iconColor: "text-[#2f2582]",
          confirmButton: "bg-[#2f2582] hover:bg-[#241c66]",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 rounded-full p-2 transition-colors hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>

                {/* Icon */}
                <div className="mb-4 flex justify-center">
                  <div
                    className={`h-16 w-16 rounded-full ${styles.iconBg} flex items-center justify-center`}
                  >
                    <Icon className={`h-8 w-8 ${styles.iconColor}`} />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h2 className="mb-2 text-xl font-bold text-[#2a2a2a] uppercase">
                    {title}
                  </h2>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-2 px-4 pt-2 pb-4 sm:flex-row sm:gap-3 sm:px-6 sm:pb-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 rounded-full border-2 border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`flex-1 rounded-full px-4 py-3 text-sm ${styles.confirmButton} flex items-center justify-center gap-2 font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{confirmText}</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
