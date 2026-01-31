"use client";

import { useState } from "react";
import { X, Upload, Loader2, CheckCircle, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitOpenHireApplication } from "@/lib/actions/job-applications";
import { supabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

interface OpenHireModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OpenHireModal({ isOpen, onClose }: OpenHireModalProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    desired_role: "",
    cover_letter: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toasts, addToast, removeToast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF only)
      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setResumeFile(file);
      setError(null);
    }
  };

  const uploadResume = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      setUploadProgress(10);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      setUploadProgress(30);
      const { error: uploadError } = await supabaseClient.storage
        .from("job-applications")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(uploadError.message || "Failed to upload resume");
      }

      setUploadProgress(70);
      // Get public URL
      const { data } = supabaseClient.storage
        .from("job-applications")
        .getPublicUrl(filePath);

      setUploadProgress(100);
      return data.publicUrl;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload resume. Please try again.",
      );
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resumeFile) {
      setError("Please upload your resume");
      return;
    }

    if (!formData.desired_role.trim()) {
      setError("Please specify your desired role");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload resume first
      const resumeUrl = await uploadResume(resumeFile);

      if (!resumeUrl) {
        throw new Error("Failed to upload resume. Please try again.");
      }

      // Submit application
      const result = await submitOpenHireApplication({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        resume_url: resumeUrl,
        desired_role: formData.desired_role,
        cover_letter: formData.cover_letter || undefined,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to submit application");
      }

      // Success - show success message and close modal
      setError(null);

      // Show success toast
      addToast(
        "Application submitted successfully! We'll review your profile and get back to you if a suitable position opens up.",
        "success",
      );

      // Small delay before closing modal
      setTimeout(() => {
        handleClose();
      }, 500);
    } catch (error) {
      console.error(
        "[OpenHireModal] Error submitting application:",
        error,
      );
      setError(
        error instanceof Error
          ? error.message
          : "Failed to submit application. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      desired_role: "",
      cover_letter: "",
    });
    setResumeFile(null);
    setError(null);
    setUploadProgress(0);
    onClose();
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
              className="scrollbar-hide relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl md:rounded-[2rem]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 pt-4 pb-3 md:px-6 md:pt-6">
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 rounded-full p-2 transition-colors hover:bg-gray-100 md:top-4 md:right-4"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-gray-600 md:h-5 md:w-5" />
                </button>

                {/* Header */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2f2582]/10 md:h-10 md:w-10">
                      <Briefcase className="h-4 w-4 text-[#2f2582] md:h-5 md:w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-[#2a2a2a] md:text-2xl">
                      Open Application
                    </h2>
                  </div>
                  <p className="text-sm text-[#6a6a6a] md:text-base">
                    Don&apos;t see the right role? Submit your profile and we&apos;ll
                    contact you when a suitable position opens up.
                  </p>
                </div>
              </div>

              <div className="px-4 py-4 md:px-6 md:py-5">
                {/* Error Message */}
                {error && (
                  <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3">
                    <p className="text-xs text-red-600 md:text-sm">{error}</p>
                  </div>
                )}

                {/* Application Form */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-3 md:space-y-4"
                >
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="full_name"
                      className="mb-1.5 block text-xs font-medium text-[#2a2a2a] md:text-sm"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm transition-colors focus:border-[#2f2582] focus:outline-none md:rounded-xl md:px-4 md:py-2.5 md:text-base"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-xs font-medium text-[#2a2a2a] md:text-sm"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm transition-colors focus:border-[#2f2582] focus:outline-none md:rounded-xl md:px-4 md:py-2.5 md:text-base"
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-1.5 block text-xs font-medium text-[#2a2a2a] md:text-sm"
                    >
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm transition-colors focus:border-[#2f2582] focus:outline-none md:rounded-xl md:px-4 md:py-2.5 md:text-base"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  {/* Desired Role */}
                  <div>
                    <label
                      htmlFor="desired_role"
                      className="mb-1.5 block text-xs font-medium text-[#2a2a2a] md:text-sm"
                    >
                      Desired Role / Position *
                    </label>
                    <input
                      type="text"
                      id="desired_role"
                      name="desired_role"
                      value={formData.desired_role}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm transition-colors focus:border-[#2f2582] focus:outline-none md:rounded-xl md:px-4 md:py-2.5 md:text-base"
                      placeholder="e.g., Sales Manager, Interior Designer"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Tell us what type of role you&apos;re looking for
                    </p>
                  </div>

                  {/* Resume Upload */}
                  <div>
                    <label
                      htmlFor="resume"
                      className="mb-1.5 block text-xs font-medium text-[#2a2a2a] md:text-sm"
                    >
                      Resume (PDF) *
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id="resume"
                        accept=".pdf"
                        onChange={handleFileChange}
                        required
                        className="hidden"
                      />
                      <label
                        htmlFor="resume"
                        className={`flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 py-2.5 text-sm transition-colors md:rounded-xl md:px-4 md:py-3 ${
                          resumeFile
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 bg-white hover:border-[#2f2582]"
                        } cursor-pointer`}
                      >
                        {resumeFile ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600 md:h-5 md:w-5" />
                            <span className="truncate text-xs font-medium text-green-700 md:text-sm">
                              {resumeFile.name}
                            </span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 text-gray-400 md:h-5 md:w-5" />
                            <span className="truncate text-xs text-gray-600 md:text-sm">
                              Upload resume (PDF, max 5MB)
                            </span>
                          </>
                        )}
                      </label>
                      {/* Upload Progress */}
                      {isUploading && uploadProgress > 0 && (
                        <div className="mt-2">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full bg-[#2f2582] transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="mt-1 text-center text-xs text-gray-500">
                            Uploading... {uploadProgress}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div>
                    <label
                      htmlFor="cover_letter"
                      className="mb-1.5 block text-xs font-medium text-[#2a2a2a] md:text-sm"
                    >
                      Cover Letter / Skills Summary (Optional)
                    </label>
                    <textarea
                      id="cover_letter"
                      name="cover_letter"
                      value={formData.cover_letter}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full resize-none rounded-lg border-2 border-gray-200 px-3 py-2 text-sm transition-colors focus:border-[#2f2582] focus:outline-none md:rounded-xl md:px-4 md:py-2.5 md:text-base"
                      placeholder="Tell us about your skills, experience, and what you're looking for..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col-reverse gap-2 pt-2 md:flex-row md:gap-3 md:pt-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 rounded-full border-2 border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 md:px-6 md:py-3 md:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || isUploading}
                      className="relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#2f2582] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#251e66] disabled:cursor-not-allowed disabled:opacity-50 md:px-6 md:py-3 md:text-base"
                    >
                      {isSubmitting || isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin md:h-5 md:w-5" />
                          <span className="font-semibold">
                            {isUploading
                              ? "Uploading Resume..."
                              : "Submitting Application..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">
                            Submit Application
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Toast Container - Higher z-index to appear above modal */}
          <div className="fixed right-4 bottom-4 left-4 z-[10000] flex max-w-md flex-col gap-2 md:right-4 md:left-auto">
            <AnimatePresence>
              {toasts.map((toast) => {
                const icons = {
                  success: CheckCircle,
                  error: X,
                  warning: X,
                  info: X,
                };
                const bgColors = {
                  success: "bg-green-50 border-green-200",
                  error: "bg-red-50 border-red-200",
                  warning: "bg-yellow-50 border-yellow-200",
                  info: "bg-blue-50 border-blue-200",
                };
                const textColors = {
                  success: "text-green-600",
                  error: "text-red-600",
                  warning: "text-yellow-600",
                  info: "text-blue-600",
                };

                const Icon = icons[toast.type as keyof typeof icons];
                const bgColor = bgColors[toast.type as keyof typeof bgColors];
                const textColor =
                  textColors[toast.type as keyof typeof textColors];

                return (
                  <motion.div
                    key={toast.id}
                    initial={{ opacity: 0, y: 20, x: 0 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 20, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start gap-3 rounded-lg border ${bgColor} p-4 shadow-lg`}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${textColor}`} />
                    <p className={`flex-1 text-sm ${textColor}`}>
                      {toast.message}
                    </p>
                    <button
                      onClick={() => removeToast(toast.id)}
                      className={`flex-shrink-0 transition-colors hover:opacity-70`}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
