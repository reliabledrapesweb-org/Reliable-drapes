"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  User,
  MessageSquare,
  Home,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  IndianRupee,
  Timer,
  SkipForward,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { createConsultationRequest } from "@/lib/actions/communications";
import { PageHero, Breadcrumb } from "@/components/shared";
import { StepIndicator } from "@/components/features/consultation/StepIndicator";
import { BUDGET_RANGES, TIMELINES } from "@/lib/constants/consultation";

interface FormData {
  // Step 1: Basic Info
  name: string;
  email: string;
  phone: string;

  // Step 2: Project Details (New Design)
  customer_intent: "b2b-showroom" | "b2c-space" | "";
  project_category: "new-setup" | "upgradation" | "";
  space_type:
    | "showroom"
    | "office"
    | "hospital"
    | "home-villa"
    | "hotel-banquet"
    | "others"
    | "";

  // Step 3: Budget & Timeline
  budget_range: string;
  timeline: string;

  // Step 4: Schedule
  preferred_date: string;
  preferred_time: string;
  message: string;
}

const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

const STEPS = [
  { id: 1, title: "Basic Info", description: "Your contact details" },
  { id: 2, title: "Project", description: "Project details" },
  { id: 3, title: "Budget", description: "Budget & timeline" },
  { id: 4, title: "Schedule", description: "Book consultation" },
];

