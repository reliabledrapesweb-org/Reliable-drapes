/**
 * Unified Admin Modal Component
 * Provides consistent modal structure for all admin pages
 */

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function AdminModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  isSubmitting = false,
  maxWidth = "2xl",
}: AdminModalProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-2xl`}
          >
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              {children}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {cancelLabel}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#2F2582] hover:bg-[#241c66]"
                >
                  {isSubmitting ? "Saving..." : submitLabel}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
