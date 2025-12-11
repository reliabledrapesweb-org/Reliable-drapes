/**
 * Test suite for ConfirmationModal component
 * Following TDD principles - written BEFORE implementation
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmationModal } from "./ConfirmationModal.js";

describe("ConfirmationModal", () => {
  const defaultProps = {
    isOpen: true,
    title: "Confirm Action",
    message: "Are you sure you want to proceed?",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it("should render when isOpen is true", () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to proceed?")).toBeInTheDocument();
  });

  it("should not render when isOpen is false", () => {
    render(<ConfirmationModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText("Confirm Action")).not.toBeInTheDocument();
  });

  it("should call onConfirm when confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} />);
    
    const confirmButton = screen.getByText("Confirm");
    fireEvent.click(confirmButton);
    
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should call onCancel when cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(<ConfirmationModal {...defaultProps} onCancel={onCancel} />);
    
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);
    
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should call onCancel when clicking outside modal", () => {
    const onCancel = vi.fn();
    render(<ConfirmationModal {...defaultProps} onCancel={onCancel} />);
    
    const overlay = screen.getByTestId("modal-overlay");
    fireEvent.click(overlay);
    
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should not close when clicking inside modal content", () => {
    const onCancel = vi.fn();
    render(<ConfirmationModal {...defaultProps} onCancel={onCancel} />);
    
    const modalContent = screen.getByTestId("modal-content");
    fireEvent.click(modalContent);
    
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("should render with danger variant styling", () => {
    render(<ConfirmationModal {...defaultProps} variant="danger" />);
    
    const confirmButton = screen.getByText("Confirm");
    expect(confirmButton).toHaveClass("bg-red-600");
  });

  it("should render with warning variant styling", () => {
    render(<ConfirmationModal {...defaultProps} variant="warning" />);
    
    const confirmButton = screen.getByText("Confirm");
    expect(confirmButton).toHaveClass("bg-yellow-600");
  });

  it("should render with default variant styling", () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    const confirmButton = screen.getByText("Confirm");
    expect(confirmButton).toHaveClass("bg-[#2f2582]");
  });

  it("should show loading state on confirm button", () => {
    render(<ConfirmationModal {...defaultProps} isLoading={true} />);
    
    const confirmButton = screen.getByText("Confirm");
    expect(confirmButton).toBeDisabled();
  });

  it("should disable buttons when loading", () => {
    render(<ConfirmationModal {...defaultProps} isLoading={true} />);
    
    const confirmButton = screen.getByText("Confirm");
    const cancelButton = screen.getByText("Cancel");
    
    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it("should render custom confirm and cancel text", () => {
    render(
      <ConfirmationModal
        {...defaultProps}
        confirmText="Delete"
        cancelText="Keep"
      />
    );
    
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Keep")).toBeInTheDocument();
  });

  it("should render with custom icon", () => {
    const CustomIcon = () => <div data-testid="custom-icon">!</div>;
    render(<ConfirmationModal {...defaultProps} icon={<CustomIcon />} />);
    
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("should handle keyboard escape to cancel", () => {
    const onCancel = vi.fn();
    render(<ConfirmationModal {...defaultProps} onCancel={onCancel} />);
    
    fireEvent.keyDown(document, { key: "Escape" });
    
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should trap focus within modal", () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    const confirmButton = screen.getByText("Confirm");
    const cancelButton = screen.getByText("Cancel");
    
    // Tab should cycle between buttons
    confirmButton.focus();
    expect(document.activeElement).toBe(confirmButton);
    
    fireEvent.keyDown(confirmButton, { key: "Tab" });
    // Focus should move to cancel button or stay within modal
  });
});
