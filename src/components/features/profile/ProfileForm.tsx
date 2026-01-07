"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "motion/react";
import { useState, useRef } from "react";
import { UserProfile, updateProfile } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";
import {
  Loader2,
  Save,
  User,
  Phone,
  MapPin,
  Upload,
  Trash2,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { supabaseClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";

// Schema validation
const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default("India"),
  avatar_url: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: UserProfile;
}

const SIDEBAR_LINKS = [
  { name: "My details", id: "details", active: true },
  { name: "My wishlist", id: "wishlist", href: "/wishlist" },
  { name: "My orders", id: "orders", href: "#", disabled: true },
  {
    name: "My address book",
    id: "address",
    active: false,
    scrollTo: "address-section",
  }, // Linking address to details for now
];

export function ProfileForm({ user }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user.avatar_url || null,
  );
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { logout } = useAuthStore();
  const router = useRouter();

  const form = useForm<any>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: (user.full_name ?? "") as string,
      phone: (user.phone ?? "") as string,
      address_line1: (user.address_line1 ?? "") as string,
      address_line2: (user.address_line2 ?? "") as string,
      city: (user.city ?? "") as string,
      state: (user.state ?? "") as string,
      postal_code: (user.postal_code ?? "") as string,
      country: (user.country ?? "India") as string,
      avatar_url: (user.avatar_url ?? "") as string,
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
      addToast("Image uploaded successfully", "success");
    } catch (error: any) {
      addToast(error.message || "Error uploading image", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAvatar = () => {
    setAvatarUrl(null);
    form.setValue("avatar_url", "", { shouldDirty: true });
  };

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    logout();
    router.push("/");
  };

  const InputField = ({
    label,
    name,
    icon: Icon,
    placeholder,
    className = "",
    type = "text",
    disabled = false,
  }: {
    label: string;
    name?: keyof ProfileFormValues;
    icon?: any;
    placeholder?: string;
    className?: string;
    type?: string;
    disabled?: boolean;
  }) => (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          {...(name ? form.register(name) : {})}
          className={`flex h-12 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 pl-4 text-sm transition-all outline-none placeholder:text-gray-400 focus:border-[#2f2582] focus:ring-1 focus:ring-[#2f2582] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500`}
          placeholder={placeholder}
          disabled={isSubmitting || disabled}
          type={type}
        />
      </div>
      {name && form.formState.errors[name] && (
        <p className="text-xs text-red-500">
          {form.formState.errors[name]?.message as string}
        </p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
      {/* Sidebar Navigation */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full shrink-0 lg:w-64"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#161616]">My account</h2>
        </div>
        <nav className="space-y-1">
          {SIDEBAR_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href || "#"}
              className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                link.active
                  ? "bg-gray-100 text-[#161616]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-[#161616] " +
                    (link.disabled ? "cursor-not-allowed opacity-50" : "")
              }`}
              onClick={(e) => {
                if (link.disabled) e.preventDefault();
                if (link.scrollTo && !link.disabled) {
                  e.preventDefault();
                  document
                    .getElementById(link.scrollTo)
                    ?.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              {link.name}
            </a>
          ))}
        </nav>
        <div className="mt-8">
          <Button
            variant="outline"
            className="w-full justify-center rounded-full border-gray-300 py-6 text-base hover:border-red-200 hover:bg-gray-50 hover:text-red-600"
            onClick={handleLogout}
          >
            Log out
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 lg:p-10"
      >
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-[#161616]">My details</h3>
        </div>

        {/* Profile Avatar Section */}
        <div className="mb-10 flex items-center gap-6">
          <div className="relative h-24 w-24 overflow-hidden rounded-full ring-2 ring-gray-100">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-[#2f2582]">
                <User className="h-10 w-10" />
              </div>
            )}
          </div>
          <div>
            <h4 className="text-lg font-semibold text-[#161616]">
              {form.watch("full_name") || user.email?.split("@")[0]}
            </h4>
            <div className="mt-3 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-gray-300"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload new picture"}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
              {avatarUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full px-4 text-gray-500 hover:bg-red-50 hover:text-red-600"
                  onClick={handleDeleteAvatar}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Info */}
          <div className="grid gap-x-6 gap-y-6 md:grid-cols-2">
            <InputField
              label="Full Name"
              name="full_name"
              placeholder="Anastasia Grey"
            />
            {/* Read-only Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="relative">
                <input
                  value={user.email || ""}
                  disabled
                  type="email"
                  className="flex h-12 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 outline-none"
                />
              </div>
            </div>

            <InputField
              label="Phone number"
              name="phone"
              placeholder="(+44) 7911 123456"
            />

            {/* Password Placeholder - visual only */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  value="•••••••••"
                  disabled
                  type="password"
                  className="flex h-12 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div id="address-section" className="pt-6">
            <h4 className="mb-6 text-lg font-semibold text-[#161616]">
              Address Book
            </h4>
            <div className="grid gap-x-6 gap-y-6 md:grid-cols-2">
              <InputField
                label="Address Line 1"
                name="address_line1"
                placeholder="House No., Street Name"
                className="md:col-span-2"
              />
              <InputField
                label="Address Line 2 (Optional)"
                name="address_line2"
                placeholder="Apartment, Suite, etc."
                className="md:col-span-2"
              />
              <InputField label="City" name="city" placeholder="Mumbai" />
              <InputField
                label="State"
                name="state"
                placeholder="Maharashtra"
              />
              <InputField
                label="Postal Code"
                name="postal_code"
                placeholder="400001"
              />
              <InputField label="Country" name="country" placeholder="India" />
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-auto w-full rounded-full bg-[#2f2582] py-3.5 text-base font-medium text-white hover:bg-[#241c66] md:w-auto md:px-10"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save my details"
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
