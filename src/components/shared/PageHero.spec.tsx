import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHero } from "./PageHero";

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock motion/react
vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
    h1: ({ children, className, ...props }: any) => (
      <h1 className={className} {...props}>
        {children}
      </h1>
    ),
    p: ({ children, className, ...props }: any) => (
      <p className={className} {...props}>
        {children}
      </p>
    ),
  },
}));

describe("PageHero", () => {
  test("renders heading correctly", () => {
    render(<PageHero heading="About Us" />);
    expect(screen.getByText("About Us")).toBeInTheDocument();
  });

  test("renders logo", () => {
    render(<PageHero heading="Test" />);
    const logo = screen.getByAltText("Reliable Drapes Logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/images/logo.png");
  });

  test("renders background image with default src", () => {
    render(<PageHero heading="Test" />);
    const bgImage = screen.getByAltText("Luxury home furnishings");
    expect(bgImage).toHaveAttribute("src", "/images/abouthero.png");
  });

  test("renders background image with custom src", () => {
    render(<PageHero heading="Test" backgroundImage="/custom-bg.jpg" />);
    const bgImage = screen.getByAltText("Luxury home furnishings");
    expect(bgImage).toHaveAttribute("src", "/custom-bg.jpg");
  });

  test("renders subtitle", () => {
    render(<PageHero heading="Test" />);
    expect(
      screen.getByText(
        "(A Unit of Shree Ambica Furnishings (India) Pvt. Ltd.)",
      ),
    ).toBeInTheDocument();
  });
});
