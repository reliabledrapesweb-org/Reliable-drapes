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
        className={`text-sm font-medium transition-colors duration-200 ${isFocused ? "text-[#2f2582]" : "text-gray-700"
          }`}
      >
        {label}
      </label>
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon
              className={`h-5 w-5 transition-colors duration-200 ${isFocused ? "text-[#2f2582]" : "text-gray-400"
                }`}
            />
          </div>
        )}
        <input
          {...(name ? register(name) : {})}
          className={`flex h-12 w-full rounded-xl border-2 bg-white px-4 py-3 text-sm text-gray-900 transition-all duration-200 outline-none placeholder:text-gray-400 
            ${Icon ? "pl-11" : ""}
            ${isFocused
              ? "border-[#2f2582] ring-4 ring-[#2f2582]/10 shadow-sm"
              : "border-gray-200 hover:border-gray-300"
            }
            disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200`}
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
          className="text-xs text-red-500 flex items-center gap-1"
        >
          <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
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
    user.avatar_url || null
  );
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { logout, setUser, user: authUser } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState("details");

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
    event: React.ChangeEvent<HTMLInputElement>
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
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
      {/* Sidebar Navigation */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full shrink-0 lg:w-72"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-[#161616]">My account</h2>
          <p className="text-gray-500 mt-1 text-sm">
            Manage your profile and preferences
          </p>
        </motion.div>

        <nav className="space-y-1 bg-white rounded-2xl p-2 shadow-sm ring-1 ring-gray-100">
          {PROFILE_SIDEBAR_LINKS.map((link, index) => (
            <motion.a
              key={link.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              href={link.href || "#"}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 group cursor-pointer ${(link.id === activeTab && !link.href) || (link.id === 'details' && activeTab === 'details')
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

                if (link.id === 'orders') {
                  setActiveTab('orders');
                } else if (link.id === 'details') {
                  setActiveTab('details');
                } else if (link.id === 'address') {
                  setActiveTab('details');
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
                className={`h-4 w-4 transition-all duration-200 ${(link.id === activeTab && !link.href)
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
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
            className="w-full justify-center rounded-xl border-2 border-gray-200 py-6 text-base text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
            onClick={() => setShowLogoutModal(true)}
          >
            <LogOut className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
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
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 lg:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-gray-100 group">
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
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
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
              <p className="text-gray-500 mt-1">{user.email}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-2 border-gray-200 hover:border-[#2f2582] hover:text-[#2f2582] hover:bg-[#2f2582]/5 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
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
                        className="rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                        onClick={handleDeleteAvatar}
                        disabled={isRemoving}
                      >
                        {isRemoving ? (
                          <>
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            Removing...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
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
          {activeTab === 'orders' ? (
            <OrdersSection />
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Info Section */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-[#2f2582]/10 flex items-center justify-center">
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
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        value={user.email || ""}
                        disabled
                        type="email"
                        className="flex h-12 w-full cursor-not-allowed rounded-xl border-2 border-gray-100 bg-gray-50 pl-11 pr-4 py-3 text-sm text-gray-500 outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
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
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        value="•••••••••"
                        disabled
                        type="password"
                        className="flex h-12 w-full cursor-not-allowed rounded-xl border-2 border-gray-100 bg-gray-50 pl-11 pr-4 py-3 text-sm text-gray-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordModal(true)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#2f2582] hover:text-[#241c66] font-medium transition-colors"
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
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-[#2f2582]/10 flex items-center justify-center">
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
                className="flex justify-end pt-4 border-t border-gray-100"
              >
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative h-12 px-8 cursor-pointer rounded-xl bg-[#2f2582] text-base font-medium text-white hover:bg-[#241c66] hover:shadow-lg hover:shadow-[#2f2582]/25 disabled:opacity-70 transition-all duration-300"
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
