"use client";

import { usePathname } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { CTASection, GlobalContactButton } from "@/components/shared";
import { CartDrawer } from "@/components/features/shop";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if current route is admin route
  const isAdminRoute = pathname?.startsWith("/admin");

  // For admin routes, render children directly without Header/Footer/CTA
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // For all other routes, render with Header/Footer/CTA
  return (
    <div className="min-h-screen bg-white">
      <Header />
      {children}
      <CTASection enableVideoBackground />
      <Footer />
      <GlobalContactButton />
      <CartDrawer />
    </div>
  );
}
