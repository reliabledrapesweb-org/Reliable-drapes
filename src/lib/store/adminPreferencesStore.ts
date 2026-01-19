/**
 * Admin Preferences Store
 * Manages admin dashboard appearance and preferences
 * Persists to localStorage for client-side persistence
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Theme modes
export type ThemeMode = "light" | "dark" | "system";

// Accent color options
export type AccentColor =
  | "purple"
  | "blue"
  | "green"
  | "orange"
  | "red"
  | "pink";

// Sidebar layout options
export type SidebarLayout = "default" | "compact";

// Font size options
export type FontSize = "small" | "medium" | "large";

// Accent color configurations
export const ACCENT_COLORS: Record<
  AccentColor,
  { name: string; primary: string; hover: string; light: string }
> = {
  purple: {
    name: "Purple",
    primary: "#2F2582",
    hover: "#241c66",
    light: "#2F2582/10",
  },
  blue: {
    name: "Blue",
    primary: "#2563eb",
    hover: "#1d4ed8",
    light: "#2563eb/10",
  },
  green: {
    name: "Green",
    primary: "#059669",
    hover: "#047857",
    light: "#059669/10",
  },
  orange: {
    name: "Orange",
    primary: "#ea580c",
    hover: "#c2410c",
    light: "#ea580c/10",
  },
  red: {
    name: "Red",
    primary: "#dc2626",
    hover: "#b91c1c",
    light: "#dc2626/10",
  },
  pink: {
    name: "Pink",
    primary: "#db2777",
    hover: "#be185d",
    light: "#db2777/10",
  },
};

export interface AdminPreferencesState {
  // Theme settings
  themeMode: ThemeMode;
  accentColor: AccentColor;
  sidebarLayout: SidebarLayout;
  fontSize: FontSize;

  // UI preferences
  sidebarCollapsed: boolean;
  showAnimations: boolean;
  compactTables: boolean;
  showBreadcrumbs: boolean;

  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  setSidebarLayout: (layout: SidebarLayout) => void;
  setFontSize: (size: FontSize) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setShowAnimations: (show: boolean) => void;
  setCompactTables: (compact: boolean) => void;
  setShowBreadcrumbs: (show: boolean) => void;
  resetToDefaults: () => void;
}

const DEFAULT_PREFERENCES: Omit<
  AdminPreferencesState,
  | "setThemeMode"
  | "setAccentColor"
  | "setSidebarLayout"
  | "setFontSize"
  | "setSidebarCollapsed"
  | "toggleSidebar"
  | "setShowAnimations"
  | "setCompactTables"
  | "setShowBreadcrumbs"
  | "resetToDefaults"
> = {
  themeMode: "light",
  accentColor: "purple",
  sidebarLayout: "default",
  fontSize: "medium",
  sidebarCollapsed: false,
  showAnimations: true,
  compactTables: false,
  showBreadcrumbs: true,
};

export const useAdminPreferencesStore = create<AdminPreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,

      setThemeMode: (mode) => set({ themeMode: mode }),
      setAccentColor: (color) => set({ accentColor: color }),
      setSidebarLayout: (layout) => set({ sidebarLayout: layout }),
      setFontSize: (size) => set({ fontSize: size }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setShowAnimations: (show) => set({ showAnimations: show }),
      setCompactTables: (compact) => set({ compactTables: compact }),
      setShowBreadcrumbs: (show) => set({ showBreadcrumbs: show }),
      resetToDefaults: () => set(DEFAULT_PREFERENCES),
    }),
    {
      name: "admin-preferences",
    },
  ),
);
