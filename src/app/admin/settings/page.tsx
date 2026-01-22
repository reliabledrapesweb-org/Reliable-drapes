"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Globe,
  Home,
  Lock,
  Shield,
  Camera,
  Loader,
  Check,
  AlertCircle,
  Save,
  RefreshCw,
  Palette,
  Sun,
  Moon,
  Monitor,
  RotateCcw,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Table,
  Navigation,
  Type,
} from "lucide-react";

import { UserProfile, getProfile, updateProfile } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { supabaseClient } from "@/lib/supabase/client";
import { useAdmin } from "@/lib/hooks/useAdmin";
import { profileSchema, type ProfileFormValues } from "@/lib/validators";
import { ChangePasswordModal } from "@/components/features/profile/ChangePasswordModal";
import { SettingsSkeleton } from "@/components/ui/AdminSkeletons";
import {
  useAdminPreferencesStore,
  ACCENT_COLORS,
  type ThemeMode,
  type AccentColor,
  type SidebarLayout,
  type FontSize,
} from "@/lib/store";

// Settings tabs
const SETTINGS_TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
] as const;

type SettingsTab = (typeof SETTINGS_TABS)[number]["id"];

export default function AdminSettingsPage() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { toasts, addToast, removeToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
    },
  });

  // Fetch profile on mount
  useEffect(() => {
    if (isAdmin) {
      fetchProfile();
    }
  }, [isAdmin]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const result = await getProfile();
      if (result.success && result.data) {
        setProfile(result.data);
        setAvatarUrl(result.data.avatar_url || null);
        setLastSynced(new Date());

        // Reset form with profile data
        form.reset({
          full_name: result.data.full_name ?? "",
          phone: result.data.phone ?? "",
          address_line1: result.data.address_line1 ?? "",
          address_line2: result.data.address_line2 ?? "",
          city: result.data.city ?? "",
          state: result.data.state ?? "",
          postal_code: result.data.postal_code ?? "",
          country: result.data.country ?? "India",
        });
      } else {
        addToast(result.error || "Failed to load profile", "error");
      }
    } catch (error) {
      addToast("An unexpected error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      addToast("Please select an image file", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast("Image size must be less than 5MB", "error");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabaseClient.storage.from("avatars").getPublicUrl(filePath);

      // Update profile with new avatar
      const updateResult = await updateProfile({ avatar_url: publicUrl });

      if (updateResult.success) {
        setAvatarUrl(publicUrl);
        addToast("Avatar updated successfully", "success");
      } else {
        addToast(updateResult.error || "Failed to update avatar", "error");
      }
    } catch (error) {
      addToast("Failed to upload avatar", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await updateProfile(data);

      if (result.success) {
        addToast("Profile updated successfully", "success");
        setLastSynced(new Date());
        // Refetch to ensure sync
        await fetchProfile();
      } else {
        addToast(result.error || "Failed to update profile", "error");
      }
    } catch (error) {
      addToast("An unexpected error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (adminLoading || isLoading) {
    return <SettingsSkeleton />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center dark:text-gray-200">
        <p className="text-gray-500 dark:text-gray-400">Access denied</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl dark:text-white">
            Settings
          </h1>
          <p className="mt-1 text-xs text-gray-600 sm:text-sm dark:text-gray-400">
            Manage your admin profile and preferences
          </p>
        </div>
        {lastSynced && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <RefreshCw className="h-3 w-3" />
            <span>Last synced: {lastSynced.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Sync Notice */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <AlertCircle className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Profile Sync Active
          </p>
          <p className="mt-0.5 text-xs text-blue-700 dark:text-blue-300">
            Changes made here will automatically sync with your public profile.
            Both your admin and customer profiles share the same data.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
        {SETTINGS_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-[#2F2582] text-[#2F2582] dark:border-[#a099ff] dark:text-[#a099ff]"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Avatar Section */}
          <Card className="dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg dark:text-white">
                Profile Photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-gray-100 bg-gray-100 dark:border-gray-600 dark:bg-gray-700">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#2F2582]/10 dark:bg-[#a099ff]/10">
                        <User className="h-10 w-10 text-[#2F2582] dark:text-[#a099ff]" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#2F2582] text-white shadow-lg transition-colors hover:bg-[#241c66] disabled:opacity-50 dark:border-gray-800"
                  >
                    {isUploading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {profile?.full_name || "Admin User"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {profile?.email}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    <Shield className="h-3 w-3" />
                    Administrator
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Card className="dark:border-gray-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name and Email */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        {...form.register("full_name")}
                        className="h-12 w-full rounded-xl border-2 border-gray-200 pr-4 pl-11 text-sm transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-[#a099ff] dark:focus:ring-[#a099ff]/20"
                        placeholder="Enter your full name"
                      />
                    </div>
                    {form.formState.errors.full_name && (
                      <p className="text-xs text-red-500">
                        {form.formState.errors.full_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        value={profile?.email || ""}
                        disabled
                        className="h-12 w-full cursor-not-allowed rounded-xl border-2 border-gray-200 bg-gray-50 pr-4 pl-11 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Email cannot be changed
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      {...form.register("phone")}
                      className="h-12 w-full rounded-xl border-2 border-gray-200 pr-4 pl-11 text-sm transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-[#a099ff] dark:focus:ring-[#a099ff]/20"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Address Section */}
                <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                    <MapPin className="h-4 w-4" />
                    Address Information
                  </h3>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Address Line 1
                      </label>
                      <div className="relative">
                        <Home className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          {...form.register("address_line1")}
                          className="h-12 w-full rounded-xl border-2 border-gray-200 pr-4 pl-11 text-sm transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-[#a099ff] dark:focus:ring-[#a099ff]/20"
                          placeholder="Street address"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Address Line 2
                      </label>
                      <div className="relative">
                        <Building className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          {...form.register("address_line2")}
                          className="h-12 w-full rounded-xl border-2 border-gray-200 pr-4 pl-11 text-sm transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-[#a099ff] dark:focus:ring-[#a099ff]/20"
                          placeholder="Apartment, suite, etc. (optional)"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          City
                        </label>
                        <input
                          {...form.register("city")}
                          className="h-12 w-full rounded-xl border-2 border-gray-200 px-4 text-sm transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-[#a099ff] dark:focus:ring-[#a099ff]/20"
                          placeholder="City"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          State
                        </label>
                        <input
                          {...form.register("state")}
                          className="h-12 w-full rounded-xl border-2 border-gray-200 px-4 text-sm transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-[#a099ff] dark:focus:ring-[#a099ff]/20"
                          placeholder="State"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Postal Code
                        </label>
                        <input
                          {...form.register("postal_code")}
                          className="h-12 w-full rounded-xl border-2 border-gray-200 px-4 text-sm transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-[#a099ff] dark:focus:ring-[#a099ff]/20"
                          placeholder="Postal code"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Country
                        </label>
                        <div className="relative">
                          <Globe className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                          <input
                            {...form.register("country")}
                            className="h-12 w-full rounded-xl border-2 border-gray-200 pr-4 pl-11 text-sm transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-[#a099ff] dark:focus:ring-[#a099ff]/20"
                            placeholder="Country"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end border-t border-gray-200 pt-6 dark:border-gray-700">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#2F2582] hover:bg-[#241c66] dark:bg-[#a099ff] dark:text-[#2F2582] dark:hover:bg-[#b0a9ff]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </motion.div>
      )}

      {activeTab === "appearance" && <AppearanceTab addToast={addToast} />}

      {activeTab === "security" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Password Section */}
          <Card className="dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg dark:text-white">
                Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Change Password
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Update your password to keep your account secure
                  </p>
                </div>
                <Button
                  onClick={() => setShowPasswordModal(true)}
                  variant="outline"
                  className="border-[#2F2582] text-[#2F2582] hover:bg-[#2F2582]/10 dark:border-[#a099ff] dark:text-[#a099ff] dark:hover:bg-[#a099ff]/10"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg dark:text-white">
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Role
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your account role
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  <Shield className="h-3.5 w-3.5" />
                  Administrator
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Account Created
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    When your account was created
                  </p>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Last Sign In
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your most recent login
                  </p>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {profile?.last_sign_in_at
                    ? new Date(profile.last_sign_in_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-300">
                      Profile Synced
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400">
                      Your admin profile is synced with your user profile
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}

// Appearance Tab Component
function AppearanceTab({
  addToast,
}: {
  addToast: (message: string, type: "success" | "error" | "info") => void;
}) {
  const {
    themeMode,
    accentColor,
    sidebarLayout,
    fontSize,
    showAnimations,
    compactTables,
    showBreadcrumbs,
    setThemeMode,
    setAccentColor,
    setSidebarLayout,
    setFontSize,
    setShowAnimations,
    setCompactTables,
    setShowBreadcrumbs,
    resetToDefaults,
  } = useAdminPreferencesStore();

  const handleReset = () => {
    resetToDefaults();
    addToast("Preferences reset to defaults", "success");
  };

  const themeModes: {
    value: ThemeMode;
    label: string;
    icon: React.ElementType;
  }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const sidebarLayouts: {
    value: SidebarLayout;
    label: string;
    icon: React.ElementType;
    description: string;
  }[] = [
    {
      value: "default",
      label: "Default",
      icon: PanelLeft,
      description: "Full sidebar with labels",
    },
    {
      value: "compact",
      label: "Compact",
      icon: PanelLeftClose,
      description: "Icons only sidebar",
    },
  ];

  const fontSizes: { value: FontSize; label: string; size: string }[] = [
    { value: "small", label: "Small", size: "text-xs" },
    { value: "medium", label: "Medium", size: "text-sm" },
    { value: "large", label: "Large", size: "text-base" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Theme Mode */}
      <Card className="dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg dark:text-white">
            <Sun className="h-5 w-5" />
            Theme Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Choose how the admin dashboard appears to you
          </p>
          <div className="grid grid-cols-3 gap-3">
            {themeModes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = themeMode === mode.value;
              return (
                <button
                  key={mode.value}
                  onClick={() => setThemeMode(mode.value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    isSelected
                      ? "border-[#2F2582] bg-[#2F2582]/5 dark:border-[#a099ff] dark:bg-[#a099ff]/10"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500 dark:hover:bg-gray-700"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      isSelected
                        ? "bg-[#2F2582] text-white dark:bg-[#a099ff] dark:text-[#2F2582]"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isSelected
                        ? "text-[#2F2582] dark:text-[#a099ff]"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {mode.label}
                  </span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-[#2F2582] dark:text-[#a099ff]" />
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Note: Dark mode styling is now active
          </p>
        </CardContent>
      </Card>

      {/* Accent Color */}
      <Card className="dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg dark:text-white">
            <Palette className="h-5 w-5" />
            Accent Color
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Choose the primary accent color for buttons and highlights
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {(Object.keys(ACCENT_COLORS) as AccentColor[]).map((color) => {
              const colorConfig = ACCENT_COLORS[color];
              const isSelected = accentColor === color;
              return (
                <button
                  key={color}
                  onClick={() => setAccentColor(color)}
                  className={`group flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                    isSelected
                      ? "border-gray-900 bg-gray-50 dark:border-gray-400 dark:bg-gray-700"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                  }`}
                >
                  <div
                    className="h-10 w-10 rounded-full shadow-sm transition-transform group-hover:scale-110"
                    style={{ backgroundColor: colorConfig.primary }}
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {colorConfig.name}
                  </span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-gray-900 dark:text-gray-200" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Sidebar Layout */}
      <Card className="dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg dark:text-white">
            <PanelLeft className="h-5 w-5" />
            Sidebar Layout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Choose your preferred sidebar style
          </p>
          <div className="grid grid-cols-2 gap-4">
            {sidebarLayouts.map((layout) => {
              const Icon = layout.icon;
              const isSelected = sidebarLayout === layout.value;
              return (
                <button
                  key={layout.value}
                  onClick={() => setSidebarLayout(layout.value)}
                  className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? "border-[#2F2582] bg-[#2F2582]/5 dark:border-[#a099ff] dark:bg-[#a099ff]/10"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500 dark:hover:bg-gray-700"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                      isSelected
                        ? "bg-[#2F2582] text-white dark:bg-[#a099ff] dark:text-[#2F2582]"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p
                      className={`font-medium ${
                        isSelected
                          ? "text-[#2F2582] dark:text-[#a099ff]"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {layout.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {layout.description}
                    </p>
                  </div>
                  {isSelected && (
                    <Check className="ml-auto h-5 w-5 text-[#2F2582] dark:text-[#a099ff]" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Font Size */}
      <Card className="dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg dark:text-white">
            <Type className="h-5 w-5" />
            Font Size
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Adjust the text size in the admin dashboard
          </p>
          <div className="flex gap-3">
            {fontSizes.map((size) => {
              const isSelected = fontSize === size.value;
              return (
                <button
                  key={size.value}
                  onClick={() => setFontSize(size.value)}
                  className={`flex-1 rounded-xl border-2 px-4 py-3 transition-all ${
                    isSelected
                      ? "border-[#2F2582] bg-[#2F2582]/5 dark:border-[#a099ff] dark:bg-[#a099ff]/10"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500 dark:hover:bg-gray-700"
                  }`}
                >
                  <span
                    className={`font-medium ${size.size} ${
                      isSelected
                        ? "text-[#2F2582] dark:text-[#a099ff]"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {size.label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* UI Preferences */}
      <Card className="dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg dark:text-white">
            <Sparkles className="h-5 w-5" />
            UI Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Animations Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-600 dark:bg-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Animations
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enable smooth transitions and effects
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAnimations(!showAnimations)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                showAnimations
                  ? "bg-[#2F2582] dark:bg-[#a099ff]"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  showAnimations ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Compact Tables Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-600 dark:bg-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Table className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Compact Tables
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Reduce padding in table rows
                </p>
              </div>
            </div>
            <button
              onClick={() => setCompactTables(!compactTables)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                compactTables
                  ? "bg-[#2F2582] dark:bg-[#a099ff]"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`$ bg-white{ compactTables ? "translate-x-5" : "translate-x-0" } absolute top-0.5 left-0.5 h-5 w-5 rounded-full shadow transition-transform`}
              />
            </button>
          </div>

          {/* Breadcrumbs Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-600 dark:bg-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <Navigation className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Breadcrumbs
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Show navigation breadcrumbs
                </p>
              </div>
            </div>
            <button
              onClick={() => setCompactTables(!compactTables)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                compactTables
                  ? "bg-[#2F2582] dark:bg-[#a099ff]"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  compactTables ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Reset to Defaults */}
      <Card className="dark:border-gray-700 dark:bg-gray-800">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Reset Preferences
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Restore all appearance settings to their default values
              </p>
            </div>
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
