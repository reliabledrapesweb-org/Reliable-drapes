import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "./Header";
import { useAuthStore, useCartStore, useWishlistStore } from "@/lib/store";
import { useScrollPosition } from "@/lib/hooks";
import { usePathname } from "next/navigation";
import { useCommerceFeatures } from "@/components/providers";
import { getGemAssessedLogoSettings } from "@/lib/actions/site-settings";

// Mock dependencies
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} data-testid="next-image" />
  ),
}));

vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
    nav: ({ children, className, ...props }: any) => (
      <nav className={className} {...props}>
        {children}
      </nav>
    ),
    button: ({ children, onClick, className, ...props }: any) => (
      <button onClick={onClick} className={className} {...props}>
        {children}
      </button>
    ),
    a: ({ children, href, className, ...props }: any) => (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    ),
  },
}));

// Mock hooks
vi.mock("@/lib/hooks", () => ({
  useScrollPosition: vi.fn(),
}));

vi.mock("@/lib/store", () => ({
  useAuthStore: vi.fn(),
  useCartStore: vi.fn(),
  useWishlistStore: vi.fn(),
}));

vi.mock("@/components/providers", () => ({
  useCommerceFeatures: vi.fn(),
}));

vi.mock("@/lib/actions/site-settings", () => ({
  getGemAssessedLogoSettings: vi.fn(),
}));

// Mock constants
vi.mock("@/lib/constants", () => ({
  NAV_LINKS: [
    { name: "Home", link: "/" },
    { name: "Shop", link: "/shop" },
  ],
}));

