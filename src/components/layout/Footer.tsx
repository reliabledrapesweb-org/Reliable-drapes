"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getCatalogueCategories } from "@/lib/actions/catalogue-categories";
import { getSocialLinks, getCompanyDetails } from "@/lib/actions/site-settings";
import {
  CONTACT_EMAIL,
  COMPANY_PHONE,
  COMPANY_ADDRESS,
} from "@/lib/constants/app";

// Fallback categories when no data from database
const fallbackCategories = [
  { id: "1", name: "Curtains" },
  { id: "2", name: "Upholstery" },
  { id: "3", name: "Sheers" },
  { id: "4", name: "Bed Linens" },
];

type SocialLinks = {
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  youtube: string | null;
  linkedin: string | null;
};

export function Footer() {
  const [categories, setCategories] =
    useState<Array<{ id: string; name: string }>>(fallbackCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    instagram: null,
    facebook: null,
    twitter: null,
    youtube: null,
    linkedin: null,
  });
  const [companyDetails, setCompanyDetails] = useState<{
    email: string | null;
    phone: string | null;
    address: string | null;
    tagline: string | null;
    headOfficeAddress: string | null;
    warehouseAddress: string | null;
    headOfficeMapLink: string | null;
    warehouseMapLink: string | null;
  }>({
    email: null,
    phone: null,
    address: null,
    tagline: null,
    headOfficeAddress: null,
    warehouseAddress: null,
    headOfficeMapLink: null,
    warehouseMapLink: null,
  });

  // Fetch footer categories and site settings from database
  useEffect(() => {
    async function fetchData() {
      try {
        const [categoriesResult, socialResult, companyResult] =
          await Promise.all([
            getCatalogueCategories(),
            getSocialLinks(),
            getCompanyDetails(),
          ]);

        if (
          categoriesResult.success &&
          categoriesResult.data &&
          categoriesResult.data.length > 0
        ) {
          setCategories(
            categoriesResult.data
              .filter((category) => category.is_active !== false)
              .slice(0, 4)
              .map((category) => ({
                id: category.id,
                name: category.name,
              })),
          );
        }

        setSocialLinks(socialResult);
        setCompanyDetails({
          email: companyResult.email?.trim() || CONTACT_EMAIL,
          phone: companyResult.phone?.trim() || COMPANY_PHONE,
          address: companyResult.address?.trim() || COMPANY_ADDRESS,
          tagline: companyResult.tagline?.trim() || null,
          headOfficeAddress: companyResult.headOfficeAddress?.trim() || null,
          warehouseAddress: companyResult.warehouseAddress?.trim() || null,
          headOfficeMapLink: companyResult.headOfficeMapLink?.trim() || null,
          warehouseMapLink: companyResult.warehouseMapLink?.trim() || null,
        });
      } catch {
        // Keep fallback values on error
      }
      setIsLoading(false);
    }

    fetchData();
  }, []);

  return (
    <footer className="bg-[#0e0e0e] text-white">
      <div className="container mx-auto px-6 py-10 md:py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="mb-10 grid grid-cols-1 gap-8 md:mb-12 md:grid-cols-2 md:gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Company Info */}
          <div className="space-y-4 md:col-span-2 lg:col-span-4">
            {/* Logo */}
            <motion.div
              className="flex cursor-pointer items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={100}
                height={100}
                className="object-contain md:w-[130px] lg:w-[140px]"
                priority
              />
            </motion.div>

            <p className="text-sm text-[#f1f1f1] md:text-base">
              A Unit of Shree Ambica Furnishings (India) Pvt. Ltd.
            </p>

            <p className="text-sm text-[#7e7e7e] md:text-base">
              Reliable Drapes provides B2B furnishing solutions for showrooms,
              designers, and project partners with scalable supply and
              catalogue-driven product selection.
            </p>

            {companyDetails.tagline && (
              <p className="text-sm text-gray-400">{companyDetails.tagline}</p>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-[#7e7e7e]" />
                <a
                  href={`mailto:${companyDetails.email}`}
                  className="text-sm text-[#7e7e7e] transition-colors hover:text-white md:text-base"
                >
                  {companyDetails.email}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-[#7e7e7e]" />
                <span className="text-sm text-[#7e7e7e] md:text-base">
                  {companyDetails.phone}
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {companyDetails.headOfficeAddress ||
              companyDetails.warehouseAddress ? (
                <div className="flex flex-col gap-5">
                  {companyDetails.headOfficeAddress && (
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#7e7e7e]" />
                      <div className="space-y-1">
                        <p className="font-semibold text-white">
                          Reliable Head Office
                        </p>
                        <p className="text-sm text-[#7e7e7e] md:text-base">
                          Shree Ambica Furnishings (INDIA) Pvt. Ltd.
                        </p>
                        <p className="text-sm text-[#7e7e7e] md:text-base">
                          {companyDetails.headOfficeAddress}
                        </p>
                        {companyDetails.headOfficeMapLink ? (
                          <a
                            href={companyDetails.headOfficeMapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-white underline transition-colors hover:text-gray-300"
                          >
                            View on Google Maps
                          </a>
                        ) : (
                          <p className="mt-1 text-sm text-[#7e7e7e]">
                            Location will share soon
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {companyDetails.warehouseAddress && (
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#7e7e7e]" />
                      <div className="space-y-1">
                        <p className="font-semibold text-white">
                          Warehouse Dispatch & Experience Centre
                        </p>
                        <p className="text-sm text-[#7e7e7e] md:text-base">
                          Shree Ambica Furnishings (INDIA) Pvt. Ltd.
                        </p>
                        <p className="text-sm text-[#7e7e7e] md:text-base">
                          {companyDetails.warehouseAddress}
                        </p>
                        {companyDetails.warehouseMapLink ? (
                          <a
                            href={companyDetails.warehouseMapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-white underline transition-colors hover:text-gray-300"
                          >
                            View on Google Maps
                          </a>
                        ) : (
                          <p className="mt-1 text-sm text-[#7e7e7e]">
                            Location will share soon
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-[#7e7e7e]" />
                  <div className="space-y-1 text-sm text-[#7e7e7e] md:text-base">
                    <p className="font-medium text-[#f1f1f1]">Address</p>
                    <p>{companyDetails.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* E-Catalogue Links */}
          <div className="space-y-4 lg:col-span-2">
            <h3 className="text-sm tracking-widest uppercase md:text-base">
              E-Catalogues
            </h3>
            <ul className="space-y-3 text-sm text-[#7e7e7e] md:text-base">
              <li>
                <motion.a
                  href="/e-catalogue"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  All Products
                </motion.a>
              </li>
              {isLoading ? (
                <>
                  <li className="h-5 w-20 animate-pulse rounded bg-gray-700" />
                  <li className="h-5 w-24 animate-pulse rounded bg-gray-700" />
                  <li className="h-5 w-16 animate-pulse rounded bg-gray-700" />
                  <li className="h-5 w-20 animate-pulse rounded bg-gray-700" />
                </>
              ) : (
                categories.map((category) => (
                  <li key={category.id}>
                    <motion.a
                      href={`/e-catalogue?category=${encodeURIComponent(category.name)}`}
                      className="cursor-pointer"
                      whileHover={{ color: "#ffffff", x: 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      {category.name}
                    </motion.a>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Customer Care Links */}
          <div className="space-y-4 lg:col-span-2">
            <h3 className="text-sm tracking-widest uppercase md:text-base">
              Customer Care
            </h3>
            <ul className="space-y-3 text-sm text-[#7e7e7e] md:text-base">
              <li>
                <motion.a
                  href="/contact"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  Contact Us
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="/store-locator"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  Store Locator
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="/style-expert"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  Style Expert
                </motion.a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4 lg:col-span-2">
            <h3 className="text-sm tracking-widest uppercase md:text-base">
              Company
            </h3>
            <ul className="space-y-3 text-sm text-[#7e7e7e] md:text-base">
              <li>
                <motion.a
                  href="/about"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  About Us
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="/exhibitions-events"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  Exhibitions & Moments
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="/e-catalogue"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  E-Catalogue
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="/careers"
                  className="cursor-pointer"
                  whileHover={{ color: "#ffffff", x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  Careers
                </motion.a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4 lg:col-span-2">
            <h3 className="text-sm text-[#7e7e7e] md:text-base">Follow us</h3>
            <div className="flex items-center gap-4">
              <motion.a
                href={socialLinks.instagram || "#"}
                target={socialLinks.instagram ? "_blank" : undefined}
                rel={socialLinks.instagram ? "noopener noreferrer" : undefined}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`text-gray-400 transition-colors hover:text-white ${!socialLinks.instagram ? "pointer-events-none opacity-50" : ""}`}
                aria-label="Instagram"
              >
                <svg
                  viewBox="0 0 256 256"
                  fill="currentColor"
                  className="h-8 w-8"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g strokeWidth="0"></g>
                  <g strokeLinecap="round" strokeLinejoin="round"></g>
                  <g>
                    <path d="M160,128a32,32,0,1,1-32-32A32.03667,32.03667,0,0,1,160,128Zm68-44v88a56.06353,56.06353,0,0,1-56,56H84a56.06353,56.06353,0,0,1-56-56V84A56.06353,56.06353,0,0,1,84,28h88A56.06353,56.06353,0,0,1,228,84Zm-52,44a48,48,0,1,0-48,48A48.05436,48.05436,0,0,0,176,128Zm16-52a12,12,0,1,0-12,12A12,12,0,0,0,192,76Z"></path>
                  </g>
                </svg>
              </motion.a>
              <motion.a
                href={socialLinks.facebook || "#"}
                target={socialLinks.facebook ? "_blank" : undefined}
                rel={socialLinks.facebook ? "noopener noreferrer" : undefined}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`text-gray-400 transition-colors hover:text-white ${!socialLinks.facebook ? "pointer-events-none opacity-50" : ""}`}
                aria-label="Facebook"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </motion.a>
              <motion.a
                href={socialLinks.twitter || "#"}
                target={socialLinks.twitter ? "_blank" : undefined}
                rel={socialLinks.twitter ? "noopener noreferrer" : undefined}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`text-gray-400 transition-colors hover:text-white ${!socialLinks.twitter ? "pointer-events-none opacity-50" : ""}`}
                aria-label="Twitter"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </motion.a>
              <motion.a
                href={socialLinks.youtube || "#"}
                target={socialLinks.youtube ? "_blank" : undefined}
                rel={socialLinks.youtube ? "noopener noreferrer" : undefined}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`text-gray-400 transition-colors hover:text-white ${!socialLinks.youtube ? "pointer-events-none opacity-50" : ""}`}
                aria-label="YouTube"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </motion.a>
              <motion.a
                href={socialLinks.linkedin || "#"}
                target={socialLinks.linkedin ? "_blank" : undefined}
                rel={socialLinks.linkedin ? "noopener noreferrer" : undefined}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`text-gray-400 transition-colors hover:text-white ${!socialLinks.linkedin ? "pointer-events-none opacity-50" : ""}`}
                aria-label="LinkedIn"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </motion.a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6">
          <div className="flex flex-col items-start justify-between gap-4 text-xs text-[#a5a5a5] md:flex-row md:items-center md:text-sm">
            <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-4">
              <p className="text-left text-sm md:text-base">
                Copyright 2025 Reliable Drapes. All rights reserved.
              </p>
            </div>
            <p className="text-start text-sm md:text-right md:text-base">
              Made with ❤️ by Gagan Ahuja
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
