"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import {
  DEALER_CONFIG,
  type DealerSession,
  type B2BMessage,
} from "@/lib/constants/dealer";

export function TraderLoginClient() {
  const router = useRouter();
  const { setDealerSession, dealerSession } = useAuthStore();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const message = event.data as B2BMessage;

      if (!message?.type) return;

      // In production, validate origin here
      // const allowedOrigins = [DEALER_CONFIG.portalUrl];
      // if (!allowedOrigins.includes(event.origin)) return;

      switch (message.type) {
        case "B2B_LOGIN_SUCCESS": {
          if (message.payload) {
            const session: DealerSession = {
              isAuthenticated: true,
              userId: message.payload.userId || "",
              email: message.payload.email || "",
              companyName: message.payload.companyName,
              token: message.payload.token,
              loginTime: new Date().toISOString(),
            };
            setDealerSession(session);
            // Also store in localStorage for cross-tab sync
            localStorage.setItem(
              DEALER_CONFIG.localStorageKey,
              JSON.stringify(session),
            );
            router.push("/shop");
          }
          break;
        }
        case "B2B_LOGIN_FAILURE": {
          setError(message.payload?.message || "Login failed");
          break;
        }
        case "B2B_LOGOUT": {
          setDealerSession(null);
          localStorage.removeItem(DEALER_CONFIG.localStorageKey);
          break;
        }
      }
    },
    [setDealerSession, router],
  );

  // Check for existing session on mount
  useEffect(() => {
    const stored = localStorage.getItem(DEALER_CONFIG.localStorageKey);
    if (stored && !dealerSession?.isAuthenticated) {
      try {
        const session = JSON.parse(stored) as DealerSession;
        if (session.isAuthenticated) {
          setDealerSession(session);
        }
      } catch {
        localStorage.removeItem(DEALER_CONFIG.localStorageKey);
      }
    }
  }, [setDealerSession, dealerSession?.isAuthenticated]);

  // Set up message listener
  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  // Poll localStorage for changes (fallback for cross-origin iframes)
  useEffect(() => {
    const interval = setInterval(() => {
      const stored = localStorage.getItem(DEALER_CONFIG.localStorageKey);
      if (stored) {
        try {
          const session = JSON.parse(stored) as DealerSession;
          if (
            session.isAuthenticated &&
            session.userId !== dealerSession?.userId
          ) {
            setDealerSession(session);
          }
        } catch {
          // Invalid data, ignore
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [setDealerSession, dealerSession?.userId]);

  // If already logged in as dealer, redirect to shop
  if (dealerSession?.isAuthenticated) {
    router.push("/shop");
    return null;
  }

  // If not configured, show coming soon
  if (!DEALER_CONFIG.isConfigured) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#f8f8f8] to-white px-4 pt-14 md:pt-16 lg:pt-[72px]">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#2f2582]/10">
            <Building2 className="h-10 w-10 text-[#2f2582]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            B2B Dealer Portal
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-gray-500">
            Our dealer portal is coming soon. Please contact us for wholesale
            pricing and dealer accounts.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#2f2582] px-6 text-sm font-medium text-white transition-colors hover:bg-[#241c66]"
            >
              Contact Us
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-gray-300 px-6 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            B2B Dealer Portal
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading State */}
        {!iframeLoaded && (
          <div className="flex h-[600px] items-center justify-center rounded-xl bg-gray-100">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-[#2f2582]" />
              <p className="text-gray-600">Loading dealer portal...</p>
            </div>
          </div>
        )}

        {/* Iframe */}
        <iframe
          src={DEALER_CONFIG.portalUrl}
          title={DEALER_CONFIG.iframeTitle}
          className={`w-full rounded-xl border border-gray-200 shadow-lg ${
            iframeLoaded ? "h-[600px]" : "hidden"
          }`}
          onLoad={() => setIframeLoaded(true)}
          allow="clipboard-write; clipboard-read"
        />
      </div>
    </div>
  );
}
