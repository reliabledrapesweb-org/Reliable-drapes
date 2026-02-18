import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Breadcrumb } from "./Breadcrumb";
import { usePathname } from "next/navigation";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    nav: ({ children, className, ...props }: any) => (
      <nav className={className} {...props}>
        {children}
      </nav>
    ),
  },
}));

describe("Breadcrumb", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders Home link on root path", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<Breadcrumb />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    // Since it has an href, it should be a link
    expect(screen.getByText("Home").closest("a")).toHaveAttribute("href", "/");
  });

  test("renders correct breadcrumbs for Shop page", () => {
    vi.mocked(usePathname).mockReturnValue("/shop");
    render(<Breadcrumb />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    // Shop should be current page (no href)
    const shopSpan = screen.getByText("Shop");
    expect(shopSpan.closest("a")).toBeNull();
    expect(shopSpan).toHaveClass("text-[#2f2582]"); // Active color
  });

  test("renders correct breadcrumbs for Product Details page", () => {
    vi.mocked(usePathname).mockReturnValue("/shop/product-1");
    render(<Breadcrumb />);

    expect(screen.getByText("Home")).toBeInTheDocument();

    const shopLink = screen.getByText("Shop");
    expect(shopLink.closest("a")).toHaveAttribute("href", "/shop");

    const detailsSpan = screen.getByText("Product Details");
    expect(detailsSpan.closest("a")).toBeNull();
  });

  test("renders correct breadcrumbs for Exhibitions & Events page", () => {
    vi.mocked(usePathname).mockReturnValue("/exhibitions-events");
    render(<Breadcrumb />);

    expect(screen.getByText("Exhibitions & Events")).toBeInTheDocument();
  });

  test("renders correct breadcrumbs for Admin Dashboard", () => {
    vi.mocked(usePathname).mockReturnValue("/admin/catalogues");
    render(<Breadcrumb />);

    expect(screen.getByText("Admin Dashboard")).toHaveAttribute(
      "href",
      "/admin",
    );
    expect(screen.getByText("Catalogues")).toBeInTheDocument();
  });

  test("renders correct breadcrumbs for Static pages", () => {
    vi.mocked(usePathname).mockReturnValue("/store-locator");
    render(<Breadcrumb />);

    expect(screen.getByText("Store Locator")).toBeInTheDocument();
  });
});
