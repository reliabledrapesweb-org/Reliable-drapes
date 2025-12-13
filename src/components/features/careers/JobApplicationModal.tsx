"use client";

import { useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitJobApplication } from "@/lib/actions/job-applications";
import type { Job } from "@/lib/actions/jobs";
import { supabaseClient } from "@/lib/supabase/client";

interface JobApplicationModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export function JobApplicationModal({ job, isOpen, onClose }: JobApplicationModalProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    cover_letter: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      const supabase = supabaseClient();
      const { error: uploadError } = await supabase.storage
        .from('job-applications')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('job-applications')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading resume:", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!job) return;
    if (!resumeFile) {
      setError("Please upload your resume");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload resume
      const resumeUrl = await uploadResume(resumeFile);
      
      if (!resumeUrl) {
        throw new Error("Failed to upload resume");
      }

      // Submit application
      const result = await submitJobApplication({
        job_id: job.id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        resume_url: resumeUrl,
        cover_letter: formData.cover_letter || undefined,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to submit application");
      }

      // Success - close modal and reset form
      alert("Application submitted successfully! We'll review your application and get back to you soon.");
      handleClose();
    } catch (error) {
      console.error("Error submitting application:", error);
      setError(error instanceof Error ? error.message : "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      cover_letter: "",
    });
    setResumeFile(null);
    setError(null);
    onClose();
  };

  if (!job) return null;

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
              className="relative w-full max-w-lg bg-white rounded-2xl md:rounded-[2rem] shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white z-10 px-4 md:px-6 pt-4 md:pt-6 pb-3 border-b border-gray-100">
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                </button>

                {/* Header */}
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-[#2a2a2a] mb-1">
                    Apply for Position
                  </h2>
                  <p className="text-base md:text-lg font-semibold text-[#2f2582] line-clamp-1">{job.title}</p>
                  <p className="text-xs md:text-sm text-[#6a6a6a] mt-0.5">
                    {job.type} • {job.location}
                  </p>
                </div>
              </div>

              <div className="px-4 md:px-6 py-4 md:py-5">

              {/* Error Message */}
              {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs md:text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Application Form */}
              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="full_name" className="block text-xs md:text-sm font-medium text-[#2a2a2a] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base rounded-lg md:rounded-xl border-2 border-gray-200 focus:border-[#2f2582] focus:outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs md:text-sm font-medium text-[#2a2a2a] mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base rounded-lg md:rounded-xl border-2 border-gray-200 focus:border-[#2f2582] focus:outline-none transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-xs md:text-sm font-medium text-[#2a2a2a] mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base rounded-lg md:rounded-xl border-2 border-gray-200 focus:border-[#2f2582] focus:outline-none transition-colors"
                    placeholder="+91 98765 43210"
                  />
                </div>

                {/* Resume Upload */}
                <div>
                  <label htmlFor="resume" className="block text-xs md:text-sm font-medium text-[#2a2a2a] mb-1.5">
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
                      className="flex items-center justify-center gap-2 w-full px-3 md:px-4 py-2.5 md:py-3 text-sm rounded-lg md:rounded-xl border-2 border-dashed border-gray-300 hover:border-[#2f2582] cursor-pointer transition-colors"
                    >
                      <Upload className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                      <span className="text-xs md:text-sm text-gray-600 truncate">
                        {resumeFile ? resumeFile.name : "Upload resume (PDF, max 5MB)"}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <label htmlFor="cover_letter" className="block text-xs md:text-sm font-medium text-[#2a2a2a] mb-1.5">
                    Cover Letter (Optional)
                  </label>
                  <textarea
                    id="cover_letter"
                    name="cover_letter"
                    value={formData.cover_letter}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base rounded-lg md:rounded-xl border-2 border-gray-200 focus:border-[#2f2582] focus:outline-none transition-colors resize-none"
                    placeholder="Tell us why you're interested..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex flex-col-reverse md:flex-row gap-2 md:gap-3 pt-2 md:pt-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base rounded-full border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="flex-1 px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base rounded-full bg-[#2f2582] text-white font-semibold hover:bg-[#251e66] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting || isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                        {isUploading ? "Uploading..." : "Submitting..."}
                      </>
                    ) : (
                      "Submit Application"
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
