"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, AlertCircle, Loader, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  // Check if user has a valid recovery session.
  // Uses onAuthStateChange to detect sessions from hash fragments
  // (Supabase implicit flow puts tokens in #access_token=...).
  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setIsValidSession(!!session);
      } else if (event === "INITIAL_SESSION") {
        // Only mark invalid if there's truly no session after init
        if (!session) {
          // Delay slightly to allow hash fragment processing
          setTimeout(() => {
            supabaseClient.auth.getSession().then(({ data }) => {
              if (!data.session) setIsValidSession(false);
            });
          }, 1000);
        } else {
          setIsValidSession(true);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsPending(true);

    try {
      const { error: updateError } = await supabaseClient.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || "Failed to reset password");
        setIsPending(false);
        return;
      }

      // Sign out after password reset so user can log in fresh
      await supabaseClient.auth.signOut();
      setSuccess(true);
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  // Show loading while checking session
  if (isValidSession === null) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-16">
        <div className="mx-auto max-w-md text-center">
          <Loader className="mx-auto h-8 w-8 animate-spin text-gray-400" />
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </section>
    );
  }

  // Show error if no valid session
  if (isValidSession === false) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-16">
        <div className="mx-auto max-w-md text-center">
          <AlertCircle className="mx-auto mb-6 h-16 w-16 text-red-500" />
          <h1 className="mb-4 text-3xl font-semibold text-gray-900">
            Invalid or Expired Link
          </h1>
          <p className="mb-8 text-gray-500">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block rounded bg-gray-200 px-6 py-3 text-sm tracking-wider text-gray-600 uppercase hover:bg-gray-300"
          >
            Request New Link
          </Link>
        </div>
      </section>
    );
  }

  if (success) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-16">
        <div className="mx-auto max-w-md text-center">
          <CheckCircle className="mx-auto mb-6 h-16 w-16 text-green-600" />
          <h1 className="mb-4 text-3xl font-semibold text-gray-900">
            Password Reset Successful
          </h1>
          <p className="mb-8 text-gray-500">
            Your password has been reset successfully. You can now log in with
            your new password.
          </p>
          <Link
            href="/login"
            className="inline-block rounded bg-gray-200 px-6 py-3 text-sm tracking-wider text-gray-600 uppercase hover:bg-gray-300"
          >
            Go to Login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-16">
      <div className="mx-auto max-w-md">
        <h1 className="mt-8 mb-6 text-center text-3xl font-semibold text-gray-900 md:mt-14 lg:mt-16 xl:mt-[72px]">
          Create New Password
        </h1>
        <p className="mb-8 text-center text-sm text-gray-600">
          Enter a new password for your account
        </p>

        {error && (
          <div className="mb-6 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="mb-3 block text-xs tracking-widest text-gray-600 uppercase"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                className="w-full border-0 border-b border-gray-900 bg-transparent px-2 py-4 text-gray-500 placeholder-gray-300 focus:border-[#2f2581] focus:outline-none disabled:opacity-50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isPending}
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

          <div>
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
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isPending}
                className="w-full border-0 border-b border-gray-900 bg-transparent px-2 py-4 text-gray-500 placeholder-gray-300 focus:border-[#2f2581] focus:outline-none disabled:opacity-50"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isPending}
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

          <button
            type="submit"
            disabled={isPending}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 bg-gray-200 text-xs font-medium tracking-widest text-gray-600 uppercase transition-colors hover:bg-gray-300 disabled:opacity-50"
          >
            {isPending && <Loader className="h-4 w-4 animate-spin" />}
            Reset Password
          </button>
        </form>

        <div className="mt-10 text-center">
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-[#2f2581]"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </section>
  );
}
