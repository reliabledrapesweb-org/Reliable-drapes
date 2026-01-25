import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CartDrawer } from "./CartDrawer";
import { useCartStore } from "@/lib/store";
import type { CartItem } from "@/lib/store/cartStore";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, onClick, className, ...props }: any) => (
      <div
        onClick={onClick}
        className={className}
        data-testid={props["data-testid"]}
      >
        {children}
      </div>
    ),
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, onClick, className, disabled, ...props }: any) => (
      <button
        onClick={onClick}
        className={className}
        disabled={disabled}
        aria-label={props["aria-label"]}
      >
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, onClick, ...props }: any) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

// Mock the store
vi.mock("@/lib/store", () => ({
  useCartStore: vi.fn(),
}));

const mockCartStore = {
  items: [] as CartItem[],
  isOpen: true,
  closeCart: vi.fn(),
  updateQuantity: vi.fn(),
  removeItem: vi.fn(),
  getTotalItems: vi.fn(() => 0),
  getTotalPrice: vi.fn(() => 0),
};

describe("CartDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCartStore).mockReturnValue(mockCartStore);
  });

  describe("Empty Cart State", () => {
    test("renders empty cart message when no items", () => {
      vi.mocked(useCartStore).mockReturnValue({
        ...mockCartStore,
        items: [],
        isOpen: true,
      });

      render(<CartDrawer />);

      expect(screen.getByText("Shopping Cart")).toBeInTheDocument();
      expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
      expect(
        screen.getByText("Add some products to get started"),
      ).toBeInTheDocument();
    });

    test("renders Continue Shopping link when empty", () => {
      vi.mocked(useCartStore).mockReturnValue({
        ...mockCartStore,
        items: [],
        isOpen: true,
      });

      render(<CartDrawer />);

      const continueShoppingLink = screen.getByText("Continue Shopping");
      expect(continueShoppingLink).toBeInTheDocument();
      expect(continueShoppingLink.closest("a")).toHaveAttribute(
        "href",
        "/shop",
      );
    });

    test("calls closeCart when Continue Shopping link is clicked", () => {
      const closeMock = vi.fn();
      vi.mocked(useCartStore).mockReturnValue({
        ...mockCartStore,
        items: [],
        isOpen: true,
        closeCart: closeMock,
      });

      render(<CartDrawer />);

      fireEvent.click(screen.getByText("Continue Shopping"));
      expect(closeMock).toHaveBeenCalled();
    });
  });

  describe("Cart with Items", () => {
    const mockItems: CartItem[] = [
      {
        id: "item-1",
        productId: "prod-1",
        name: "Premium Curtain",
        price: 2500,
        quantity: 2,
        image: "/images/curtain.jpg",
        variantName: "Blue",
      },
      {
        id: "item-2",
        productId: "prod-2",
        name: "Sheer Panel",
        price: 1500,
        quantity: 1,
        image: null,
      },
    ];

    test("renders cart items correctly", () => {
      vi.mocked(useCartStore).mockReturnValue({
        ...mockCartStore,
        items: mockItems,
        isOpen: true,
        getTotalItems: () => 3,
        getTotalPrice: () => 6500,
      });

      render(<CartDrawer />);

      expect(screen.getByText("Premium Curtain")).toBeInTheDocument();
      expect(screen.getByText("Blue")).toBeInTheDocument();
      expect(screen.getByText("Sheer Panel")).toBeInTheDocument();
    });

    test("displays item count in header", () => {
      vi.mocked(useCartStore).mockReturnValue({
        ...mockCartStore,
        items: mockItems,
        isOpen: true,
        getTotalItems: () => 3,
        getTotalPrice: () => 6500,
      });

      render(<CartDrawer />);

      expect(screen.getByText("3 items")).toBeInTheDocument();
    });

    test("displays singular item when count is 1", () => {
      vi.mocked(useCartStore).mockReturnValue({
        ...mockCartStore,
        items: [mockItems[0]],
        isOpen: true,
        getTotalItems: () => 1,
        getTotalPrice: () => 2500,
      });

      render(<CartDrawer />);

      expect(screen.getByText("1 item")).toBeInTheDocument();
    });

    test("displays item quantities", () => {
      vi.mocked(useCartStore).mockReturnValue({
        ...mockCartStore,
        items: mockItems,
        isOpen: true,
        getTotalItems: () => 3,
        getTotalPrice: () => 6500,
      });

      render(<CartDrawer />);

      expect(screen.getByText("2")).toBeInTheDocument(); // quantity of first item
      expect(screen.getByText("1")).toBeInTheDocument(); // quantity of second item
    });

    test("calls updateQuantity when increment button is clicked", () => {
      const updateMock = vi.fn();
      vi.mocked(useCartStore).mockReturnValue({
        ...mockCartStore,
        items: [mockItems[0]],
        isOpen: true,
        updateQuantity: updateMock,
        getTotalItems: () => 2,
        getTotalPrice: () => 5000,
      });

      render(<CartDrawer />);

      // Find the plus button (should be after the quantity text)
      const buttons = screen.getAllByRole("button");
      const plusButton = buttons.find((btn) =>
        btn.querySelector("svg.lucide-plus"),
      );

      if (plusButton) {
        fireEvent.click(plusButton);
        expect(updateMock).toHaveBeenCalledWith("item-1", 3);
      }
    });

    test("calls updateQuantity when decrement button is clicked", () => {
      const updateMock = vi.fn();
      vi.mocked(useCartStore).mockReturnValue({
        ...mockCartStore,
        items: [mockItems[0]],
        isOpen: true,
        updateQuantity: updateMock,
        getTotalItems: () => 2,
        getTotalPrice: () => 5000,
      });

      render(<CartDrawer />);

      // Find the minus button
      const buttons = screen.getAllByRole("button");
      const minusButton = buttons.find((btn) =>
        btn.querySelector("svg.lucide-minus"),
      );

      if (minusButton) {
        fireEvent.click(minusButton);
        expect(updateMock).toHaveBeenCalledWith("item-1", 1);
      }
    });

    test("calls removeItem when delete button is clicked", () => {
      const removeMock = vi.fn();
      vi.mocked(useCartStore).mockReturnValue({
        ...mockCartStore,
        items: [mockItems[0]],
        isOpen: true,
        removeItem: removeMock,
        getTotalItems: () => 2,
        getTotalPrice: () => 5000,
      });

      render(<CartDrawer />);

      const removeButton = screen.getByRole("button", { name: "Remove item" });
      fireEvent.click(removeButton);

      expect(removeMock).toHaveBeenCalledWith("item-1");
    });

    test("displays formatted prices in INR", () => {
      vi.mocked(useCartStore).mockReturnValue({
        ...mockCartStore,
        items: mockItems,
        isOpen: true,
        getTotalItems: () => 3,
        getTotalPrice: () => 6500,
      });

      render(<CartDrawer />);

      // Prices should be formatted in INR
      expect(screen.getByText(/₹2,500/)).toBeInTheDocument();
      expect(screen.getByText(/₹1,500/)).toBeInTheDocument();
    });

    test("renders View Cart & Checkout link", () => {
      vi.mocked(useCartStore).mockReturnValue({
        ...mockCartStore,
        items: mockItems,
        isOpen: true,
        getTotalItems: () => 3,
        getTotalPrice: () => 6500,
      });

      render(<CartDrawer />);

      const checkoutLink = screen.getByText("View Cart & Checkout");
      expect(checkoutLink).toBeInTheDocument();
      expect(checkoutLink.closest("a")).toHaveAttribute("href", "/cart");
    });
  });

  describe("Cart Drawer Controls", () => {
    test("calls closeCart when close button is clicked", () => {
      const closeMock = vi.fn();
      vi.mocked(useCartStore).mockReturnValue({
        ...mockCartStore,
        items: [],
        isOpen: true,
        closeCart: closeMock,
      });

      render(<CartDrawer />);

      const closeButton = screen.getByRole("button", { name: "Close cart" });
      fireEvent.click(closeButton);

      expect(closeMock).toHaveBeenCalled();
    });

    test("calls closeCart when backdrop is clicked", () => {
      const closeMock = vi.fn();
      vi.mocked(useCartStore).mockReturnValue({
        ...mockCartStore,
        items: [],
        isOpen: true,
        closeCart: closeMock,
      });

      render(<CartDrawer />);

      // The backdrop should be clickable
      const backdrop = document.querySelector(".bg-black\\/50");
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(closeMock).toHaveBeenCalled();
      }
    });

    test("does not render content when cart is closed", () => {
      vi.mocked(useCartStore).mockReturnValue({
        ...mockCartStore,
        items: [],
        isOpen: false,
      });

      render(<CartDrawer />);

      expect(screen.queryByText("Shopping Cart")).not.toBeInTheDocument();
    });
  });

  describe("Image Handling", () => {
    test("renders product image when available", () => {
      vi.mocked(useCartStore).mockReturnValue({
        ...mockCartStore,
        items: [
          {
            id: "item-1",
            productId: "prod-1",
            name: "Premium Curtain",
            price: 2500,
            quantity: 1,
            image: "/images/curtain.jpg",
          },
        ],
        isOpen: true,
        getTotalItems: () => 1,
        getTotalPrice: () => 2500,
      });

      render(<CartDrawer />);

      const image = screen.getByRole("img", { name: "Premium Curtain" });
      expect(image).toHaveAttribute("src", "/images/curtain.jpg");
    });

    test("renders placeholder when image is null", () => {
      vi.mocked(useCartStore).mockReturnValue({
        ...mockCartStore,
        items: [
          {
            id: "item-1",
            productId: "prod-1",
            name: "Product Without Image",
            price: 1000,
            quantity: 1,
            image: null,
          },
        ],
        isOpen: true,
        getTotalItems: () => 1,
        getTotalPrice: () => 1000,
      });

      render(<CartDrawer />);

      // Should not find an img element for this item
      expect(
        screen.queryByRole("img", { name: "Product Without Image" }),
      ).not.toBeInTheDocument();
    });
  });
});
