"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Mail,
  Briefcase,
  Image as ImageIcon,
  Settings,
  ChevronDown,
  X,
  BookOpen,
  MapPin,
  Bell,
  CalendarDays,
  TicketPercent,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { name: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
    children: [
      { name: "All Products", href: "/admin/products" },
      { name: "Categories", href: "/admin/categories" },
    ],
  },
  {
    name: "Catalogues",
    href: "/admin/catalogues",
    icon: BookOpen,
  },
  {
    name: "Exhibitions",
    href: "/admin/exhibitions",
    icon: CalendarDays,
  },
  {
    name: "Coupons",
    href: "/admin/coupons",
    icon: TicketPercent,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    name: "Communications",
    href: "/admin/communications",
    icon: Mail,
    children: [
      { name: "Contact", href: "/admin/communications/contact" },
      { name: "Consultations", href: "/admin/communications/consultations" },
      { name: "Newsletter", href: "/admin/communications/newsletter" },
    ],
  },
  {
    name: "Careers",
    href: "/admin/careers",
    icon: Briefcase,
    children: [
      { name: "Job Listings", href: "/admin/careers" },
      { name: "Applications", href: "/admin/careers/applications" },
    ],
  },
  {
    name: "Stores",
    href: "/admin/stores",
    icon: MapPin,
  },
  {
    name: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    name: "Media",
    href: "/admin/media",
    icon: ImageIcon,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

import { useAdminPreferencesStore, ACCENT_COLORS } from "@/lib/store";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  compact?: boolean;
}

export function AdminSidebar({
  isOpen,
  onClose,
  compact = false,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Products"]);
  const { accentColor } = useAdminPreferencesStore();

  const accent = ACCENT_COLORS[accentColor];

  const toggleExpand = (name: string) => {
    if (compact) return; // Disable expansion in compact mode
    setExpandedItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name],
    );
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const getActiveStyle = (active: boolean) => {
    if (active) {
      return {
        backgroundColor: accent.primary,
        color: "white",
      };
    }
    return {};
  };

  const activeClass = `text-white`;
  const inactiveClass = `text-gray-300 hover:bg-white/5 hover:text-white`;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-[#1a1a1a] text-white transition-all duration-300 lg:relative lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${compact ? "w-[80px]" : "w-[280px]"}`}
      >
        {/* Header */}
        <div
          className={`flex items-center border-b border-white/10 ${compact ? "h-16 justify-center px-0 lg:h-20" : "h-16 justify-between px-6 lg:h-20"}`}
        >
          <Link
            href="/admin"
            className={`flex items-center gap-3 ${compact ? "justify-center" : ""}`}
          >
            {compact ? (
              <div className="relative h-8 w-8">
                <Image
                  src="/images/logo-icon.png" // Assuming you have an icon version or fallback to full logo cropped
                  alt="RD"
                  fill
                  className="object-contain"
                  onError={(e) => {
                    // Fallback if icon doesn't exist, just show first letter or generic icon
                    e.currentTarget.style.display = "none";
                  }}
                />
                {/* Fallback if no icon image */}
                <div className="flex h-8 w-8 items-center justify-center rounded bg-white text-xs font-bold text-[#1a1a1a]">
                  RD
                </div>
              </div>
            ) : (
              <Image
                src="/images/logo.png"
                alt="Reliable Drapes"
                width={120}
                height={40}
                className="object-contain"
              />
            )}
          </Link>
          {!compact && (
            <button onClick={onClose} className="lg:hidden">
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav
          className={`h-[calc(100vh-4rem)] overflow-y-auto py-6 lg:h-[calc(100vh-5rem)] ${compact ? "px-2" : "px-4"}`}
        >
          <div className="space-y-1">
            {navItems.map((item) => (
              <div key={item.name} className="group relative">
                {/* Parent Item */}
                <div>
                  {item.children && !compact ? (
                    <button
                      onClick={() => toggleExpand(item.name)}
                      className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                        isActive(item.href) ? activeClass : inactiveClass
                      }`}
                      style={isActive(item.href) ? getActiveStyle(true) : {}}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </div>
                      <motion.div
                        animate={{
                          rotate: expandedItems.includes(item.name) ? 180 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.div>
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-lg py-3 text-sm font-medium transition-colors ${
                        compact ? "justify-center px-0" : "px-4"
                      } ${isActive(item.href) ? activeClass : inactiveClass}`}
                      style={isActive(item.href) ? getActiveStyle(true) : {}}
                      title={compact ? item.name : undefined}
                    >
                      <item.icon className="h-5 w-5" />
                      {!compact && <span>{item.name}</span>}
                    </Link>
                  )}
                </div>

                {/* Compact Hover Tooltip / Submenu (Simplified for prototype) */}
                {compact && (
                  <div className="absolute top-0 left-full z-50 ml-2 hidden w-48 rounded-lg bg-[#2a2a2a] p-2 shadow-xl group-hover:block">
                    <p className="mb-2 px-2 text-xs font-semibold text-gray-400">
                      {item.name}
                    </p>
                    {item.children?.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block rounded px-2 py-1.5 text-sm ${
                          pathname === child.href
                            ? "bg-white/10 text-white"
                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Children Items (Expanded Mode) */}
                {item.children &&
                  expandedItems.includes(item.name) &&
                  !compact && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-1 ml-4 space-y-1 overflow-hidden border-l-2 border-white/10 pl-4"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onClose}
                          className={`block rounded-lg px-4 py-2 text-sm transition-colors ${
                            pathname === child.href
                              ? "font-medium"
                              : "text-gray-400 hover:bg-white/5 hover:text-white"
                          }`}
                          style={
                            pathname === child.href
                              ? {
                                  color: accent.primary,
                                  backgroundColor: `${accent.primary}20`,
                                }
                              : {}
                          }
                        >
                          {child.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
              </div>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}
