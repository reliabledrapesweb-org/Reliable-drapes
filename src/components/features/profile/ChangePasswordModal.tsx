"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Eye, EyeOff, Lock, Loader, Check } from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { addToast } = useToast();

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("One number");
    return errors;
  };

  const passwordRequirements = validatePassword(newPassword);
  const isPasswordValid = passwordRequirements.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!currentPassword) {
      setError("Please enter your current password");
      return;
    }

    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }

    if (!isPasswordValid) {
      setError("New password doesn't meet requirements");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setIsLoading(true);

    try {
      // First, verify the current password by re-authenticating
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (!user?.email) {
        setError("Unable to verify user. Please try again.");
        setIsLoading(false);
        return;
      }

      // Try to sign in with current password to verify it
      const { error: signInError } = await supabaseClient.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setError("Current password is incorrect");
        setIsLoading(false);
        return;
      }

      // Update the password
      const { error: updateError } = await supabaseClient.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message || "Failed to update password");
        setIsLoading(false);
        return;
      }

      addToast("Password changed successfully!", "success");
      handleClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl md:rounded-[2rem] shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white z-10 px-4 md:px-6 pt-4 md:pt-6 pb-3 border-b border-gray-100">
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                </button>

                {/* Header Content */}
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-[#2a2a2a] mb-1">
                    Change Password
                  </h2>
                  <p className="text-xs md:text-sm text-[#6a6a6a]">
                    Keep your account secure with a strong password
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="px-4 md:px-6 py-4 md:py-5">
                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-xs md:text-sm text-red-600">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-[#2a2a2a] mb-1.5">
                      Current Password *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Lock className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                      </div>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          setError("");
                        }}
                        placeholder="Enter current password"
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 pl-10 md:pl-11 pr-10 md:pr-11 text-sm md:text-base rounded-lg md:rounded-xl border-2 border-gray-200 focus:border-[#2f2582] focus:outline-none transition-colors"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 md:h-5 md:w-5" />
                        ) : (
                          <Eye className="h-4 w-4 md:h-5 md:w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-[#2a2a2a] mb-1.5">
                      New Password *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Lock className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                      </div>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setError("");
                        }}
                        placeholder="Enter new password"
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 pl-10 md:pl-11 pr-10 md:pr-11 text-sm md:text-base rounded-lg md:rounded-xl border-2 border-gray-200 focus:border-[#2f2582] focus:outline-none transition-colors"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 md:h-5 md:w-5" />
                        ) : (
                          <Eye className="h-4 w-4 md:h-5 md:w-5" />
                        )}
                      </button>
                    </div>

                    {/* Password Requirements */}
                    {newPassword && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          Password requirements:
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { label: "8+ characters", met: newPassword.length >= 8 },
                            { label: "Uppercase", met: /[A-Z]/.test(newPassword) },
                            { label: "Lowercase", met: /[a-z]/.test(newPassword) },
                            { label: "Number", met: /[0-9]/.test(newPassword) },
                          ].map((req) => (
                            <div
                              key={req.label}
                              className={`flex items-center gap-1.5 text-xs ${
                                req.met ? "text-green-600" : "text-gray-400"
                              }`}
                            >
                              <Check
                                className={`h-3.5 w-3.5 ${
                                  req.met ? "opacity-100" : "opacity-30"
                                }`}
                              />
                              {req.label}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-[#2a2a2a] mb-1.5">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Lock className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError("");
                        }}
                        placeholder="Confirm new password"
                        className={`w-full px-3 md:px-4 py-2.5 md:py-3 pl-10 md:pl-11 pr-10 md:pr-11 text-sm md:text-base rounded-lg md:rounded-xl border-2 focus:outline-none transition-colors ${
                          confirmPassword && confirmPassword !== newPassword
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-[#2f2582]"
                        }`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 md:h-5 md:w-5" />
                        ) : (
                          <Eye className="h-4 w-4 md:h-5 md:w-5" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== newPassword && (
                      <p className="text-xs text-red-500 mt-1.5">Passwords don't match</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col-reverse md:flex-row gap-2 md:gap-3 pt-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isLoading}
                      className="flex-1 px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base rounded-full border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !isPasswordValid || newPassword !== confirmPassword || !currentPassword}
                      className="flex-1 px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base rounded-full bg-[#2f2582] text-white font-semibold hover:bg-[#251e66] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <span>Update Password</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
