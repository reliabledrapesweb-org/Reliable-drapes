"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  User,
  MessageSquare,
  Palette,
  Home,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Building2,
  IndianRupee,
  Timer,
  ImagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { createConsultationRequest } from "@/lib/actions/communications";
import { PageHero, Breadcrumb } from "@/components/shared";
import { StepIndicator } from "@/components/features/consultation/StepIndicator";
import { RoomTypeSelector } from "@/components/features/consultation/RoomTypeSelector";
import { StylePreferenceSelector } from "@/components/features/consultation/StylePreferenceSelector";
import {
  PROJECT_TYPES,
  PROPERTY_TYPES,
  BUDGET_RANGES,
  TIMELINES,
  serviceTypes,
} from "@/lib/constants/consultation";

interface FormData {
  // Step 1: Basic Info
  name: string;
  email: string;
  phone: string;

  // Step 2: Project Details
  service_type: string;
  project_type: string;
  room_types: string[];
  property_type: string;

  // Step 3: Budget & Timeline
  budget_range: string;
  timeline: string;

  // Step 4: Style & Preferences
  style_preferences: string[];
  current_challenges: string;

  // Step 5: Schedule
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
  { id: 4, title: "Style", description: "Your preferences" },
  { id: 5, title: "Schedule", description: "Book consultation" },
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
    service_type: "",
    project_type: "",
    room_types: [],
    property_type: "",
    budget_range: "",
    timeline: "",
    style_preferences: [],
    current_challenges: "",
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
        if (!formData.service_type)
          newErrors.service_type = "Please select a service";
        if (!formData.project_type)
          newErrors.project_type = "Please select a project type";
        if (formData.room_types.length === 0)
          newErrors.room_types = "Please select at least one room";
        if (!formData.property_type)
          newErrors.property_type = "Please select a property type";
        break;

      case 3:
        if (!formData.budget_range)
          newErrors.budget_range = "Please select a budget range";
        if (!formData.timeline) newErrors.timeline = "Please select a timeline";
        break;

