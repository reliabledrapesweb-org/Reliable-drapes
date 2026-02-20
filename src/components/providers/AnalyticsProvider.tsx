"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { GA_MEASUREMENT_ID, trackPageView } from "@/lib/analytics/gtag";

export function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    const search = searchParams.toString();
    const url = search ? `${pathname}?${search}` : pathname;
    trackPageView(url);
  }, [pathname, searchParams]);

  return null;
}
