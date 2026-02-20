import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { HeroSection } from "./HeroSection";
import { getSiteSettings } from "@/lib/actions/site-settings";

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock framer-motion
vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
    a: ({ children, href, className, ...props }: any) => (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    ),
    button: ({ children, onClick, className, ...props }: any) => (
      <button onClick={onClick} className={className} {...props}>
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: any) => children,
}));

vi.mock("@/lib/actions/site-settings", () => ({
  getSiteSettings: vi.fn(),
}));

describe("HeroSection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(getSiteSettings).mockResolvedValue({
      success: false,
      error: "Not configured",
    });

    // Mock Image constructor
    global.Image = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(url: string) {
        if (this.onload) this.onload();
      }
    } as any;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("renders hero content", () => {
    render(<HeroSection />);
    expect(screen.getByText("Explore Catalogue")).toBeInTheDocument();
    expect(screen.getByAltText("Hero Background")).toBeInTheDocument();
  });

  test("renders carousel dots", () => {
    render(<HeroSection />);
    const dots = screen.getAllByRole("button", { name: /Go to slide/i });
    expect(dots).toHaveLength(5); // 5 images in the array
  });

  test("navigates to specific slide on dot click", () => {
    render(<HeroSection />);
    const dots = screen.getAllByRole("button", { name: /Go to slide/i });

    // Initial state: first image (index 0)
    const img1 = screen.getByAltText("Hero Background");
    expect(img1).toHaveAttribute("src", "/images/hero/heroImg2.png");

    // Click 3rd dot (index 2)
    fireEvent.click(dots[2]);

    const img3 = screen.getByAltText("Hero Background");
    expect(img3).toHaveAttribute("src", "/images/hero/3.jpg");
  });

  test("auto-advances slides", () => {
    render(<HeroSection />);

    // Initial: index 0
    let img = screen.getByAltText("Hero Background");
    expect(img).toHaveAttribute("src", "/images/hero/heroImg2.png");

    // Fast-forward 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Should be index 1
    img = screen.getByAltText("Hero Background");
    expect(img).toHaveAttribute("src", "/images/hero/2.jpg");
  });

  test("handles keyboard navigation", () => {
    render(<HeroSection />);

    // Right arrow -> next
    fireEvent.keyDown(window, { key: "ArrowRight" });
    let img = screen.getByAltText("Hero Background");
    expect(img).toHaveAttribute("src", "/images/hero/2.jpg");

    // Left arrow -> prev (back to 0)
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    img = screen.getByAltText("Hero Background");
    expect(img).toHaveAttribute("src", "/images/hero/heroImg2.png");

    // Left arrow again -> wrap around to last
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    img = screen.getByAltText("Hero Background");
    expect(img).toHaveAttribute("src", "/images/hero/6.jpg"); // Last image
  });
});