      case 4:
        if (formData.style_preferences.length === 0) {
          newErrors.style_preferences =
            "Please select at least one style preference";
        }
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
        service_type: formData.service_type,
        project_type: formData.project_type,
        room_types: formData.room_types,
        property_type: formData.property_type,
        budget_range: formData.budget_range,
        timeline: formData.timeline,
        style_preferences: formData.style_preferences,
        current_challenges: formData.current_challenges || undefined,
        preferred_date: formData.preferred_date || undefined,
        preferred_time: formData.preferred_time || undefined,
        message: formData.message || undefined,
      });

      if (result.success) {
        setIsSubmitted(true);
        addToast("Consultation request submitted successfully!", "success");
      } else {
        addToast(result.error || "Failed to submit request", "error");
      }
    } catch (error) {
      console.error("Error submitting consultation:", error);
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
      <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
        <PageHero heading="Style Expert" />
        <Breadcrumb />
        <div className="w-full py-12 md:py-16 lg:py-20">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="rounded-3xl border border-gray-100 bg-white p-12 shadow-2xl"
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
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
      <PageHero heading="Style Expert" />
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
              Let's create your dream space together. Fill out the form below to
              get started.
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
            className="rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl lg:p-12"
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
                      Let's start with your details
                    </h2>
                    <p className="text-gray-600">
                      We'll use this information to contact you about your
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
                  className="space-y-8"
                >
                  <div className="mb-6">
                    <h2 className="mb-2 text-2xl font-bold text-[#2a2a2a]">
                      Tell us about your project
                    </h2>
                    <p className="text-gray-600">
                      Help us understand what you're looking to achieve.
                    </p>
                  </div>

                  {/* Service Type */}
                  <div>
                    <label className="mb-4 block text-sm font-semibold text-gray-700">
                      <Sparkles className="mr-2 inline h-4 w-4" />
                      What service do you need? *
                    </label>
                    {errors.service_type && (
                      <p className="mb-2 text-sm text-red-600">
                        {errors.service_type}
                      </p>
                    )}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {serviceTypes.map((service) => (
                        <motion.button
                          key={service.id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handleInputChange("service_type", service.id)
                          }
                          className={`rounded-xl border-2 p-4 text-left transition-all ${
                            formData.service_type === service.id
                              ? "border-[#2f2582] bg-[#2f2582]/5"
                              : "border-gray-200 hover:border-[#2f2582]/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <service.icon
                              className={`mt-0.5 h-5 w-5 ${
                                formData.service_type === service.id
                                  ? "text-[#2f2582]"
                                  : "text-gray-500"
                              }`}
                            />
                            <div className="flex-1">
                              <h4 className="mb-1 font-semibold text-gray-900">
                                {service.name}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {service.description}
                              </p>
                            </div>
                            {formData.service_type === service.id && (
                              <CheckCircle className="h-5 w-5 text-[#2f2582]" />
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Project Type */}
                  <div>
                    <label className="mb-4 block text-sm font-semibold text-gray-700">
                      <Home className="mr-2 inline h-4 w-4" />
                      Project Type *
                    </label>
                    {errors.project_type && (
                      <p className="mb-2 text-sm text-red-600">
                        {errors.project_type}
                      </p>
                    )}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {PROJECT_TYPES.map((type) => (
                        <motion.button
                          key={type.id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handleInputChange("project_type", type.id)
                          }
                          className={`rounded-xl border-2 p-4 text-left transition-all ${
                            formData.project_type === type.id
                              ? "border-[#2f2582] bg-[#2f2582]/5"
                              : "border-gray-200 hover:border-[#2f2582]/50"
                          }`}
                        >
                          <h4 className="mb-1 font-semibold text-gray-900">
                            {type.label}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {type.description}
                          </p>
                          {formData.project_type === type.id && (
                            <CheckCircle className="mt-2 h-4 w-4 text-[#2f2582]" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Room Types */}
                  <div>
                    <label className="mb-4 block text-sm font-semibold text-gray-700">
                      Which rooms are you working on? *
                    </label>
                    {errors.room_types && (
                      <p className="mb-2 text-sm text-red-600">
                        {errors.room_types}
                      </p>
                    )}
                    <RoomTypeSelector
                      selectedRooms={formData.room_types}
                      onChange={(rooms) =>
                        handleInputChange("room_types", rooms)
                      }
                    />
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="mb-4 block text-sm font-semibold text-gray-700">
                      <Building2 className="mr-2 inline h-4 w-4" />
                      Property Type *
                    </label>
                    {errors.property_type && (
                      <p className="mb-2 text-sm text-red-600">
                        {errors.property_type}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {PROPERTY_TYPES.map((type) => (
                        <motion.button
                          key={type.id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handleInputChange("property_type", type.id)
                          }
                          className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${
                            formData.property_type === type.id
                              ? "border-[#2f2582] bg-[#2f2582]/5 text-[#2f2582]"
                              : "border-gray-200 text-gray-700 hover:border-[#2f2582]/50"
                          }`}
                        >
                          {type.label}
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
                      What's your budget range? *
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

              {/* Step 4: Style & Preferences */}
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
                      Your Style Preferences
                    </h2>
                    <p className="text-gray-600">
                      Help us understand your aesthetic preferences.
                    </p>
                  </div>

                  {/* Style Preferences */}
                  <div>
                    <label className="mb-4 block text-sm font-semibold text-gray-700">
                      <Palette className="mr-2 inline h-4 w-4" />
                      What styles do you love? *
                    </label>
                    {errors.style_preferences && (
                      <p className="mb-2 text-sm text-red-600">
                        {errors.style_preferences}
                      </p>
                    )}
                    <StylePreferenceSelector
                      selectedStyles={formData.style_preferences}
                      onChange={(styles) =>
                        handleInputChange("style_preferences", styles)
                      }
                      maxSelections={3}
                    />
                  </div>

                  {/* Current Challenges */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      <MessageSquare className="mr-2 inline h-4 w-4" />
                      What challenges are you facing? (Optional)
                    </label>
                    <textarea
                      value={formData.current_challenges}
                      onChange={(e) =>
                        handleInputChange("current_challenges", e.target.value)
                      }
                      rows={4}
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-colors focus:border-[#2f2582] focus:ring-2 focus:ring-[#2f2582]/20 focus:outline-none"
                      placeholder="Tell us about any specific problems you're trying to solve, like lack of storage, poor lighting, or awkward layout..."
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 5: Schedule */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
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
                        <span className="text-gray-600">Service:</span>
                        <span className="font-medium text-gray-900">
                          {serviceTypes.find(
                            (s) => s.id === formData.service_type,
                          )?.name || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rooms:</span>
                        <span className="font-medium text-gray-900">
                          {formData.room_types.length} selected
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

              <div className="flex-1" />

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
