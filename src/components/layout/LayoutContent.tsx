"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Header, Footer } from "@/components/layout";
import { CTASection, GlobalContactButton } from "@/components/shared";
import { CartDrawer } from "@/components/features/shop";
import { PhonePromptModal } from "@/components/features/auth/PhonePromptModal";
import { useAuthStore } from "@/lib/store";
import { getUserPhoneStatus } from "@/lib/actions/users";
import { getCustomAdSettings } from "@/lib/actions/site-settings";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [phonePrompt, setPhonePrompt] = useState<{
    show: boolean;
    canDismiss: boolean;
  }>({ show: false, canDismiss: true });
  const [customAd, setCustomAd] = useState<{
    enabled: boolean;
    imageUrl: string | null;
    linkUrl: string | null;
  }>({ enabled: false, imageUrl: null, linkUrl: null });
  const [showCustomAd, setShowCustomAd] = useState(false);

  useEffect(() => {
    if (!user) {
      setPhonePrompt({ show: false, canDismiss: true });
      return;
    }

    let cancelled = false;

    async function checkPhone() {
      const status = await getUserPhoneStatus();
      if (!cancelled && status.needsPhone) {
        setPhonePrompt({ show: true, canDismiss: status.canDismiss });
      }
    }

    checkPhone();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    async function fetchAd() {
      try {
        const result = await getCustomAdSettings();
        setCustomAd(result);
      } catch {
        // silently fail
      }
    }
    fetchAd();
  }, []);

  const isHomepage = pathname === "/";

  useEffect(() => {
    if (!isHomepage || !customAd.enabled || !customAd.imageUrl) {
      setShowCustomAd(false);
      return;
    }
    const timer = setTimeout(() => setShowCustomAd(true), 5000);
    return () => clearTimeout(timer);
  }, [isHomepage, customAd.enabled, customAd.imageUrl]);

  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {children}
      <CTASection enableVideoBackground />
      <Footer />
      <GlobalContactButton />
      <CartDrawer />
      <PhonePromptModal
        isOpen={phonePrompt.show}
        canDismiss={phonePrompt.canDismiss}
        onClose={() => setPhonePrompt({ show: false, canDismiss: true })}
        onSaved={() => setPhonePrompt({ show: false, canDismiss: true })}
      />

      {showCustomAd && customAd.imageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl">
            <button
              onClick={() => setShowCustomAd(false)}
              className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg transition-colors hover:bg-gray-100"
              aria-label="Close advertisement"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {customAd.linkUrl ? (
              <a
                href={customAd.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl overflow-hidden shadow-2xl"
              >
                <Image
                  src={customAd.imageUrl}
                  alt="Advertisement"
                  width={800}
                  height={1000}
                  className="h-auto w-full object-contain"
                  style={{ maxHeight: "85vh" }}
                  unoptimized
                />
              </a>
            ) : (
              <div className="rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={customAd.imageUrl}
                  alt="Advertisement"
                  width={800}
                  height={1000}
                  className="h-auto w-full object-contain"
                  style={{ maxHeight: "85vh" }}
                  unoptimized
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
