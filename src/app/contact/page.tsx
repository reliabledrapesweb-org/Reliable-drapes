"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Check,
  Clock,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Globe,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { createContactSubmission } from "@/lib/actions/communications";
import { getCompanyDetails, getSocialLinks } from "@/lib/actions/site-settings";
import {
  CONTACT_EMAIL,
  COMPANY_PHONE,
  COMPANY_ADDRESS,
} from "@/lib/constants/app";
import { FaYoutube, FaLinkedinIn } from "react-icons/fa";

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
    transition: {
      delay: 0.3 + i * 0.15,
      type: "spring" as const,
      stiffness: 100,
    },
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
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all duration-300 placeholder:text-gray-400 focus:border-[#2F2582] focus:shadow-lg focus:ring-2 focus:shadow-[#2F2582]/5 focus:ring-[#2F2582]/20 focus:outline-none disabled:opacity-50"
          placeholder={placeholder}
        />
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 rounded-full bg-gradient-to-r from-[#2F2582] to-[#4a3db8]"
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
          className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all duration-300 placeholder:text-gray-400 focus:border-[#2F2582] focus:shadow-lg focus:ring-2 focus:shadow-[#2F2582]/5 focus:ring-[#2F2582]/20 focus:outline-none disabled:opacity-50"
          placeholder={placeholder}
        />
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 rounded-full bg-gradient-to-r from-[#2F2582] to-[#4a3db8]"
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
  const [companyInfo, setCompanyInfo] = useState<{
    phone: string | null;
    contactCallPhone: string | null;
    warehouseAddress: string | null;
    businessHours: Array<{ day: string; hours: string }> | null;
  }>({
    phone: null,
    contactCallPhone: null,
    warehouseAddress: null,
    businessHours: null,
  });
  const [adminSocialLinks, setAdminSocialLinks] = useState<{
    instagram: string | null;
    facebook: string | null;
    twitter: string | null;
    youtube: string | null;
    linkedin: string | null;
  }>({
    instagram: null,
    facebook: null,
    twitter: null,
    youtube: null,
    linkedin: null,
  });

  useEffect(() => {
    Promise.all([getCompanyDetails(), getSocialLinks()]).then(
      ([details, socials]) => {
        setCompanyInfo({
          phone: details.phone,
          contactCallPhone: details.contactCallPhone,
          warehouseAddress: details.warehouseAddress,
          businessHours: details.businessHours,
        });
        setAdminSocialLinks(socials);
      },
    );
  }, []);

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

  const contactItems = useMemo(
    () => [
      {
        icon: Mail,
        title: "Email",
        lines: [CONTACT_EMAIL],
        href: `mailto:${CONTACT_EMAIL}`,
      },
      {
        icon: Phone,
        title: "Call Us",
        lines: [companyInfo.contactCallPhone || "+91 98113 31948"],
        href: `tel:${(companyInfo.contactCallPhone || "+91 98113 31948").replace(/\s/g, "")}`,
      },
      {
        icon: MapPin,
        title: "Address",
        lines: [companyInfo.warehouseAddress || COMPANY_ADDRESS],
        href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyInfo.warehouseAddress || COMPANY_ADDRESS)}`,
      },
    ],
    [companyInfo],
  );

  const socialLinks = [
    ...(adminSocialLinks.instagram
      ? [
          {
            icon: Instagram,
            label: "Instagram",
            href: adminSocialLinks.instagram,
          },
        ]
      : []),
    ...(adminSocialLinks.facebook
      ? [{ icon: Facebook, label: "Facebook", href: adminSocialLinks.facebook }]
      : []),
    ...(adminSocialLinks.twitter
      ? [{ icon: Twitter, label: "Twitter", href: adminSocialLinks.twitter }]
      : []),
    ...(adminSocialLinks.youtube
      ? [{ icon: FaYoutube, label: "YouTube", href: adminSocialLinks.youtube }]
      : []),
    ...(adminSocialLinks.linkedin
      ? [
          {
            icon: FaLinkedinIn,
            label: "LinkedIn",
            href: adminSocialLinks.linkedin,
          },
        ]
      : []),
  ];

  return (
    <main className="mt-14 md:mt-16 lg:mt-[68px] xl:mt-20">
      {/* Hero Section */}
      <section className="relative flex h-[350px] items-center overflow-hidden md:h-[450px] lg:h-[500px]">
        {/* Background Image with Overlays */}
        <div className="absolute inset-0">
          <Image
            width={1920}
            height={1080}
            src="/images/abouthero.png"
            alt="Contact us background"
            className="h-full w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl"
          >
            {/* Logo */}
            <motion.div
              className="mb-4 md:mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Image
                src="/images/logo.png"
                alt="Reliable Drapes Logo"
                width={140}
                height={45}
                className="w-[120px] object-contain md:w-[140px] lg:w-[160px]"
                priority
              />
            </motion.div>

            <motion.p
              className="mb-4 text-sm font-light tracking-wide text-white/90 md:mb-6 md:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              (A Unit of Shree Ambica Furnishings (India) Pvt. Ltd.)
            </motion.p>

            {/* Heading */}
            <motion.h1
              className="mb-4 text-2xl leading-tight font-bold tracking-tight text-white md:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Contact Us
            </motion.h1>

            <motion.p
              className="text-lg text-white/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              We'd love to hear from you. Get in touch with our team.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-12 md:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Contact Form with staggered animations */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mb-6 text-2xl font-semibold text-gray-900"
              >
                Send us a Message
              </motion.h2>
              <p className="mb-4 text-sm text-gray-600">
                For urgent queries, call us at{" "}
                {companyInfo.phone || COMPANY_PHONE}
              </p>

              <motion.form
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
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
                  placeholder="+91 XXXXX XXXXX"
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
                    className="relative w-full overflow-hidden rounded-lg bg-[#2F2582] px-6 py-3.5 font-medium text-white shadow-lg transition-all duration-300 hover:bg-[#241c66] hover:shadow-xl hover:shadow-[#2F2582]/20 disabled:cursor-not-allowed disabled:opacity-50"
                    whileHover={
                      !isLoading && !isSuccess ? { scale: 1.02, y: -2 } : {}
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
                      className="rounded-lg border border-red-100 bg-red-50 p-3"
                    >
                      <p className="text-sm text-red-600">{error}</p>
                    </motion.div>
                  )}
                  {isSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="rounded-lg border border-green-100 bg-green-50 p-3"
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
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-md"
              >
                <h2 className="mb-6 text-2xl font-semibold text-gray-900">
                  Contact Information
                </h2>

                <div className="space-y-6">
                  {contactItems.map((item, index) => (
                    <motion.a
                      key={item.title}
                      href={item.href}
                      target={item.title === "Address" ? "_blank" : undefined}
                      rel={
                        item.title === "Address"
                          ? "noopener noreferrer"
                          : undefined
                      }
                      custom={index}
                      variants={contactInfoVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      whileHover={{ x: 5 }}
                      className="group flex cursor-pointer items-start gap-4"
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
                          <p
                            key={i}
                            className="mt-1 text-gray-600 transition-colors group-hover:text-[#2F2582]"
                          >
                            {line}
                          </p>
                        ))}
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.02 }}
                className="rounded-2xl border border-[#2F2582]/20 bg-gradient-to-br from-[#2F2582] to-[#3d32a8] p-8 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-[#2F2582]/20"
              >
                <motion.h3
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 }}
                  className="mb-4 text-xl font-semibold"
                >
                  Business Hours
                </motion.h3>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                  className="space-y-3 text-white/90"
                >
                  {(
                    companyInfo.businessHours || [
                      { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
                      { day: "Saturday", hours: "10:00 AM - 4:00 PM" },
                      { day: "Sunday", hours: "Closed" },
                    ]
                  ).map((item, index) => (
                    <motion.div
                      key={item.day}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-center justify-between border-b border-white/10 py-1 last:border-0"
                    >
                      <span>{item.day}</span>
                      <span className="font-medium">{item.hours}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Social Media Links */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
                className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-md"
              >
                <h3 className="mb-6 text-xl font-semibold text-gray-900">
                  Follow Us
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {socialLinks.map((link, index) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:border-[#2F2582] hover:bg-[#2F2582]/5 hover:text-[#2F2582]"
                    >
                      <link.icon className="h-5 w-5" />
                      <span>{link.label}</span>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