export default function StyleExpertPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    customer_intent: "",
    project_category: "",
    space_type: "",
    budget_range: "",
    timeline: "",
    preferred_date: "",
    preferred_time: "",
    message: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "Please enter a valid email";
        }
        if (!formData.phone.trim()) {
          newErrors.phone = "Phone number is required";
        } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
          newErrors.phone = "Please enter a valid phone number";
        }
        break;

      case 2:
        if (!formData.customer_intent)
          newErrors.customer_intent = "Please select your intent";
        if (!formData.project_category)
          newErrors.project_category = "Please select a project category";
        if (!formData.space_type)
          newErrors.space_type = "Please select a space type";
        break;

      case 3:
        if (!formData.budget_range)
          newErrors.budget_range = "Please select a budget range";
        if (!formData.timeline) newErrors.timeline = "Please select a timeline";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      addToast("Please fill in all required fields", "error");
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      addToast("Please fill in all required fields", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createConsultationRequest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service_type: "style-consultation",
        budget_range: formData.budget_range,
        timeline: formData.timeline,
        preferred_date: formData.preferred_date || undefined,
        preferred_time: formData.preferred_time || undefined,
        message: formData.message || undefined,
        customer_intent: formData.customer_intent || undefined,
        project_category: formData.project_category || undefined,
        space_type: formData.space_type || undefined,
      });

      if (result.success) {
        setIsSubmitted(true);
        addToast("Consultation request submitted successfully!", "success");
      } else {
        addToast(result.error || "Failed to submit request", "error");
      }
    } catch {
      addToast("An unexpected error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (isSubmitted) {
    return (
      <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[68px] xl:mt-20">
        <PageHero
          heading="Style Expert"
          backgroundImage="/images/heroes/style-expert-hero.jpg"
        />
        <Breadcrumb />
        <div className="w-full py-12 md:py-16 lg:py-20">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl sm:p-8 md:p-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100"
                >
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-4 text-4xl font-bold text-[#2a2a2a]"
                >
                  Request Submitted Successfully!
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-8 text-lg text-gray-600"
                >
                  Thank you for choosing Reliable Drapes! Our style expert will
                  contact you within 24 hours to confirm your consultation.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-4"
                >
                  <Button
                    onClick={() => (window.location.href = "/")}
                    className="h-auto bg-[#2f2582] px-8 py-4 text-lg font-semibold hover:bg-[#241c66]"
                  >
                    Back to Home
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </main>
    );
  }

  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[68px] xl:mt-20">
      <PageHero
        heading="Style Expert"
        backgroundImage="/images/heroes/style-expert-hero.jpg"
      />
      <Breadcrumb />

      <div className="w-full py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h1 className="mb-4 text-3xl font-bold text-[#2a2a2a] md:text-4xl">
              Book Your Design Consultation
            </h1>
            <p className="text-lg text-gray-600">
              Let&apos;s create your dream space together. Fill out the form
              below to get started.
            </p>
          </motion.div>

          {/* Step Indicator */}
          <StepIndicator
            currentStep={currentStep}
            totalSteps={STEPS.length}
            steps={STEPS}
          />

          {/* Form Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-gray-100 bg-white p-4 shadow-2xl sm:p-6 md:p-8 lg:p-12"
          >
            <AnimatePresence mode="wait">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="mb-6">
                    <h2 className="mb-2 text-2xl font-bold text-[#2a2a2a]">
                      Let&apos;s start with your details
                    </h2>
                    <p className="text-gray-600">
                      We&apos;ll use this information to contact you about your
                      consultation.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      <User className="mr-2 inline h-4 w-4" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className={`w-full rounded-xl border-2 px-4 py-3 transition-colors focus:ring-2 focus:ring-[#2f2582]/20 focus:outline-none ${
                        errors.name
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-[#2f2582]"
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        <Mail className="mr-2 inline h-4 w-4" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className={`w-full rounded-xl border-2 px-4 py-3 transition-colors focus:ring-2 focus:ring-[#2f2582]/20 focus:outline-none ${
                          errors.email
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-[#2f2582]"
                        }`}
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        <Phone className="mr-2 inline h-4 w-4" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className={`w-full rounded-xl border-2 px-4 py-3 transition-colors focus:ring-2 focus:ring-[#2f2582]/20 focus:outline-none ${
                          errors.phone
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-[#2f2582]"
                        }`}
                        placeholder="+91 98765 43210"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Project Details */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-10"
                >
                  <div className="mb-6">
                    <h2 className="mb-2 text-2xl font-bold text-[#2a2a2a]">
                      Tell us about your project
                    </h2>
                    <p className="text-gray-600">
                      Help us understand what you&apos;re looking to achieve.
                    </p>
                  </div>

                  {/* Section A: Customer Intent (What) */}
                  <div>
                    <label className="mb-4 block text-lg font-semibold text-gray-900">
                      What
                    </label>
                    {errors.customer_intent && (
                      <p className="mb-3 text-sm text-red-600">
                        {errors.customer_intent}
                      </p>
                    )}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          handleInputChange("customer_intent", "b2b-showroom")
                        }
                        className={`rounded-xl border-2 p-5 text-left transition-all ${
                          formData.customer_intent === "b2b-showroom"
                            ? "border-[#2f2582] bg-[#2f2582]/5"
                            : "border-gray-200 hover:border-[#2f2582]/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Store
                            className={`mt-0.5 h-5 w-5 ${
                              formData.customer_intent === "b2b-showroom"
                                ? "text-[#2f2582]"
                                : "text-gray-500"
                            }`}
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              Planning To Style your Showroom with Our
                              Collection?
                            </h4>
                            <p className="mt-1 text-xs text-gray-500">
                              For business customers
                            </p>
                          </div>
                          {formData.customer_intent === "b2b-showroom" && (
                            <CheckCircle className="h-5 w-5 text-[#2f2582]" />
                          )}
                        </div>
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          handleInputChange("customer_intent", "b2c-space")
                        }
                        className={`rounded-xl border-2 p-5 text-left transition-all ${
                          formData.customer_intent === "b2c-space"
                            ? "border-[#2f2582] bg-[#2f2582]/5"
                            : "border-gray-200 hover:border-[#2f2582]/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Home
                            className={`mt-0.5 h-5 w-5 ${
                              formData.customer_intent === "b2c-space"
                                ? "text-[#2f2582]"
                                : "text-gray-500"
                            }`}
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              Looking To Style Your Space?
                            </h4>
                            <p className="mt-1 text-xs text-gray-500">
                              For individual customers
                            </p>
                          </div>
                          {formData.customer_intent === "b2c-space" && (
                            <CheckCircle className="h-5 w-5 text-[#2f2582]" />
                          )}
                        </div>
                      </motion.button>
                    </div>
                  </div>

                  {/* Section B: Project Category */}
                  <div>
                    <label className="mb-4 block text-lg font-semibold text-gray-900">
                      Project Type
                    </label>
                    {errors.project_category && (
                      <p className="mb-3 text-sm text-red-600">
                        {errors.project_category}
                      </p>
                    )}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          handleInputChange("project_category", "new-setup")
                        }
                        className={`rounded-xl border-2 p-5 text-left transition-all ${
                          formData.project_category === "new-setup"
                            ? "border-[#2f2582] bg-[#2f2582]/5"
                            : "border-gray-200 hover:border-[#2f2582]/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              New Setup
                            </h4>
                            <p className="text-xs text-gray-500">
                              with our Collection
                            </p>
                          </div>
                          {formData.project_category === "new-setup" && (
                            <CheckCircle className="h-5 w-5 text-[#2f2582]" />
                          )}
                        </div>
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          handleInputChange("project_category", "upgradation")
                        }
                        className={`rounded-xl border-2 p-5 text-left transition-all ${
                          formData.project_category === "upgradation"
                            ? "border-[#2f2582] bg-[#2f2582]/5"
                            : "border-gray-200 hover:border-[#2f2582]/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Upgradation
                            </h4>
                            <p className="text-xs text-gray-500">
                              with our Collection
                            </p>
                          </div>
                          {formData.project_category === "upgradation" && (
                            <CheckCircle className="h-5 w-5 text-[#2f2582]" />
                          )}
                        </div>
                      </motion.button>
                    </div>
                  </div>

                  {/* Section C: Space Type */}
                  <div>
                    <label className="mb-4 block text-lg font-semibold text-gray-900">
                      Which Space are you looking for?
                    </label>
                    {errors.space_type && (
                      <p className="mb-3 text-sm text-red-600">
                        {errors.space_type}
                      </p>
                    )}
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 md:grid-cols-3">
                      {[
                        { id: "showroom", label: "Showroom" },
                        { id: "office", label: "Office" },
                        { id: "hospital", label: "Hospital" },
                        { id: "home-villa", label: "Home / Villa" },
                        { id: "hotel-banquet", label: "Hotel / Banquet" },
                        { id: "others", label: "Others" },
                      ].map((space) => (
                        <motion.button
                          key={space.id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handleInputChange(
                              "space_type",
                              space.id as FormData["space_type"],
                            )
                          }
                          className={`rounded-xl border-2 p-4 text-sm font-medium transition-all ${
                            formData.space_type === space.id
                              ? "border-[#2f2582] bg-[#2f2582]/5 text-[#2f2582]"
                              : "border-gray-200 text-gray-700 hover:border-[#2f2582]/50"
                          }`}
                        >
                          {space.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Budget & Timeline */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-8"
                >
                  <div className="mb-6">
                    <h2 className="mb-2 text-2xl font-bold text-[#2a2a2a]">
                      Budget & Timeline
                    </h2>
                    <p className="text-gray-600">
                      This helps us provide the best recommendations for your
                      project.
                    </p>
                  </div>

                  {/* Budget Range */}
                  <div>
                    <label className="mb-4 block text-sm font-semibold text-gray-700">
                      <IndianRupee className="mr-2 inline h-4 w-4" />
                      What&apos;s your budget range? *
                    </label>
                    {errors.budget_range && (
                      <p className="mb-2 text-sm text-red-600">
                        {errors.budget_range}
                      </p>
                    )}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {BUDGET_RANGES.map((budget) => (
                        <motion.button
                          key={budget.id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handleInputChange("budget_range", budget.id)
                          }
                          className={`rounded-xl border-2 p-4 text-left transition-all ${
                            formData.budget_range === budget.id
                              ? "border-[#2f2582] bg-[#2f2582]/5"
                              : "border-gray-200 hover:border-[#2f2582]/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {budget.label}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {budget.value}
                              </p>
                            </div>
                            {formData.budget_range === budget.id && (
                              <CheckCircle className="h-5 w-5 text-[#2f2582]" />
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <label className="mb-4 block text-sm font-semibold text-gray-700">
                      <Timer className="mr-2 inline h-4 w-4" />
                      When do you want to start? *
                    </label>
                    {errors.timeline && (
                      <p className="mb-2 text-sm text-red-600">
                        {errors.timeline}
                      </p>
                    )}
                    <div className="space-y-3">
                      {TIMELINES.map((timeline) => (
                        <motion.button
                          key={timeline.id}
                          type="button"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() =>
                            handleInputChange("timeline", timeline.id)
                          }
                          className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                            formData.timeline === timeline.id
                              ? "border-[#2f2582] bg-[#2f2582]/5"
                              : "border-gray-200 hover:border-[#2f2582]/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-2 w-2 rounded-full ${
                                  timeline.urgency === "high"
                                    ? "bg-red-500"
                                    : timeline.urgency === "medium"
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                }`}
                              />
                              <span className="font-semibold text-gray-900">
                                {timeline.label}
                              </span>
                            </div>
                            {formData.timeline === timeline.id && (
                              <CheckCircle className="h-5 w-5 text-[#2f2582]" />
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Schedule */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-8"
                >
                  <div className="mb-6">
                    <h2 className="mb-2 text-2xl font-bold text-[#2a2a2a]">
                      Schedule Your Consultation
                    </h2>
                    <p className="text-gray-600">
                      Choose a convenient time for your consultation.
                    </p>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        <Calendar className="mr-2 inline h-4 w-4" />
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        value={formData.preferred_date}
                        onChange={(e) =>
                          handleInputChange("preferred_date", e.target.value)
                        }
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-colors focus:border-[#2f2582] focus:ring-2 focus:ring-[#2f2582]/20 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        <Clock className="mr-2 inline h-4 w-4" />
                        Preferred Time
                      </label>
                      <select
                        value={formData.preferred_time}
                        onChange={(e) =>
                          handleInputChange("preferred_time", e.target.value)
                        }
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-colors focus:border-[#2f2582] focus:ring-2 focus:ring-[#2f2582]/20 focus:outline-none"
                      >
                        <option value="">Select a time</option>
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Additional Message */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      <MessageSquare className="mr-2 inline h-4 w-4" />
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) =>
                        handleInputChange("message", e.target.value)
                      }
                      rows={4}
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-colors focus:border-[#2f2582] focus:ring-2 focus:ring-[#2f2582]/20 focus:outline-none"
                      placeholder="Any other details you'd like to share..."
                    />
                  </div>

                  {/* Summary */}
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                    <h3 className="mb-4 font-semibold text-gray-900">
                      Consultation Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Intent:</span>
                        <span className="font-medium text-gray-900">
                          {formData.customer_intent === "b2b-showroom"
                            ? "Planning To Style your Showroom"
                            : formData.customer_intent === "b2c-space"
                              ? "Looking To Style Your Space"
                              : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Project:</span>
                        <span className="font-medium text-gray-900">
                          {formData.project_category === "new-setup"
                            ? "New Setup"
                            : formData.project_category === "upgradation"
                              ? "Upgradation"
                              : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Space:</span>
                        <span className="font-medium text-gray-900">
                          {formData.space_type
                            ? formData.space_type
                                .split("-")
                                .map(
                                  (w) => w.charAt(0).toUpperCase() + w.slice(1),
                                )
                                .join(" / ")
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Budget:</span>
                        <span className="font-medium text-gray-900">
                          {BUDGET_RANGES.find(
                            (b) => b.id === formData.budget_range,
                          )?.value || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Timeline:</span>
                        <span className="font-medium text-gray-900">
                          {TIMELINES.find((t) => t.id === formData.timeline)
                            ?.label || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}
                {/* Skip Button */}
                {currentStep < STEPS.length && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setCurrentStep((prev) =>
                        Math.min(prev + 1, STEPS.length),
                      );
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
                  >
                    <SkipForward className="h-4 w-4" />
                    Skip
                  </Button>
                )}
              </div>

              <div className="flex-1" />

              {/* Contact Us Button */}
              <a
                href="tel:+919625731948"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2f2582]/10 text-[#2f2582] transition-colors hover:bg-[#2f2582]/20"
                title="Contact Us"
              >
                <Phone className="h-5 w-5" />
              </a>

              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-[#2f2582] hover:bg-[#241c66]"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-[#2f2582] hover:bg-[#241c66]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Request
                      <CheckCircle className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </main>
  );
}
