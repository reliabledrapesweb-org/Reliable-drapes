import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "@/app/globals.css";
import { AuthProvider } from "@/components/providers";
import { LayoutContent } from "@/components/layout";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Reliable Drapes - Luxury Home Furnishings",
  description: "Discover premium quality drapes and home furnishings. Shop our exclusive collection of luxury curtains, blinds, and interior decor. Fast delivery, premium materials, and exceptional customer service.",
  keywords: [
    "drapes",
    "curtains",
    "home furnishings",
    "luxury drapes",
    "interior design",
    "window treatments",
    "home decor",
  ],
  authors: [{ name: "Reliable Drapes", url: "https://reliabledrapes.com" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://reliabledrapes.com",
    siteName: "Reliable Drapes",
    title: "Reliable Drapes - Luxury Home Furnishings",
    description:
      "Premium quality drapes and home furnishings for your perfect space.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Reliable Drapes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reliable Drapes - Luxury Home Furnishings",
    description:
      "Discover premium quality drapes and home furnishings. Shop our exclusive collection.",
    creator: "@reliabledrapes",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} antialiased`}>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
