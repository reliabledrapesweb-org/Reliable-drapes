"use client";

import { useForm, UseFormRegister, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Loader,
  User,
  Camera,
  Trash2,
  LogOut,
  ChevronRight,
  ChevronDown,
  Mail,
  Lock,
  UserCircle,
  Phone,
  MapPin,
  Building,
  Globe,
  Home,
} from "lucide-react";

import { UserProfile, updateProfile } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";
import { supabaseClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import { profileSchema, type ProfileFormValues } from "@/lib/validators";
import { PROFILE_SIDEBAR_LINKS } from "@/lib/constants";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { LogoutModal } from "./LogoutModal";
import { OrdersSection } from "./OrdersSection";

interface ProfileFormProps {
  user: UserProfile;
}

// Animated input field component with icon support
function AnimatedInputField({
  label,
  name,
  placeholder,
  className = "",
  type = "text",
  disabled = false,
  register,
  errors,
  icon: Icon,
}: {
  label: string;
  name?: keyof ProfileFormValues;
  placeholder?: string;
  className?: string;
  type?: string;
  disabled?: boolean;
  register: UseFormRegister<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-2 ${className}`}
    >
      <label
        className={`text-sm font-medium transition-colors duration-200 ${
          isFocused ? "text-[#2f2582]" : "text-gray-700"
        }`}
      >
        {label}
      </label>
      <div className="group relative">
        {Icon && (
          <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
            <Icon
              className={`h-5 w-5 transition-colors duration-200 ${
                isFocused ? "text-[#2f2582]" : "text-gray-400"
              }`}
            />
          </div>
        )}
        <input
          {...(name ? register(name) : {})}
          className={`flex h-12 w-full rounded-xl border-2 bg-white px-4 py-3 text-sm text-gray-900 transition-all duration-200 outline-none placeholder:text-gray-400 ${Icon ? "pl-11" : ""} ${
            isFocused
              ? "border-[#2f2582] shadow-sm ring-4 ring-[#2f2582]/10"
              : "border-gray-200 hover:border-gray-300"
          } disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500`}
          placeholder={placeholder}
          disabled={disabled}
          type={type}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
      {name && errors[name] && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 text-xs text-red-500"
        >
          <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
          {errors[name]?.message as string}
        </motion.p>
      )}
    </motion.div>
  );
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user.avatar_url || null,
  );
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { logout, setUser, user: authUser } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState("details");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["details", "orders", "wishlist", "address"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user.full_name ?? "",
      phone: user.phone ?? "",
      address_line1: user.address_line1 ?? "",
      address_line2: user.address_line2 ?? "",
      city: user.city ?? "",
      state: user.state ?? "",
      postal_code: user.postal_code ?? "",
      country: user.country ?? "India",
      avatar_url: user.avatar_url ?? "",
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    try {
      const result = await updateProfile({
        ...data,
        avatar_url: avatarUrl || undefined,
      });
      if (result.success) {
        // Update auth store with new data
        if (authUser) {
          setUser({
            ...authUser,
            full_name: data.full_name || authUser.full_name,
            avatar_url: avatarUrl || authUser.avatar_url,
          });
        }
        addToast("Profile updated successfully!", "success");
      } else {
        addToast(result.error || "Failed to update profile", "error");
      }
    } catch (error) {
      console.error("Update error:", error);
      addToast("An unexpected error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      setIsUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabaseClient.storage.from("avatars").getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      form.setValue("avatar_url", publicUrl, { shouldDirty: true });

      // Save avatar to database immediately
      const result = await updateProfile({ avatar_url: publicUrl });

      if (result.success) {
        // Update auth store immediately so header updates
        if (authUser) {
          setUser({
            ...authUser,
            avatar_url: publicUrl,
          });
        }
        addToast("Avatar updated successfully", "success");
      } else {
        throw new Error(result.error || "Failed to save avatar");
      }
    } catch (error: any) {
      addToast(error.message || "Error uploading image", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setIsRemoving(true);

      // Update database to remove avatar
      const result = await updateProfile({ avatar_url: "" });

      if (result.success) {
        // Update local state
        setAvatarUrl(null);
        form.setValue("avatar_url", "", { shouldDirty: false });

        // Update auth store so header updates
        if (authUser) {
          setUser({
            ...authUser,
            avatar_url: undefined,
          });
        }
        addToast("Avatar removed successfully", "success");
      } else {
        throw new Error(result.error || "Failed to remove avatar");
      }
    } catch (error: any) {
      addToast(error.message || "Error removing avatar", "error");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    logout();
    router.push("/");
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
      {/* Mobile Tab Selector */}
      <div className="lg:hidden">
        <div className="relative">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-left shadow-sm transition-all hover:border-gray-300"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2f2582]/10">
                <User className="h-4 w-4 text-[#2f2582]" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Currently viewing
                </p>
                <p className="text-sm font-semibold text-[#161616]">
                  {PROFILE_SIDEBAR_LINKS.find((l) => l.id === activeTab)
                    ?.name || "My details"}
                </p>
              </div>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${mobileMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/20"
                  onClick={() => setMobileMenuOpen(false)}
                />
                {/* Dropdown */}
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl"
                >
                  <div className="p-2">
                    {PROFILE_SIDEBAR_LINKS.map((link) => (
                      <button
                        key={link.id}
                        type="button"
                        className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                          link.id === activeTab && !link.href
                            ? "bg-[#2f2582] text-white"
                            : "text-gray-600 hover:bg-gray-50 hover:text-[#161616]"
                        } ${link.disabled ? "cursor-not-allowed opacity-50" : ""}`}
                        onClick={() => {
                          if (link.disabled) return;

                          if (link.href) {
                            window.location.href = link.href;
                            return;
                          }

                          if (link.id === "orders") {
                            setActiveTab("orders");
                          } else if (link.id === "details") {
                            setActiveTab("details");
                          } else if (link.id === "address") {
                            setActiveTab("details");
                            setTimeout(() => {
                              document
                                .getElementById(link.scrollTo!)
                                ?.scrollIntoView({ behavior: "smooth" });
                            }, 100);
                          }
                          setMobileMenuOpen(false);
                        }}
                      >
                        <span>{link.name}</span>
                        {link.id === activeTab && !link.href && (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 p-2">
                    <button
                      type="button"
                      className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-red-50 hover:text-red-600"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setShowLogoutModal(true);
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop Sidebar Navigation */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="hidden w-full shrink-0 lg:block lg:w-72"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-[#161616]">My account</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your profile and preferences
          </p>
        </motion.div>

        <nav className="space-y-1 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-gray-100">
          {PROFILE_SIDEBAR_LINKS.map((link, index) => (
            <motion.a
              key={link.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              href={link.href || "#"}
              className={`group flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 ${
                (link.id === activeTab && !link.href) ||
                (link.id === "details" && activeTab === "details")
                  ? "bg-[#2f2582] text-white shadow-md shadow-[#2f2582]/20"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#161616] " +
                    (link.disabled ? "cursor-not-allowed opacity-50" : "")
              }`}
              onClick={(e) => {
                if (link.disabled) e.preventDefault();

                if (link.href) {
                  // Let normal navigation happen for wishlist
                  return;
                }

                e.preventDefault();

                if (link.id === "orders") {
                  setActiveTab("orders");
                } else if (link.id === "details") {
                  setActiveTab("details");
                } else if (link.id === "address") {
                  setActiveTab("details");
                  // Small timeout to allow render if switching from another tab
                  setTimeout(() => {
                    document
                      .getElementById(link.scrollTo!)
                      ?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }
              }}
            >
              <span>{link.name}</span>
              <ChevronRight
                className={`h-4 w-4 transition-all duration-200 ${
                  link.id === activeTab && !link.href
                    ? "opacity-100"
                    : "opacity-0 group-hover:translate-x-1 group-hover:opacity-100"
                }`}
              />
            </motion.a>
          ))}
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Button
            variant="outline"
            className="group w-full justify-center rounded-xl border-2 border-gray-200 py-6 text-base text-gray-600 transition-all duration-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            onClick={() => setShowLogoutModal(true)}
          >
            <LogOut className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Log out
          </Button>
        </motion.div>
      </motion.aside>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex-1"
      >
        {/* Profile Card */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 lg:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Avatar */}
            <div className="relative">
              <div className="group relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-gray-100">
                <AnimatePresence mode="wait">
                  {avatarUrl ? (
                    <motion.div
                      key="avatar"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="h-full w-full"
                    >
                      <Image
                        src={avatarUrl}
                        alt="Profile"
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2f2582]/10 to-[#2f2582]/5 text-[#2f2582]"
                    >
                      <User className="h-12 w-12" />
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Hover overlay */}
                <div
                  className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-[#161616]">
                {form.watch("full_name") || "Welcome!"}
              </h3>
              <p className="mt-1 text-gray-500">{user.email}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-2 border-gray-200 transition-all hover:border-[#2f2582] hover:bg-[#2f2582]/5 hover:text-[#2f2582]"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Change photo
                    </>
                  )}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
                <AnimatePresence>
                  {avatarUrl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-lg text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        onClick={handleDeleteAvatar}
                        disabled={isRemoving}
                      >
                        {isRemoving ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Removing...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 lg:p-8">
          {activeTab === "orders" ? (
            <OrdersSection />
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Info Section */}
              <div>
                <div className="mb-6 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2f2582]/10">
                    <UserCircle className="h-4 w-4 text-[#2f2582]" />
                  </div>
                  <h4 className="text-lg font-semibold text-[#161616]">
                    Personal Information
                  </h4>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <AnimatedInputField
                    label="Full Name"
                    name="full_name"
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                    register={form.register}
                    errors={form.formState.errors}
                    icon={User}
                  />
                  {/* Read-only Email */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <div className="group relative">
                      <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        value={user.email || ""}
                        disabled
                        type="email"
                        className="flex h-12 w-full cursor-not-allowed rounded-xl border-2 border-gray-100 bg-gray-50 py-3 pr-4 pl-11 text-sm text-gray-500 outline-none"
                      />
                      <span className="absolute top-1/2 right-3 -translate-y-1/2 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                        Verified
                      </span>
                    </div>
                  </motion.div>

                  <AnimatedInputField
                    label="Phone number"
                    name="phone"
                    placeholder="Enter your phone number"
                    disabled={isSubmitting}
                    register={form.register}
                    errors={form.formState.errors}
                    icon={Phone}
                  />

                  {/* Password Placeholder */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="group relative">
                      <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        value="•••••••••"
                        disabled
                        type="password"
                        className="flex h-12 w-full cursor-not-allowed rounded-xl border-2 border-gray-100 bg-gray-50 py-3 pr-4 pl-11 text-sm text-gray-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordModal(true)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-[#2f2582] transition-colors hover:text-[#241c66]"
                      >
                        Change
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Address Section */}
              <motion.div
                id="address-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="mb-6 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2f2582]/10">
                    <MapPin className="h-4 w-4 text-[#2f2582]" />
                  </div>
                  <h4 className="text-lg font-semibold text-[#161616]">
                    Address Information
                  </h4>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <AnimatedInputField
                    label="Address Line 1"
                    name="address_line1"
                    placeholder="Street address"
                    className="md:col-span-2"
                    disabled={isSubmitting}
                    register={form.register}
                    errors={form.formState.errors}
                    icon={Home}
                  />
                  <AnimatedInputField
                    label="Address Line 2 (Optional)"
                    name="address_line2"
                    placeholder="Apartment, suite, etc."
                    className="md:col-span-2"
                    disabled={isSubmitting}
                    register={form.register}
                    errors={form.formState.errors}
                    icon={Building}
                  />
                  <AnimatedInputField
                    label="City"
                    name="city"
                    placeholder="Enter city"
                    disabled={isSubmitting}
                    register={form.register}
                    errors={form.formState.errors}
                    icon={Building}
                  />
                  <AnimatedInputField
                    label="State / Province"
                    name="state"
                    placeholder="Enter state"
                    disabled={isSubmitting}
                    register={form.register}
                    errors={form.formState.errors}
                    icon={MapPin}
                  />
                  <AnimatedInputField
                    label="Postal Code"
                    name="postal_code"
                    placeholder="Enter postal code"
                    disabled={isSubmitting}
                    register={form.register}
                    errors={form.formState.errors}
                    icon={MapPin}
                  />
                  <AnimatedInputField
                    label="Country"
                    name="country"
                    placeholder="Enter country"
                    disabled={isSubmitting}
                    register={form.register}
                    errors={form.formState.errors}
                    icon={Globe}
                  />
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-end border-t border-gray-100 pt-4"
              >
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative h-12 cursor-pointer rounded-xl bg-[#2f2582] px-8 text-base font-medium text-white transition-all duration-300 hover:bg-[#241c66] hover:shadow-lg hover:shadow-[#2f2582]/25 disabled:opacity-70"
                >
                  <span
                    className={`flex items-center gap-2 ${isSubmitting ? "opacity-0" : "opacity-100"} transition-opacity duration-200`}
                  >
                    Save changes
                  </span>
                  {isSubmitting && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader className="h-5 w-5 animate-spin text-white" />
                    </div>
                  )}
                </Button>
              </motion.div>
            </form>
          )}
        </div>
      </motion.div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
