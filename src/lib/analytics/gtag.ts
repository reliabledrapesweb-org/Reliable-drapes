export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

type EventParams = Record<string, string | number | boolean | null | undefined | unknown[]>;

export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_variant?: string;
};

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: any[]) => void;
  }
}

function isAnalyticsAvailable() {
  return typeof window !== "undefined" && !!GA_MEASUREMENT_ID && typeof window.gtag === "function";
}

export function trackEvent(eventName: string, params: EventParams = {}) {
  if (!isAnalyticsAvailable()) return;
  window.gtag("event", eventName, params);
}

export function trackPageView(url: string) {
  if (!isAnalyticsAvailable()) return;
  window.gtag("event", "page_view", {
    page_location: url,
    page_path: url,
    send_to: GA_MEASUREMENT_ID,
  });
}

export function trackViewItem(item: AnalyticsItem) {
  trackEvent("view_item", {
    currency: "INR",
    value: item.price,
    items: [item],
  });
}

export function trackAddToCart(item: AnalyticsItem) {
  trackEvent("add_to_cart", {
    currency: "INR",
    value: item.price * (item.quantity || 1),
    items: [item],
  });
}

export function trackBeginCheckout(items: AnalyticsItem[], value: number) {
  trackEvent("begin_checkout", {
    currency: "INR",
    value,
    items,
  });
}

export function trackPurchase(input: {
  transactionId: string;
  value: number;
  items: AnalyticsItem[];
}) {
  trackEvent("purchase", {
    transaction_id: input.transactionId,
    currency: "INR",
    value: input.value,
    items: input.items,
  });
}
