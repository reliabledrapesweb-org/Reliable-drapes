"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader, CheckCircle } from "lucide-react";
import Link from "next/link";
import { forgotPasswordAction } from "@/lib/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    startTransition(async () => {
      const result = await forgotPasswordAction(email);

      if (!result.success) {
        setError(result.error || "Failed to send reset email");
        return;
      }

      setSubmittedEmail(email);
      setSuccess(true);
      setEmail("");
    });
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-16">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 mt-14 text-center text-3xl font-semibold text-gray-900 md:mt-16 lg:mt-[72px]">
          Reset Your Password
        </h1>
        <p className="mb-8 text-center text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password
        </p>

        {error && (
          <div className="mb-6 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Check your email</p>
                <p className="mt-1 text-sm text-green-700">
                  We&apos;ve sent a password reset link to <strong>{submittedEmail}</strong>. 
                  Click the link to create a new password.
                </p>
              </div>
            </div>
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
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
                className="w-full border-0 border-b border-gray-900 bg-transparent py-4 px-2 text-gray-500 placeholder-gray-300 focus:border-[#2f2581] focus:outline-none disabled:opacity-50"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 bg-gray-200 text-xs tracking-widest text-gray-600 uppercase font-medium transition-colors hover:bg-gray-300 disabled:opacity-50"
            >
              {isPending && <Loader className="h-4 w-4 animate-spin" />}
              Send Reset Link
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="mb-6 text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setSuccess(false)}
                className="font-semibold text-gray-900 hover:text-[#2f2581]"
              >
                try again
              </button>
              .
            </p>
          </div>
        )}

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
