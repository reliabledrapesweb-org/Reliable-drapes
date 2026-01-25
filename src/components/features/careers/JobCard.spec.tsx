import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { JobCard } from "./JobCard";
import type { Job } from "@/lib/actions/jobs";

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

describe("JobCard", () => {
  const mockJob: Job = {
    id: "job-1",
    title: "Senior Sales Associate",
    experience: "3-5 years",
    location: "Mumbai",
    description: "We are looking for an experienced sales associate...",
    type: "Store",
    is_active: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  };

  const mockOnApply = vi.fn();

  test("renders job details correctly", () => {
    render(<JobCard job={mockJob} onApply={mockOnApply} />);

    expect(screen.getByText("Senior Sales Associate")).toBeInTheDocument();
    expect(screen.getByText("3-5 years")).toBeInTheDocument();
    expect(screen.getByText(/Mumbai/)).toBeInTheDocument();
    expect(screen.getByText("Store")).toBeInTheDocument();
    expect(screen.getByText(/We are looking for/)).toBeInTheDocument();
  });

  test("calls onApply when Apply button is clicked", () => {
    render(<JobCard job={mockJob} onApply={mockOnApply} />);

    const applyButton = screen.getByText("Apply");
    fireEvent.click(applyButton);

    expect(mockOnApply).toHaveBeenCalledWith(mockJob);
  });

  test("renders with correct styling classes", () => {
    render(<JobCard job={mockJob} onApply={mockOnApply} />);

    // Check for some styling classes to ensure it matches design
    const card = screen
      .getByText("Senior Sales Associate")
      .closest("div.rounded-2xl");
    expect(card).toHaveClass("bg-linear-to-b");
    expect(card).toHaveClass("from-white");
  });
});
