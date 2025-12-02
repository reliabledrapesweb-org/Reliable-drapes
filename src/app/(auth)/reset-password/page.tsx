"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, AlertCircle, Loader, CheckCircle } from "lucide-react";
import Link from "next/link";
import { resetPasswordAction } from "@/lib/actions/auth";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

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

    startTransition(async () => {
      const result = await resetPasswordAction(password);

      if (!result.success) {
        setError(result.error || "Failed to reset password");
        return;
      }

      setSuccess(true);
    });
  };

  if (success) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-8 md:py-24">
        <div className="mx-auto max-w-md text-center">
          <CheckCircle className="mx-auto mb-6 h-16 w-16 text-green-600" />
          <h1 className="mb-4 text-2xl text-gray-900">Password Reset Successful</h1>
          <p className="mb-8 text-gray-500">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <Link
            href="/auth/login"
            className="inline-block rounded bg-gray-200 px-6 py-3 text-sm tracking-wider text-gray-500 uppercase hover:bg-gray-300"
          >
            Go to Login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-8 md:py-24">
      <div className="mx-auto max-w-md">
        <h1 className="mb-4 text-center text-2xl text-gray-900">
          Create New Password
        </h1>
        <p className="mb-16 text-center text-sm text-gray-500">
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
              className="mb-2 block text-xs tracking-wider text-gray-500 uppercase"
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
                className="w-full border-0 border-b border-gray-900 bg-transparent py-4 px-2 text-gray-500 placeholder-gray-300 focus:border-[#2f2581] focus:outline-none disabled:opacity-50"
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
              className="mb-2 block text-xs tracking-wider text-gray-500 uppercase"
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
                className="w-full border-0 border-b border-gray-900 bg-transparent py-4 px-2 text-gray-500 placeholder-gray-300 focus:border-[#2f2581] focus:outline-none disabled:opacity-50"
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
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 bg-gray-200 text-xs tracking-wider text-gray-500 uppercase transition-colors hover:bg-gray-300 disabled:opacity-50"
          >
            {isPending && <Loader className="h-4 w-4 animate-spin" />}
            Reset Password
          </button>
        </form>

        <div className="mt-12 text-center">
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
