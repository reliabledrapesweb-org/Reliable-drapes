import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Script from "next/script";
import "@/app/globals.css";
import {
  AuthProvider,
  CommerceFeaturesProvider,
  AnalyticsProvider,
} from "@/components/providers";
import { LayoutContent } from "@/components/layout";
import { GA_MEASUREMENT_ID } from "@/lib/analytics/gtag";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Reliable Drapes - B2B Furnishing Solutions",
  description:
    "Reliable Drapes delivers B2B furnishing solutions for showrooms, designers, retailers, and project partners across India.",
  keywords: [
    "drapes",
    "b2b furnishings",
    "trade catalogue",
    "interior business supplier",
    "curtain and upholstery wholesale",
    "project furnishing partner",
  ],
  authors: [{ name: "Reliable Drapes", url: "https://reliabledrapes.com" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://reliabledrapes.com",
    siteName: "Reliable Drapes",
    title: "Reliable Drapes - B2B Furnishing Solutions",
    description:
      "B2B-ready furnishing collections for business buyers, designers, and project teams.",
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
    title: "Reliable Drapes - B2B Furnishing Solutions",
    description:
      "Explore business-focused furnishing collections and project-ready catalogue options.",
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
    // google: "ADD_REAL_VERIFICATION_CODE_HERE",
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
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  send_page_view: false
                });
              `}
            </Script>
          </>
        )}
        <AuthProvider>
          <CommerceFeaturesProvider>
            <AnalyticsProvider />
            <LayoutContent>{children}</LayoutContent>
          </CommerceFeaturesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
