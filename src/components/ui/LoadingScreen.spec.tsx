import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingScreen } from "./LoadingScreen";

// Mock framer-motion
vi.mock("motion/react", () => ({
  motion: {
    span: ({ children, className, ...props }: any) => (
      <span className={className} data-testid="loading-square">
        {children}
      </span>
    ),
  },
}));

describe("LoadingScreen", () => {
  test("renders loading screen", () => {
    render(<LoadingScreen />);

    // Check for the fixed overlay container
    const container = document.querySelector(".fixed.inset-0");
    expect(container).toBeInTheDocument();
  });

  test("renders with correct z-index", () => {
    render(<LoadingScreen />);

    const container = document.querySelector(".fixed");
    expect(container).toHaveClass("z-50");
  });

  test("has centered content", () => {
    render(<LoadingScreen />);

    const container = document.querySelector(".fixed");
    expect(container).toHaveClass("flex");
    expect(container).toHaveClass("items-center");
    expect(container).toHaveClass("justify-center");
  });

  test("has white background", () => {
    render(<LoadingScreen />);

    const container = document.querySelector(".fixed");
    expect(container).toHaveClass("bg-white");
  });

  test("renders four animated squares", () => {
    render(<LoadingScreen />);

    const squares = screen.getAllByTestId("loading-square");
    expect(squares).toHaveLength(4);
  });

  test("animated squares have primary background", () => {
    render(<LoadingScreen />);

    const squares = screen.getAllByTestId("loading-square");
    squares.forEach((square) => {
      expect(square.className).toContain("bg-primary");
    });
  });
});
