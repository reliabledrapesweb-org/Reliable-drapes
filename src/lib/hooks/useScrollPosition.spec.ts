import { describe, expect, test, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useScrollPosition } from "./useScrollPosition";

describe("useScrollPosition", () => {
  test("returns false initially", () => {
    const { result } = renderHook(() => useScrollPosition());
    expect(result.current).toBe(false);
  });

  test("returns true when scrolled past threshold", () => {
    const { result } = renderHook(() => useScrollPosition(100));

    // Simulate scroll
    act(() => {
      // @ts-ignore
      window.scrollY = 150;
      window.dispatchEvent(new Event("scroll"));
    });

    expect(result.current).toBe(true);
  });

  test("returns false when scrolled back up", () => {
    const { result } = renderHook(() => useScrollPosition(100));

    // Scroll down
    act(() => {
      // @ts-ignore
      window.scrollY = 150;
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe(true);

    // Scroll up
    act(() => {
      // @ts-ignore
      window.scrollY = 50;
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe(false);
  });

  test("respects custom threshold", () => {
    const { result } = renderHook(() => useScrollPosition(200));

    act(() => {
      // @ts-ignore
      window.scrollY = 150; // Below threshold
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe(false);

    act(() => {
      // @ts-ignore
      window.scrollY = 250; // Above threshold
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe(true);
  });
});
