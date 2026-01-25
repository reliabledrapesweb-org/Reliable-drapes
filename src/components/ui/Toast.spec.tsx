import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { useToast, ToastContainer } from "./Toast";

// Mock framer-motion
vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe("useToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("initializes with empty toasts array", () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toHaveLength(0);
  });

  test("adds a toast", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast("Test message", "success");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("Test message");
    expect(result.current.toasts[0].type).toBe("success");
  });

  test("removes a toast by id", () => {
    const { result } = renderHook(() => useToast());

    let toastId: string;
    act(() => {
      toastId = result.current.addToast("Test message");
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      result.current.removeToast(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  test("auto-removes toast after duration", async () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast("Auto remove", "info", 1000);
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  test("uses default type of info", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast("Default type");
    });

    expect(result.current.toasts[0].type).toBe("info");
  });

  test("supports all toast types", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast("Success", "success");
      result.current.addToast("Error", "error");
      result.current.addToast("Warning", "warning");
      result.current.addToast("Info", "info");
    });

    expect(result.current.toasts).toHaveLength(4);
    expect(result.current.toasts[0].type).toBe("success");
    expect(result.current.toasts[1].type).toBe("error");
    expect(result.current.toasts[2].type).toBe("warning");
    expect(result.current.toasts[3].type).toBe("info");
  });
});

describe("ToastContainer", () => {
  const mockToasts = [
    { id: "1", message: "Success message", type: "success" as const },
    { id: "2", message: "Error message", type: "error" as const },
  ];

  test("renders toasts", () => {
    const removeToast = vi.fn();
    render(<ToastContainer toasts={mockToasts} removeToast={removeToast} />);

    expect(screen.getByText("Success message")).toBeInTheDocument();
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  test("calls removeToast when close button is clicked", () => {
    const removeToast = vi.fn();
    render(
      <ToastContainer toasts={[mockToasts[0]]} removeToast={removeToast} />,
    );

    const closeButtons = screen.getAllByRole("button");
    fireEvent.click(closeButtons[0]);

    expect(removeToast).toHaveBeenCalledWith("1");
  });

  test("renders empty when no toasts", () => {
    const removeToast = vi.fn();
    const { container } = render(
      <ToastContainer toasts={[]} removeToast={removeToast} />,
    );

    // Container should still render but be empty of toast content
    expect(container.querySelector(".fixed")).toBeInTheDocument();
  });

  test("applies correct styling for success toast", () => {
    const removeToast = vi.fn();
    render(
      <ToastContainer
        toasts={[{ id: "1", message: "Success", type: "success" }]}
        removeToast={removeToast}
      />,
    );

    const toast = screen.getByText("Success").closest("div");
    expect(toast).toHaveClass("bg-green-50");
  });

  test("applies correct styling for error toast", () => {
    const removeToast = vi.fn();
    render(
      <ToastContainer
        toasts={[{ id: "1", message: "Error", type: "error" }]}
        removeToast={removeToast}
      />,
    );

    const toast = screen.getByText("Error").closest("div");
    expect(toast).toHaveClass("bg-red-50");
  });

  test("applies correct styling for warning toast", () => {
    const removeToast = vi.fn();
    render(
      <ToastContainer
        toasts={[{ id: "1", message: "Warning", type: "warning" }]}
        removeToast={removeToast}
      />,
    );

    const toast = screen.getByText("Warning").closest("div");
    expect(toast).toHaveClass("bg-yellow-50");
  });
});
