"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
  Star,
  Award,
  Users,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { createConsultationRequest } from "@/lib/actions/communications";

interface FormData {
  name: string;
  email: string;
  phone: string;
  service_type: string;
  preferred_date: string;
  preferred_time: string;
  message: string;
}

const serviceTypes = [
  {
    id: "interior-design",
    name: "Interior Design Consultation",
    description: "Complete room makeover with our expert designers",
    icon: Home,
    duration: "2-3 hours",
    price: "Free"
  },
  {
    id: "color-consultation",
    name: "Color & Style Consultation",
    description: "Perfect color schemes and style recommendations",
    icon: Palette,
    duration: "1-2 hours",
    price: "Free"
  },
  {
    id: "space-planning",
    name: "Space Planning",
    description: "Optimize your space layout and functionality",
    icon: Users,
    duration: "1-2 hours",
    price: "Free"
  },
  {
    id: "custom-design",
    name: "Custom Design Solutions",
    description: "Bespoke design solutions for unique requirements",
    icon: Sparkles,
    duration: "3-4 hours",
    price: "Free"
  }
];

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

export default function StyleExpertPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    service_type: "",
    preferred_date: "",
    preferred_time: "",
    message: ""
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

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
    if (!formData.service_type) newErrors.service_type = "Please select a service";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast("Please fix the errors in the form", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createConsultationRequest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service_type: formData.service_type,
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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-20">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="rounded-3xl bg-white p-12 shadow-2xl"
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
              Thank you for choosing Reliable Drapes! Our style expert will contact you within 24 hours to confirm your consultation.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <Button
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    service_type: "",
                    preferred_date: "",
                    preferred_time: "",
                    message: ""
                  });
                }}
                className="mr-4 bg-[#2f2582] hover:bg-[#241c66]"
              >
                Submit Another Request
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/"}
              >
                Back to Home
              </Button>
            </motion.div>
          </motion.div>
        </div>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col justify-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6 inline-flex items-center rounded-full bg-[#2f2582]/10 px-4 py-2 text-sm font-semibold text-[#2f2582]"
              >
                <Award className="mr-2 h-4 w-4" />
                Expert Design Consultation
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6 text-5xl font-bold leading-tight text-[#2a2a2a] lg:text-6xl"
              >
                Transform Your Space with Our
                <span className="bg-gradient-to-r from-[#2f2582] to-[#4c3d9e] bg-clip-text text-transparent"> Style Experts</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8 text-xl leading-relaxed text-gray-600"
              >
                Get personalized design consultation from our certified interior designers. 
                From color schemes to complete room makeovers, we'll help you create the perfect space.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-6"
              >
                <div className="text-center">
                  <div className="mb-2 text-3xl font-bold text-[#2f2582]">500+</div>
                  <div className="text-sm text-gray-600">Happy Clients</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-3xl font-bold text-[#2f2582]">15+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-3xl font-bold text-[#2f2582]">100%</div>
                  <div className="text-sm text-gray-600">Satisfaction</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-gradient-to-br from-gray-200 to-gray-300 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center"
                  alt="Interior Design Consultation"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              
              {/* Floating Stats */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-6 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[#2f2582]/10 p-3">
                    <Star className="h-6 w-6 text-[#2f2582]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#2a2a2a]">4.9/5</div>
                    <div className="text-sm text-gray-600">Client Rating</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-[#2a2a2a]">Our Design Services</h2>
            <p className="text-xl text-gray-600">Choose the perfect consultation service for your needs</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {serviceTypes.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-2"
                onClick={() => handleInputChange("service_type", service.id)}
              >
                <div className={`mb-6 inline-flex rounded-2xl p-4 transition-colors ${
                  formData.service_type === service.id 
                    ? "bg-[#2f2582] text-white" 
                    : "bg-gray-100 text-[#2f2582] group-hover:bg-[#2f2582] group-hover:text-white"
                }`}>
                  <service.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-[#2a2a2a]">{service.name}</h3>
                <p className="mb-4 text-gray-600">{service.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Duration: {service.duration}</span>
                  <span className="font-semibold text-[#2f2582]">{service.price}</span>
                </div>
                {formData.service_type === service.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-4 flex items-center justify-center"
                  >
                    <CheckCircle className="h-6 w-6 text-[#2f2582]" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation Form */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-white p-8 shadow-2xl lg:p-12"
          >
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-3xl font-bold text-[#2a2a2a]">Book Your Consultation</h2>
              <p className="text-lg text-gray-600">Fill out the form below and we'll get back to you within 24 hours</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    <User className="mr-2 inline h-4 w-4" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full rounded-xl border-2 px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2f2582]/20 ${
                      errors.name ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-[#2f2582]"
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    <Mail className="mr-2 inline h-4 w-4" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full rounded-xl border-2 px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2f2582]/20 ${
                      errors.email ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-[#2f2582]"
                    }`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  <Phone className="mr-2 inline h-4 w-4" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`w-full rounded-xl border-2 px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2f2582]/20 ${
                    errors.phone ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-[#2f2582]"
                  }`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>

              {/* Service Selection */}
              <div>
                <label className="mb-4 block text-sm font-semibold text-gray-700">
                  <Palette className="mr-2 inline h-4 w-4" />
                  Select Service Type *
                </label>
                {errors.service_type && <p className="mb-2 text-sm text-red-600">{errors.service_type}</p>}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {serviceTypes.map((service) => (
                    <motion.div
                      key={service.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                        formData.service_type === service.id
                          ? "border-[#2f2582] bg-[#2f2582]/5"
                          : "border-gray-200 hover:border-[#2f2582]/50"
                      }`}
                      onClick={() => handleInputChange("service_type", service.id)}
                    >
                      <div className="flex items-center gap-3">
                        <service.icon className={`h-5 w-5 ${
                          formData.service_type === service.id ? "text-[#2f2582]" : "text-gray-500"
                        }`} />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{service.name}</div>
                          <div className="text-sm text-gray-600">{service.duration}</div>
                        </div>
                        {formData.service_type === service.id && (
                          <CheckCircle className="h-5 w-5 text-[#2f2582]" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Scheduling */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    <Calendar className="mr-2 inline h-4 w-4" />
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={formData.preferred_date}
                    onChange={(e) => handleInputChange("preferred_date", e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-colors focus:border-[#2f2582] focus:outline-none focus:ring-2 focus:ring-[#2f2582]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    <Clock className="mr-2 inline h-4 w-4" />
                    Preferred Time
                  </label>
                  <select
                    value={formData.preferred_time}
                    onChange={(e) => handleInputChange("preferred_time", e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-colors focus:border-[#2f2582] focus:outline-none focus:ring-2 focus:ring-[#2f2582]/20"
                  >
                    <option value="">Select a time</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  <MessageSquare className="mr-2 inline h-4 w-4" />
                  Additional Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-colors focus:border-[#2f2582] focus:outline-none focus:ring-2 focus:ring-[#2f2582]/20"
                  placeholder="Tell us about your project, style preferences, or any specific requirements..."
                />
              </div>

              {/* Submit Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-center"
              >
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-3 rounded-xl bg-[#2f2582] px-12 py-4 text-lg font-semibold text-white transition-all hover:bg-[#241c66] hover:shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Book Consultation
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </section>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </main>
  );
}