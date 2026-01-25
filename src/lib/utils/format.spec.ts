import { describe, expect, test } from "vitest";
import { formatCurrency, formatDate, truncateText, capitalize } from "./format";

describe("formatCurrency", () => {
  test("formats INR by default", () => {
    expect(formatCurrency(1000)).toBe("₹1,000");
    expect(formatCurrency(50)).toBe("₹50");
  });

  test("formats other currencies", () => {
    const usdResult = formatCurrency(1000, "USD");
    expect(usdResult).toBe("$1,000");
  });

  test("handles zero amount", () => {
    expect(formatCurrency(0)).toBe("₹0");
  });

  test("handles decimal amounts", () => {
    // Implementation uses minimumFractionDigits: 0, which suppresses trailing zeros
    // and limits to default max (usually 2 for currency)
    expect(formatCurrency(99.99)).toBe("₹99.99");
    expect(formatCurrency(1234.5)).toBe("₹1,234.5");
  });

  test("handles large numbers with thousand separators (lakhs/crores)", () => {
    expect(formatCurrency(1000000)).toBe("₹10,00,000");
  });
});

describe("formatDate", () => {
  const testDate = new Date("2023-01-15T00:00:00.000Z");

  test("formats with long format by default", () => {
    expect(formatDate(testDate)).toBe("January 15, 2023");
  });

  test("formats with short format", () => {
    expect(formatDate(testDate, "short")).toBe("1/15/23");
  });

  test("formats with medium format", () => {
    expect(formatDate(testDate, "medium")).toBe("Jan 15, 2023");
  });

  test("accepts ISO date strings", () => {
    const result = formatDate("2023-01-15T00:00:00.000Z");
    expect(result).toBe("January 15, 2023");
  });

  test("handles edge case dates", () => {
    const newYearsDay = new Date("2023-01-01");
    expect(formatDate(newYearsDay, "long")).toBe("January 1, 2023");
  });
});

describe("truncateText", () => {
  test("truncates text exceeding max length", () => {
    expect(truncateText("Hello World", 5)).toBe("He...");
  });

  test("preserves text within max length", () => {
    expect(truncateText("Hello", 10)).toBe("Hello");
  });

  test("respects exact max length boundary", () => {
    expect(truncateText("Hello", 5)).toBe("Hello");
    expect(truncateText("Hello World", 6)).toBe("Hel...");
  });

  test("uses custom suffix", () => {
    expect(truncateText("Hello World", 5, "…")).toBe("Hell…");
    expect(truncateText("Hello World", 5, "..")).toBe("Hel..");
  });

  test("handles empty string", () => {
    expect(truncateText("", 5)).toBe("");
  });

  test("handles single character", () => {
    expect(truncateText("A", 1)).toBe("A");
    // When truncating 'AB' with maxLength 1, result is '' + '...' = '...'
    expect(truncateText("AB", 1)).toBe("...");
  });
});

describe("capitalize", () => {
  test("capitalizes first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  test("converts remaining letters to lowercase", () => {
    expect(capitalize("HELLO")).toBe("Hello");
    expect(capitalize("hELLO")).toBe("Hello");
  });

  test("handles single character", () => {
    expect(capitalize("a")).toBe("A");
    expect(capitalize("Z")).toBe("Z");
  });

  test("handles already capitalized strings", () => {
    expect(capitalize("Hello")).toBe("Hello");
  });

  test("handles empty string", () => {
    expect(capitalize("")).toBe("");
  });

  test("handles strings with numbers and symbols", () => {
    expect(capitalize("123abc")).toBe("123abc");
    expect(capitalize("$hello")).toBe("$hello");
  });
});
