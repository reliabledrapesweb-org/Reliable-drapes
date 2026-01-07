/**
 * Profile page constants
 */

export interface ProfileSidebarLink {
  name: string;
  id: string;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  scrollTo?: string;
}

export const PROFILE_SIDEBAR_LINKS: ProfileSidebarLink[] = [
  { name: "My details", id: "details", active: true },
  { name: "My wishlist", id: "wishlist", href: "/wishlist" },
  { name: "My orders", id: "orders", href: "#", disabled: true },
  { name: "My address book", id: "address", scrollTo: "address-section" },
];
