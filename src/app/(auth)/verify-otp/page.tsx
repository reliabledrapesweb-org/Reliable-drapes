"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Loader, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabase/client";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { useAuthStore } from "@/lib/store";

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const OTP_LENGTH = 8;
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toasts, addToast, removeToast } = useToast();
  const { setUser, setSession } = useAuthStore();

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, OTP_LENGTH);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      if (i < OTP_LENGTH) newOtp[i] = char;
    });
    setOtp(newOtp);

    // Focus last filled input or the next empty one
    const lastIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
    inputRefs.current[lastIndex]?.focus();
  };


  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== OTP_LENGTH) {
      addToast(`Please enter the complete ${OTP_LENGTH}-digit code`, "warning");
      return;
    }

    setIsVerifying(true);

    try {
      const { data, error } = await supabaseClient.auth.verifyOtp({
        email,
        token: otpCode,
        type: "email",
      });

      if (error) {
        addToast(error.message || "Invalid verification code", "error");
        setIsVerifying(false);
        return;
      }

      if (data.user && data.session) {
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          full_name: (data.user.user_metadata?.full_name as string) || undefined,
        });
        setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token || "",
          expires_at: data.session.expires_at,
          user: {
            id: data.user.id,
            email: data.user.email || "",
            full_name: (data.user.user_metadata?.full_name as string) || undefined,
          },
        });

        addToast("Email verified successfully!", "success");
        router.push("/");
      }
    } catch (error) {

      addToast("Verification failed. Please try again.", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);

    try {
      const { error } = await supabaseClient.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        addToast(error.message || "Failed to resend code", "error");
      } else {
        addToast("Verification code sent!", "success");
        setResendCooldown(60); // 60 second cooldown
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch (error) {

      addToast("Failed to resend code", "error");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <p className="mb-4 text-gray-600">No email provided for verification.</p>
          <Link href="/signup" className="text-[#2f2581] hover:underline">
            Go back to signup
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link
          href="/signup"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to signup
        </Link>

        <h1 className="mb-2 text-3xl font-semibold text-gray-900">
          Verify your email
        </h1>
        <p className="mb-8 text-gray-600">
          We&apos;ve sent an {OTP_LENGTH}-digit verification code to{" "}
          <span className="font-medium text-gray-900">{email}</span>
        </p>

        {/* OTP Input */}
        <div className="mb-8 flex justify-center gap-2">
          {otp.map((digit, index) => (
            <motion.input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={isVerifying}
              className="h-12 w-10 rounded-lg border-2 border-gray-300 text-center text-xl font-semibold text-gray-900 transition-colors focus:border-[#2f2581] focus:outline-none disabled:opacity-50 sm:h-14 sm:w-12 sm:text-2xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
            />
          ))}
        </div>

        {/* Verify Button */}
        <motion.button
          onClick={handleVerify}
          disabled={isVerifying || otp.join("").length !== OTP_LENGTH}
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 bg-[#2f2581] text-white font-medium rounded-lg transition-colors hover:bg-[#25205f] disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isVerifying && <Loader className="h-5 w-5 animate-spin" />}
          {isVerifying ? "Verifying..." : "Verify Email"}
        </motion.button>

        {/* Resend Code */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Didn&apos;t receive the code?{" "}
            {resendCooldown > 0 ? (
              <span className="text-gray-400">
                Resend in {resendCooldown}s
              </span>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={isResending}
                className="font-medium text-[#2f2581] hover:underline disabled:opacity-50"
              >
                {isResending ? "Sending..." : "Resend code"}
              </button>
            )}
          </p>
        </div>

        {/* Help text */}
        <p className="mt-8 text-center text-xs text-gray-500">
          Check your spam folder if you don&apos;t see the email in your inbox.
        </p>
      </motion.div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </main>
  );
}
