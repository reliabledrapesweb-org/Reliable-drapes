"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Send, Check, Sparkles } from "lucide-react";
import { createContactSubmission } from "@/lib/actions/communications";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 20 },
  },
};

const contactInfoVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.3 + i * 0.15, type: "spring" as const, stiffness: 100 },
  }),
};

// Animated input component with focus effects
function AnimatedInput({
  label,
  id,
  type = "text",
  value,
  onChange,
  disabled,
  placeholder,
  required,
  index,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  placeholder: string;
  required?: boolean;
  index: number;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      custom={index}
      className="group relative"
    >
      <label
        htmlFor={id}
        className={`mb-2 block text-sm font-medium transition-colors duration-200 ${
          isFocused ? "text-[#2F2582]" : "text-gray-700"
        }`}
      >
        {label} {required && <span className="text-[#2F2582]">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all duration-300 placeholder:text-gray-400 focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20 focus:shadow-lg focus:shadow-[#2F2582]/5 disabled:opacity-50"
          placeholder={placeholder}
        />
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#2F2582] to-[#4a3db8] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: isFocused ? "100%" : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
}

// Animated textarea component
function AnimatedTextarea({
  label,
  id,
  value,
  onChange,
  disabled,
  placeholder,
  required,
  rows = 5,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled: boolean;
  placeholder: string;
  required?: boolean;
  rows?: number;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div variants={itemVariants} className="group relative">
      <label
        htmlFor={id}
        className={`mb-2 block text-sm font-medium transition-colors duration-200 ${
          isFocused ? "text-[#2F2582]" : "text-gray-700"
        }`}
      >
        {label} {required && <span className="text-[#2F2582]">*</span>}
      </label>
      <div className="relative">
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all duration-300 placeholder:text-gray-400 focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20 focus:shadow-lg focus:shadow-[#2F2582]/5 disabled:opacity-50 resize-none"
          placeholder={placeholder}
        />
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#2F2582] to-[#4a3db8] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: isFocused ? "100%" : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await createContactSubmission(formData);

    if (result.success) {
      setIsSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setTimeout(() => setIsSuccess(false), 5000);
    } else {
      setError(result.error || "Failed to send message. Please try again.");
    }

    setIsLoading(false);
  };

  const contactItems = [
    {
      icon: Mail,
      title: "Email",
      lines: ["info@example.com", "support@example.com"],
    },
    {
      icon: Phone,
      title: "Phone",
      lines: ["+1 (555) 123-4567", "Mon-Fri, 9am-6pm EST"],
    },
    {
      icon: MapPin,
      title: "Address",
      lines: ["123 Business Street", "Suite 100", "City, State 12345"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-6">
        {/* Header with enhanced animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#2F2582]/10"
          >
            <Sparkles className="h-8 w-8 text-[#2F2582]" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl"
          >
            Get in Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-lg text-gray-600"
          >
            Have a question or need assistance? We're here to help!
          </motion.p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          {/* Contact Form with staggered animations */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 text-2xl font-semibold text-gray-900"
            >
              Send us a Message
            </motion.h2>

            <motion.form
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <AnimatedInput
                label="Full Name"
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setError("");
                }}
                disabled={isLoading || isSuccess}
                placeholder="John Doe"
                required
                index={0}
              />

              <AnimatedInput
                label="Email Address"
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setError("");
                }}
                disabled={isLoading || isSuccess}
                placeholder="john@example.com"
                required
                index={1}
              />

              <AnimatedInput
                label="Phone Number (Optional)"
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={isLoading || isSuccess}
                placeholder="+1 (555) 000-0000"
                index={2}
              />

              <AnimatedInput
                label="Subject"
                id="subject"
                value={formData.subject}
                onChange={(e) => {
                  setFormData({ ...formData, subject: e.target.value });
                  setError("");
                }}
                disabled={isLoading || isSuccess}
                placeholder="How can we help?"
                required
                index={3}
              />

              <AnimatedTextarea
                label="Message"
                id="message"
                value={formData.message}
                onChange={(e) => {
                  setFormData({ ...formData, message: e.target.value });
                  setError("");
                }}
                disabled={isLoading || isSuccess}
                placeholder="Tell us more about your inquiry..."
                required
              />

              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className="relative w-full overflow-hidden rounded-lg bg-[#2F2582] px-6 py-3.5 font-medium text-white shadow-lg transition-all duration-300 hover:bg-[#241c66] hover:shadow-xl hover:shadow-[#2F2582]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={
                    !isLoading && !isSuccess
                      ? { scale: 1.02, y: -2 }
                      : {}
                  }
                  whileTap={!isLoading && !isSuccess ? { scale: 0.98 } : {}}
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <motion.div
                          className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        <span>Sending...</span>
                      </motion.div>
                    ) : isSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Check className="h-5 w-5" />
                        </motion.div>
                        <span>Message Sent!</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="default"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <span>Send Message</span>
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <Send className="h-5 w-5" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="rounded-lg bg-red-50 p-3 border border-red-100"
                  >
                    <p className="text-sm text-red-600">{error}</p>
                  </motion.div>
                )}
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="rounded-lg bg-green-50 p-3 border border-green-100"
                  >
                    <p className="text-sm text-green-600">
                      Thank you for contacting us! We'll get back to you soon.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.form>
          </motion.div>

          {/* Contact Information with staggered animations */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <h2 className="mb-6 text-2xl font-semibold text-gray-900">
                Contact Information
              </h2>

              <div className="space-y-6">
                {contactItems.map((item, index) => (
                  <motion.div
                    key={item.title}
                    custom={index}
                    variants={contactInfoVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ x: 5 }}
                    className="flex items-start gap-4 group cursor-default"
                  >
                    <motion.div
                      className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2F2582]/10 transition-colors duration-300 group-hover:bg-[#2F2582]/20"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <item.icon className="h-6 w-6 text-[#2F2582]" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {item.title}
                      </h3>
                      {item.lines.map((line, i) => (
                        <p key={i} className="mt-1 text-gray-600">
                          {line}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl border border-[#2F2582]/20 bg-gradient-to-br from-[#2F2582] to-[#3d32a8] p-8 text-white shadow-lg hover:shadow-xl hover:shadow-[#2F2582]/20 transition-all duration-300"
            >
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mb-4 text-xl font-semibold"
              >
                Business Hours
              </motion.h3>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="space-y-3 text-white/90"
              >
                {[
                  { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
                  { day: "Saturday", hours: "10:00 AM - 4:00 PM" },
                  { day: "Sunday", hours: "Closed" },
                ].map((item, index) => (
                  <motion.div
                    key={item.day}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex justify-between items-center py-1 border-b border-white/10 last:border-0"
                  >
                    <span>{item.day}</span>
                    <span className="font-medium">{item.hours}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
