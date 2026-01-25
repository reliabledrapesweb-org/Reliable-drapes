import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProductGrid } from "./ProductGrid";
import type { Product } from "./ProductGrid";

// Mock ProductCard
vi.mock("./ProductCard", () => ({
  ProductCard: ({ title, onDownload, id }: any) => (
    <div data-testid="product-card">
      <h3>{title}</h3>
      <button
        onClick={() => onDownload(title, id)}
        data-testid={`download-${id}`}
      >
        Download
      </button>
    </div>
  ),
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock Toast
const mockAddToast = vi.fn();
vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({
    toasts: [],
    addToast: mockAddToast,
    removeToast: vi.fn(),
  }),
  ToastContainer: () => null,
}));

// Mock IntersectionObserver
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    // Simulate intersection immediately
    setTimeout(() => {
      callback(
        [
          {
            isIntersecting: true,
            target: { getAttribute: () => "1" },
          } as any,
        ],
        this as any,
      );
    }, 0);
  }
  observe = mockObserve;
  disconnect = mockDisconnect;
  unobserve = vi.fn();
  takeRecords = vi.fn();
  root = null;
  rootMargin = "";
  thresholds = [];
}

global.IntersectionObserver = MockIntersectionObserver as any;

// Mock dynamic import for actions
const mockIncrementDownload = vi.fn();
vi.mock("@/lib/actions/catalogues", () => ({
  incrementDownloadCount: mockIncrementDownload,
}));

describe("ProductGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders empty state when no products", () => {
    render(<ProductGrid filteredProducts={[]} />);
    expect(screen.getByText("No products found")).toBeInTheDocument();
  });

  test("renders products correctly", () => {
    const products: Product[] = [
      {
        id: "1",
        title: "Product 1",
        subtitle: "Sub 1",
        category: "Cat 1",
        imageSrc: "img1.jpg",
      },
      {
        id: "2",
        title: "Product 2",
        subtitle: "Sub 2",
        category: "Cat 1",
        imageSrc: "img2.jpg",
      },
    ];

    render(<ProductGrid filteredProducts={products} />);

    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Product 2")).toBeInTheDocument();
  });

  test("handles download click", async () => {
    const products: Product[] = [
      {
        id: "123",
        title: "Product 1",
        subtitle: "Sub 1",
        category: "Cat 1",
        imageSrc: "img1.jpg",
      },
    ];

    render(<ProductGrid filteredProducts={products} />);

    const downloadBtn = screen.getByTestId("download-123");
    fireEvent.click(downloadBtn);

    expect(mockAddToast).toHaveBeenCalledWith(
      "Product 1 catalogue is being downloaded...",
      "success",
      3000,
    );

    await waitFor(() => {
      expect(mockIncrementDownload).toHaveBeenCalledWith("123");
    });
  });
});
