"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

    // Handle different page routes
    if (pathname.startsWith("/shop")) {
      const pathSegments = pathname.split("/").filter(Boolean);

      if (pathSegments.length === 1) {
        // /shop
        items.push({ label: "Shop" });
      } else if (pathSegments.length === 2) {
        // /shop/[id]
        items.push({ label: "Shop", href: "/shop" });
        items.push({ label: "Product Details" });
      }
    } else if (pathname === "/e-catalogue") {
      items.push({ label: "E-catalogue" });
    } else if (pathname === "/exhibitions-events") {
      items.push({ label: "Exhibitions & Moments" });
    } else if (pathname === "/store-locator") {
      items.push({ label: "Store Locator" });
    } else if (pathname === "/style-expert") {
      items.push({ label: "Style Expert" });
    } else if (pathname === "/careers") {
      items.push({ label: "Careers" });
    } else if (pathname === "/wishlist") {
      items.push({ label: "Wishlist" });
    } else if (pathname === "/cart") {
      items.push({ label: "Shopping Cart" });
    } else if (pathname.startsWith("/admin")) {
      items.push({ label: "Admin Dashboard", href: "/admin" });

      if (pathname.includes("/catalogues")) {
        items.push({ label: "Catalogues" });
      } else if (pathname.includes("/customers")) {
        items.push({ label: "Customers" });
      } else if (pathname.includes("/stores")) {
        items.push({ label: "Stores" });
      } else if (pathname.includes("/careers")) {
        items.push({ label: "Careers Management" });
      }
    }

    return items;
  }, [pathname]);

  return (
    <div className="w-full bg-gray-100 py-2 sm:py-3">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm"
        >
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-gray-600 transition-all duration-300 hover:text-[#2f2582] hover:underline"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-[#2f2582]">
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </motion.nav>
      </div>
    </div>
  );
}
