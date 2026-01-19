/**
 * Barrel export for all store files
 */

export { useAuthStore } from "./authStore";
export type { AuthState } from "./authStore";
export { useCartStore } from "./cartStore";
export type { CartItem } from "./cartStore";
export { useWishlistStore } from "./wishlistStore";
export type { WishlistItem } from "./wishlistStore";
export {
  useAdminPreferencesStore,
  ACCENT_COLORS,
} from "./adminPreferencesStore";
export type {
  AdminPreferencesState,
  ThemeMode,
  AccentColor,
  SidebarLayout,
  FontSize,
} from "./adminPreferencesStore";
