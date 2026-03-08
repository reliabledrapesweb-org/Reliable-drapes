"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { CTASection, GlobalContactButton } from "@/components/shared";
import { CartDrawer } from "@/components/features/shop";
import { PhonePromptModal } from "@/components/features/auth/PhonePromptModal";
import { useAuthStore } from "@/lib/store";
import { getUserPhoneStatus } from "@/lib/actions/users";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [phonePrompt, setPhonePrompt] = useState<{
    show: boolean;
    canDismiss: boolean;
  }>({ show: false, canDismiss: true });

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
    </div>
  );
}
