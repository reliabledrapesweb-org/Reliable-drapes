"use client";

import { Eye, EyeOff, Loader } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { loginAction, signupAction } from "@/lib/actions/auth";
import { useAuthStore } from "@/lib/store";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { supabaseClient } from "@/lib/supabase/client";

export interface AuthFormProps {
  mode: "login" | "signup";
  title?: string;
  subtitle?: string;
}

export function AuthForm({ mode = "login", title, subtitle }: AuthFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const { setUser, setSession, setLoading, setError: setStoreError } = useAuthStore();

  const isLogin = mode === "login";
  const defaultTitle = isLogin ? "Log into Reliable" : "Create Account";
  const defaultSubtitle = isLogin
    ? "Welcome back"
    : "Join us to get started";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email || !password) {
      addToast("Please fill in all required fields", "warning");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }

    if (!isLogin && (!fullName || fullName.trim().length === 0)) {
      addToast("Full name is required", "warning");
      return;
    }

    startTransition(async () => {
      setStoreError(null);
      setLoading(true);

      try {
        if (isLogin) {
          // LOGIN: Use client-side Supabase for session persistence
          const { data: authData, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            addToast("Login failed", "error");
            setStoreError(error.message);
            setLoading(false);
            return;
          }

          // Update store on successful login
          if (authData.user) {
            setUser({
              id: authData.user.id,
              email: authData.user.email || '',
              full_name: (authData.user.user_metadata?.full_name as string) || undefined,
            });
          }
          if (authData.session) {
            setSession({
              access_token: authData.session.access_token,
              refresh_token: authData.session.refresh_token || '',
              expires_at: authData.session.expires_at,
              user: authData.user ? {
                id: authData.user.id,
                email: authData.user.email || '',
                full_name: (authData.user.user_metadata?.full_name as string) || undefined,
              } : {
                id: '',
                email: '',
              },
            });
          }
          setLoading(false);
          addToast("Logged in successfully!", "success");
          router.push("/");
        } else {
          // SIGNUP: Use server action (no session persistence needed)
          const formData = {
            email,
            password,
            full_name: fullName,
          };

          const result = await signupAction(formData);

          if (!result.success) {
            addToast(result.error || "Signup failed", "error");
            setStoreError(result.error || null);
            setLoading(false);
            return;
          }

          // Update store on successful signup
          if (result.user) {
            setUser(result.user);
          }
          
          // Auto-login to persist session
          const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
          });

          if (loginError) {
             console.error("Auto-login failed:", loginError);
             // We still consider signup successful, just need to login manually
             addToast("Account created! Please log in.", "success");
          } else if (loginData.session) {
             setSession({
              access_token: loginData.session.access_token,
              refresh_token: loginData.session.refresh_token || '',
              expires_at: loginData.session.expires_at,
              user: loginData.user ? {
                id: loginData.user.id,
                email: loginData.user.email || '',
                full_name: (loginData.user.user_metadata?.full_name as string) || undefined,
              } : {
                id: '',
                email: '',
              },
            });
            addToast("Account created successfully!", "success");
            router.push("/");
          } else {
             // Fallback if no session returned (unlikely with auto confirm)
             addToast("Account created! Please log in.", "success");
             router.push("/login");
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth error:", error);
        addToast("Authentication failed", "error");
        setLoading(false);
      }
    });
  };

  const handleGoogleLogin = async () => {
    setStoreError(null);
    setIsGoogleLoading(true);

    try {
      // Call Supabase OAuth directly from client
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        addToast(error.message || "Failed to initiate Google sign-in", "error");
        setStoreError(error.message);
        setIsGoogleLoading(false);
        return;
      }

      // OAuth redirect happens automatically, no need to manually redirect
      // Don't reset loading state - page will redirect
    } catch (error) {
      console.error("Google OAuth error:", error);
      addToast("Failed to initiate Google sign-in", "error");
      setIsGoogleLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setStoreError(null);
    setIsAppleLoading(true);

    try {
      // Call Supabase OAuth directly from client
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        addToast(error.message || "Failed to initiate Apple sign-in", "error");
        setStoreError(error.message);
        setIsAppleLoading(false);
        return;
      }

      // OAuth redirect happens automatically, no need to manually redirect
      // Don't reset loading state - page will redirect
    } catch (error) {
      console.error("Apple OAuth error:", error);
      addToast("Failed to initiate Apple sign-in", "error");
      setIsAppleLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-16">
      <motion.div
        className="mx-auto max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.h1
          className="mb-6 mt-14 text-center text-3xl font-semibold text-gray-900 md:mt-16 lg:mt-[72px]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        >
          {title || defaultTitle}
        </motion.h1>
        {subtitle && (
          <motion.p
            className="mb-8 text-center text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            {subtitle}
          </motion.p>
        )}



        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <div className="relative flex flex-col gap-8 lg:flex-row lg:gap-20">
            {/* Form Fields */}
            <motion.div
              className="w-full lg:w-1/2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            >
              {/* Full Name (Signup Only) */}
              {!isLogin && (
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                >
                  <label
                    htmlFor="full_name"
                    className="mb-3 block text-xs tracking-widest text-gray-600 uppercase"
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
                    className="w-full border-0 border-b border-gray-900 bg-transparent py-3 px-2 text-gray-500 placeholder-gray-300 focus:border-[#2f2581] focus:outline-none disabled:opacity-50"
                    required={!isLogin}
                  />
                </motion.div>
              )}

              {/* Email */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <label
                  htmlFor="email"
                  className="mb-3 block text-xs tracking-widest text-gray-600 uppercase"
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
                  className="w-full border-0 border-b border-gray-900 bg-transparent py-3 px-2 text-gray-500 placeholder-gray-300 focus:border-[#2f2581] focus:outline-none disabled:opacity-50"
                  required
                />
              </motion.div>

              {/* Password */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
              >
                <label
                  htmlFor="password"
                  className="mb-3 block text-xs tracking-widest text-gray-600 uppercase"
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
                    className="w-full border-0 border-b border-gray-300 bg-transparent py-3 px-2 text-gray-500 placeholder-gray-300 focus:border-[#2f2581] focus:outline-none disabled:opacity-50"
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
              </motion.div>

              {/* Confirm Password (Signup Only) */}
              {!isLogin && (
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <label
                    htmlFor="confirm_password"
                    className="mb-3 block text-xs tracking-widest text-gray-600 uppercase"
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
                      className="w-full border-0 border-b border-gray-300 bg-transparent py-3 px-2 text-gray-500 placeholder-gray-300 focus:border-[#2f2581] focus:outline-none disabled:opacity-50"
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
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isPending}
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 bg-gray-200 text-xs tracking-widest text-gray-600 uppercase font-medium transition-colors hover:bg-gray-300 disabled:opacity-50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isPending && <Loader className="h-4 w-4 animate-spin" />}
                {isLogin ? "Log In" : "Create Account"}
              </motion.button>

              {/* Additional Links */}
              {isLogin && (
                <motion.div
                  className="mt-4 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Link
                    href="/forgot-password"
                    className="text-xs tracking-widest text-gray-600 uppercase hover:text-[#2f2581] transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </motion.div>
              )}
            </motion.div>

            {/* Divider */}
            <motion.div
              className="absolute top-0 left-1/2 hidden h-full -translate-x-1/2 flex-col items-center lg:flex"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              style={{ originY: 0 }}
            >
              <div className="w-px flex-1 bg-gray-300" />
              <p className="my-8 text-xs tracking-widest text-gray-600 uppercase font-medium">
                or
              </p>
              <div className="w-px flex-1 bg-gray-300" />
            </motion.div>

            {/* OAuth Buttons */}
            <motion.div
              className="flex w-full flex-col justify-center gap-4 lg:w-1/2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            >
              <motion.button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isPending}
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 border-2 border-gray-900 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  default: { duration: 0.5, delay: 0.4 },
                  scale: { duration: 0.3 },
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isGoogleLoading && (
                  <Loader className="h-5 w-5 animate-spin mr-2" />
                )}
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
              </motion.button>

              <motion.button
                type="button"
                onClick={handleAppleLogin}
                disabled={isAppleLoading || isPending}
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 border-2 border-gray-900 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  default: { duration: 0.5, delay: 0.45 },
                  scale: { duration: 0.3 },
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isAppleLoading && (
                  <Loader className="h-5 w-5 animate-spin mr-2" />
                )} 
                <svg className="h-5 w-4" viewBox="0 0 16 20" fill="none">
                  <path
                    d="M15.665 15.586c-.276.677-.618 1.325-1.022 1.934-.537.806-.976 1.364-1.315 1.674-.525.509-1.088.769-1.69.784-.434 0-.955-.13-1.563-.393-.609-.262-1.169-.391-1.681-.391-.537 0-1.113.13-1.729.391-.617.263-1.114.4-1.494.413-.578.026-1.154-.242-1.729-.805-.367-.337-.826-.915-1.376-1.733C.476 16.587-.009 15.573-.389 14.417c-.407-1.247-.611-2.456-.611-3.626 0-1.34.275-2.497.826-3.465a5.083 5.083 0 0 1 1.73-1.843A4.68 4.68 0 0 1 4.895 4.788c.459 0 1.061.15 1.809.443.745.295 1.224.445 1.434.445.157 0 .689-.175 1.591-.524.853-.323 1.573-.457 2.163-.404 1.598.136 2.798.8 3.597 1.994-1.43.912-2.136 2.19-2.122 3.827.013 1.277.452 2.339 1.316 3.182.392.391.83.694 1.316.906-.105.323-.217.631-.335.927v-.001zM12 .401c0 1-.348 1.934-1.039 2.798-.835 1.028-1.845 1.622-2.94 1.528a3.023 3.023 0 0 1-.022-.38c0-.96.396-1.987 1.101-2.827A4.26 4.26 0 0 1 10.443.459C10.986.18 11.498.027 11.98 0c.013.134.02.268.02.4z"
                    fill="#0E0E0E"
                  />
                </svg>
                <span className="text-gray-900">Continue with Apple</span>
              </motion.button>
            </motion.div>
          </div>
        </motion.form>

        {/* Footer Links */}
        {isLogin ? (
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-gray-900 hover:text-[#2f2581] transition-colors"
              >
                Sign up
              </Link>
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-gray-900 hover:text-[#2f2581] transition-colors"
              >
                Log in
              </Link>
            </p>
          </motion.div>
        )}

        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          <p className="text-xs text-gray-600">
            Secure Login with reCAPTCHA subject to Google
          </p>
          <div className="mt-2 flex items-center justify-center gap-1">
            <Link
              href="/terms-of-service"
              className="text-xs text-gray-600 hover:text-[#2f2581] transition-colors"
            >
              Terms
            </Link>
            <span className="text-xs text-gray-600">&</span>
            <Link
              href="/privacy-policy"
              className="text-xs text-gray-600 hover:text-[#2f2581] transition-colors"
            >
              Privacy
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </section>
  );
}