// Mock Supabase
vi.mock("@/lib/supabase/client", () => ({
  supabaseClient: {
    auth: {
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

// Mock child components
vi.mock("./MobileMenu", () => ({
  MobileMenu: ({ isOpen }: any) => (
    <div data-testid="mobile-menu" data-isopen={isOpen.toString()}>
      Mobile Menu
    </div>
  ),
}));

vi.mock("./SearchModal", () => ({
  SearchModal: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="search-modal">
        <button onClick={onClose} aria-label="Close search">
          Close
        </button>
      </div>
    ) : null,
}));

vi.mock("@/components/features/profile/LogoutModal", () => ({
  LogoutModal: ({ isOpen, onConfirm }: any) =>
    isOpen ? (
      <div data-testid="logout-modal">
        <button onClick={onConfirm}>Confirm Logout</button>
      </div>
    ) : null,
}));

vi.mock("@/components/shared", () => ({
  ComingSoonModal: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="coming-soon-modal">
        <button onClick={onClose}>Close Coming Soon</button>
      </div>
    ) : null,
}));

describe("Header", () => {
  const mockLogout = vi.fn();
  const mockToggleCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(usePathname).mockReturnValue("/");
    vi.mocked(useScrollPosition).mockReturnValue(false);

    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      logout: mockLogout,
    });

    vi.mocked(useCartStore).mockReturnValue({
      getTotalItems: () => 0,
      toggleCart: mockToggleCart,
    });

    vi.mocked(useWishlistStore).mockReturnValue({
      getTotalItems: () => 0,
    });

    vi.mocked(useCommerceFeatures).mockReturnValue({
      commerceFeaturesEnabled: true,
      comingSoonMessage: "Coming soon",
      isLoading: false,
    });

    vi.mocked(getGemAssessedLogoSettings).mockResolvedValue({
      enabled: false,
      url: null,
    });
  });

  describe("Rendering", () => {
    test("renders logo", () => {
      render(<Header />);
      expect(screen.getByAltText("Logo")).toBeInTheDocument();
    });

    test("renders navigation links on desktop", () => {
      render(<Header />);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Shop")).toBeInTheDocument();
    });

    test("renders action buttons (search, wishlist, cart)", () => {
      render(<Header />);

      // We have multiple search/wishlist/cart icons (desktop + mobile)
      // Use getAllByLabelText
      expect(screen.getAllByLabelText("Search")).toHaveLength(2);
      expect(screen.getAllByLabelText("Wishlist")).toHaveLength(2);
      expect(screen.getAllByLabelText("Cart")).toHaveLength(2);
    });

    test("renders login link when user is not authenticated", () => {
      render(<Header />);
      // Should show login links (desktop + mobile)
      expect(screen.getAllByText("Trader Log In")).toHaveLength(2);
    });

    test("renders user avatar when user is authenticated", () => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: { email: "test@example.com", full_name: "Test User" },
        logout: mockLogout,
      });

      render(<Header />);

      // Should show user avatar buttons (desktop + mobile)
      expect(screen.getAllByLabelText("User account menu")).toHaveLength(2);
      expect(screen.queryByText("Trader Log In")).not.toBeInTheDocument();
    });
  });

  describe("Scroll and Path Behavior", () => {
    test("uses white logo and text on home page", () => {
      vi.mocked(usePathname).mockReturnValue("/");
      vi.mocked(useScrollPosition).mockReturnValue(false);

      render(<Header />);

      const logo = screen.getByAltText("Logo");
      expect(logo).toHaveAttribute("src", "/images/logo.png");

      const homeLink = screen.getByText("Home");
      expect(homeLink).toHaveClass("text-white");
    });

    test("uses default logo and text on other pages when not scrolled", () => {
      vi.mocked(usePathname).mockReturnValue("/shop");
      vi.mocked(useScrollPosition).mockReturnValue(false);

      render(<Header />);

      const logo = screen.getByAltText("Logo");
      expect(logo).toHaveAttribute("src", "/images/defaultlogo.png");

      const homeLink = screen.getByText("Home");
      expect(homeLink).toHaveClass("text-black");
    });

    test("uses white logo and text when scrolled, regardless of page", () => {
      vi.mocked(usePathname).mockReturnValue("/shop");
      vi.mocked(useScrollPosition).mockReturnValue(true);

      render(<Header />);

      const logo = screen.getByAltText("Logo");
      expect(logo).toHaveAttribute("src", "/images/logo.png");

      const homeLink = screen.getByText("Home");
      expect(homeLink).toHaveClass("text-white");
    });

    test("applies dark background when scrolled", () => {
      vi.mocked(useScrollPosition).mockReturnValue(true);

      const { container } = render(<Header />);
      const nav = container.querySelector("nav");

      expect(nav).toHaveClass("bg-black/80");
    });
  });

  describe("Interactions", () => {
    test("opens search modal when search button is clicked", async () => {
      const user = userEvent.setup();
      render(<Header />);

      const searchButtons = screen.getAllByLabelText("Search");
      await user.click(searchButtons[0]); // Click desktop search

      expect(screen.getByTestId("search-modal")).toBeInTheDocument();
    });

    test("opens coming soon modal for search when commerce features are disabled", async () => {
      const user = userEvent.setup();
      vi.mocked(useCommerceFeatures).mockReturnValue({
        commerceFeaturesEnabled: false,
        comingSoonMessage: "Coming soon",
        isLoading: false,
      });

      render(<Header />);

      const searchButtons = screen.getAllByLabelText("Search");
      await user.click(searchButtons[0]);

      expect(screen.getByTestId("coming-soon-modal")).toBeInTheDocument();
      expect(screen.queryByTestId("search-modal")).not.toBeInTheDocument();
    });

    test("toggles cart when cart button is clicked", async () => {
      const user = userEvent.setup();
      render(<Header />);

      const cartButtons = screen.getAllByLabelText("Cart");
      await user.click(cartButtons[0]);

      expect(mockToggleCart).toHaveBeenCalled();
    });

    test("does not toggle cart when commerce features are disabled", async () => {
      const user = userEvent.setup();
      vi.mocked(useCommerceFeatures).mockReturnValue({
        commerceFeaturesEnabled: false,
        comingSoonMessage: "Coming soon",
        isLoading: false,
      });

      render(<Header />);

      const cartButtons = screen.getAllByLabelText("Cart");
      await user.click(cartButtons[0]);

      expect(mockToggleCart).not.toHaveBeenCalled();
      expect(screen.getByTestId("coming-soon-modal")).toBeInTheDocument();
    });

    test("opens mobile menu when menu button is clicked", async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByLabelText("Menu");
      await user.click(menuButton);

      const mobileMenu = screen.getByTestId("mobile-menu");
      expect(mobileMenu).toHaveAttribute("data-isopen", "true");
    });

    test("shows logout confirmation when logout is clicked", async () => {
      const user = userEvent.setup();
      vi.mocked(useAuthStore).mockReturnValue({
        user: { email: "test@example.com" },
        logout: mockLogout,
      });

      render(<Header />);

      // Open user menu
      const userMenuButtons = screen.getAllByLabelText("User account menu");
      await user.click(userMenuButtons[0]);

      // Click logout - might be multiple if both desktop and mobile menus open
      const logoutButtons = screen.getAllByText("Log Out");
      await user.click(logoutButtons[0]);

      expect(screen.getByTestId("logout-modal")).toBeInTheDocument();
    });
  });

  describe("Counters", () => {
    test("shows cart item count when > 0", () => {
      vi.mocked(useCartStore).mockReturnValue({
        getTotalItems: () => 5,
        toggleCart: mockToggleCart,
      });

      render(<Header />);

      // Should be visible in both desktop and mobile views
      expect(screen.getAllByText("5")).toHaveLength(2);
    });

    test("shows wishlist item count when > 0", () => {
      vi.mocked(useWishlistStore).mockReturnValue({
        getTotalItems: () => 3,
      });

      render(<Header />);

      expect(screen.getAllByText("3")).toHaveLength(2);
    });

    test("does not show counters when count is 0", () => {
      vi.mocked(useCartStore).mockReturnValue({
        getTotalItems: () => 0,
        toggleCart: mockToggleCart,
      });
      vi.mocked(useWishlistStore).mockReturnValue({
        getTotalItems: () => 0,
      });

      render(<Header />);

      // Query for counters - span elements inside buttons
      const counterElements = screen.queryAllByText("0");
      expect(counterElements).toHaveLength(0);
    });
  });
});
