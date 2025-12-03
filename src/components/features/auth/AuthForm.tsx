"use client";

import { Eye, EyeOff, AlertCircle, Loader } from "lucide-react";
import { useState, useTransition } from "react";
import Link from "next/link";
import { loginAction, signupAction } from "@/lib/actions/auth";
import { useAuthStore } from "@/lib/store";

export interface AuthFormProps {
  mode: "login" | "signup";
  title?: string;
  subtitle?: string;
}

export function AuthForm({ mode = "login", title, subtitle }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { setUser, setSession, setLoading, setError: setStoreError } = useAuthStore();

  const isLogin = mode === "login";
  const defaultTitle = isLogin ? "Log into Reliable" : "Create Account";
  const defaultSubtitle = isLogin
    ? "Welcome back"
    : "Join us to get started";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email || !password) {
      setError("Please fill in all required fields");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!isLogin && (!fullName || fullName.trim().length === 0)) {
      setError("Full name is required");
      return;
    }

    startTransition(async () => {
      setStoreError(null);
      setLoading(true);

      const formData = {
        email,
        password,
        ...(mode === "signup" && { full_name: fullName }),
      };

      const action = isLogin ? loginAction : signupAction;
      const result = await action(formData);

      if (!result.success) {
        setError(result.error || "Authentication failed");
        setStoreError(result.error || null);
        setLoading(false);
        return;
      }

      // Update store on successful auth
      if (result.user) {
        setUser(result.user);
      }
      if (result.session) {
        setSession(result.session);
      }
      setLoading(false);

      // Redirect on success
      if (isLogin) {
        window.location.href = "/";
      } else {
        window.location.href = "/login?signup=success";
      }
    });
  };

  const handleGoogleLogin = async () => {
    startTransition(async () => {
      setStoreError(null);
      setLoading(true);

      // TODO: Implement OAuth with Supabase
      console.log("Google OAuth not yet configured");
      setLoading(false);
    });
  };

  const handleAppleLogin = async () => {
    startTransition(async () => {
      setStoreError(null);
      setLoading(true);

      // TODO: Implement OAuth with Supabase
      console.log("Apple OAuth not yet configured");
      setLoading(false);
    });
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-8 md:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-center text-2xl text-gray-900">
          {title || defaultTitle}
        </h1>
        {subtitle && (
          <p className="mb-16 text-center text-sm text-gray-500">{subtitle}</p>
        )}

        {error && (
          <div className="mb-6 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="relative flex flex-col gap-8 lg:flex-row lg:gap-16">
            {/* Form Fields */}
            <div className="w-full lg:w-1/2">
              {/* Full Name (Signup Only) */}
              {!isLogin && (
                <div className="mb-6">
                  <label
                    htmlFor="full_name"
                    className="mb-2 block text-xs tracking-wider text-gray-500 uppercase"
                  >
                    Full Name
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isPending}
                    className="w-full border-0 border-b border-gray-900 bg-transparent py-4 px-2 text-gray-500 placeholder-gray-300 focus:border-[#2f2581] focus:outline-none disabled:opacity-50"
                    required={!isLogin}
                  />
                </div>
              )}

              {/* Email */}
              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs tracking-wider text-gray-500 uppercase"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                  className="w-full border-0 border-b border-gray-900 bg-transparent py-4 px-2 text-gray-500 placeholder-gray-300 focus:border-[#2f2581] focus:outline-none disabled:opacity-50"
                  required
                />
              </div>

              {/* Password */}
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs tracking-wider text-gray-500 uppercase"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isPending}
                    className="w-full border-0 border-b border-gray-300 bg-transparent py-4 px-2 text-gray-500 placeholder-gray-300 focus:border-[#2f2581] focus:outline-none disabled:opacity-50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isPending}
                    aria-label="Toggle password visibility"
                    className="absolute top-1/2 right-0 -translate-y-1/2 cursor-pointer disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-900" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-900" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Signup Only) */}
              {!isLogin && (
                <div className="mb-8">
                  <label
                    htmlFor="confirm_password"
                    className="mb-2 block text-xs tracking-wider text-gray-500 uppercase"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isPending}
                      className="w-full border-0 border-b border-gray-300 bg-transparent py-4 px-2 text-gray-500 placeholder-gray-300 focus:border-[#2f2581] focus:outline-none disabled:opacity-50"
                      required={!isLogin}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isPending}
                      aria-label="Toggle confirm password visibility"
                      className="absolute top-1/2 right-0 -translate-y-1/2 cursor-pointer disabled:opacity-50"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-900" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-900" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 bg-gray-200 text-xs tracking-wider text-gray-500 uppercase transition-colors hover:bg-gray-300 disabled:opacity-50"
              >
                {isPending && <Loader className="h-4 w-4 animate-spin" />}
                {isLogin ? "Log In" : "Create Account"}
              </button>

              {/* Additional Links */}
              {isLogin && (
                <div className="mt-3">
                  <Link
                    href="/forgot-password"
                    className="text-xs tracking-wider text-gray-500 uppercase hover:text-[#2f2581]"
                  >
                    Forgot Password?
                  </Link>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="absolute top-1/2 left-1/2 hidden h-56 -translate-x-1/2 -translate-y-1/2 flex-col items-center lg:flex">
              <div className="w-px flex-1 bg-gray-300" />
              <p className="my-6 text-xs tracking-wider text-gray-500 uppercase">
                or
              </p>
              <div className="w-px flex-1 bg-gray-300" />
            </div>

            {/* OAuth Buttons */}
            <div className="flex w-full flex-col justify-center gap-3 lg:w-1/2">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isPending}
                className="flex h-14 w-full cursor-pointer items-center justify-center gap-3 border-2 border-gray-900 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 18 18" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                    fill="#4285F4"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                    fill="#34A853"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                    fill="#FBBC05"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-gray-900">Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={handleAppleLogin}
                disabled={isPending}
                className="flex h-14 w-full cursor-pointer items-center justify-center gap-3 border-2 border-gray-900 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <svg className="h-5 w-4" viewBox="0 0 16 20" fill="none">
                  <path
                    d="M15.665 15.586c-.276.677-.618 1.325-1.022 1.934-.537.806-.976 1.364-1.315 1.674-.525.509-1.088.769-1.69.784-.434 0-.955-.13-1.563-.393-.609-.262-1.169-.391-1.681-.391-.537 0-1.113.13-1.729.391-.617.263-1.114.4-1.494.413-.578.026-1.154-.242-1.729-.805-.367-.337-.826-.915-1.376-1.733C.476 16.587-.009 15.573-.389 14.417c-.407-1.247-.611-2.456-.611-3.626 0-1.34.275-2.497.826-3.465a5.083 5.083 0 0 1 1.73-1.843A4.68 4.68 0 0 1 4.895 4.788c.459 0 1.061.15 1.809.443.745.295 1.224.445 1.434.445.157 0 .689-.175 1.591-.524.853-.323 1.573-.457 2.163-.404 1.598.136 2.798.8 3.597 1.994-1.43.912-2.136 2.19-2.122 3.827.013 1.277.452 2.339 1.316 3.182.392.391.83.694 1.316.906-.105.323-.217.631-.335.927v-.001zM12 .401c0 1-.348 1.934-1.039 2.798-.835 1.028-1.845 1.622-2.94 1.528a3.023 3.023 0 0 1-.022-.38c0-.96.396-1.987 1.101-2.827A4.26 4.26 0 0 1 10.443.459C10.986.18 11.498.027 11.98 0c.013.134.02.268.02.4z"
                    fill="#0E0E0E"
                  />
                </svg>
                <span className="text-gray-900">Continue with Apple</span>
              </button>
            </div>
          </div>
        </form>

        {/* Footer Links */}
        {isLogin ? (
          <>
            <div className="mt-16 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-gray-900 hover:text-[#2f2581]"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="mt-16 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-gray-900 hover:text-[#2f2581]"
                >
                  Log in
                </Link>
              </p>
            </div>
          </>
        )}

        <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                Secure authentication powered by Supabase
              </p>
              <div className="mt-3 flex items-center justify-center gap-1">
                <Link
                  href="/terms-of-service"
                  className="text-xs text-gray-500 hover:text-[#2f2581]"
                >
                  Terms
                </Link>
                <span className="text-xs text-gray-500">&</span>
                <Link
                  href="/privacy-policy"
                  className="text-xs text-gray-500 hover:text-[#2f2581]"
                >
                  Privacy
                </Link>
              </div>
        </div>
      </div>
    </section>
  );
}
