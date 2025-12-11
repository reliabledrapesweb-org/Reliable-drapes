"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderOpen,
  Mail,
  Briefcase,
  Image as ImageIcon,
  Settings,
  ChevronDown,
  X,
  BookOpen,
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
      { name: "Add Product", href: "/admin/products/new" },
      { name: "Categories", href: "/admin/categories" },
    ],
  },
  {
    name: "Catalogues",
    href: "/admin/catalogues",
    icon: BookOpen,
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
    name: "Collections",
    href: "/admin/collections",
    icon: FolderOpen,
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
      { name: "Job Openings", href: "/admin/careers/jobs" },
      { name: "Applications", href: "/admin/careers/applications" },
    ],
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

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Products"]);

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

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
        className={`fixed left-0 top-0 z-50 h-screen w-[280px] bg-[#1a1a1a] text-white transition-transform lg:relative lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-6 lg:h-20">
          <Link href="/admin" className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Reliable Drapes"
              width={120}
              height={40}
              className="object-contain"
            />
          </Link>
          <button onClick={onClose} className="lg:hidden">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="h-[calc(100vh-4rem)] overflow-y-auto px-4 py-6 lg:h-[calc(100vh-5rem)]">
          <div className="space-y-1">
            {navItems.map((item) => (
              <div key={item.name}>
                {/* Parent Item */}
                <div>
                  {item.children ? (
                    <button
                      onClick={() => toggleExpand(item.name)}
                      className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "bg-[#2F2582] text-white"
                          : "text-gray-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedItems.includes(item.name) ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.div>
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "bg-[#2F2582] text-white"
                          : "text-gray-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </div>

                {/* Children Items */}
                {item.children && expandedItems.includes(item.name) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-4 mt-1 space-y-1 overflow-hidden border-l-2 border-white/10 pl-4"
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onClose}
                        className={`block rounded-lg px-4 py-2 text-sm transition-colors ${
                          pathname === child.href
                            ? "bg-[#2F2582]/20 text-[#2F2582] font-medium"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
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
