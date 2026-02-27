/**
 * Dealer/B2B portal configuration
 */

export const DEALER_CONFIG = {
  portalUrl: process.env.NEXT_PUBLIC_TRADER_PORTAL_URL || "",
  isConfigured: !!process.env.NEXT_PUBLIC_TRADER_PORTAL_URL,
  iframeTitle: "Dealer Portal - Reliable Drapes B2B",
  localStorageKey: "dealer_session",
} as const;

export interface DealerSession {
  isAuthenticated: boolean;
  userId: string;
  email: string;
  companyName?: string;
  token?: string;
  loginTime: string;
}

export type B2BMessageType =
  | "B2B_LOGIN_SUCCESS"
  | "B2B_LOGIN_FAILURE"
  | "B2B_LOGOUT";

export interface B2BMessage {
  type: B2BMessageType;
  payload?: Partial<DealerSession> & { message?: string };
}
