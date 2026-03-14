import { describe, expect, test } from "vitest";
import { validateBusinessHours } from "./site-settings";

describe("validateBusinessHours", () => {
  const validHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
    { day: "Saturday", hours: "10:00 AM - 4:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ];

  test("returns parsed data for valid input", () => {
    expect(validateBusinessHours(validHours)).toEqual(validHours);
  });

  test("returns parsed data for single-entry array", () => {
    const single = [{ day: "Weekdays", hours: "9-5" }];
    expect(validateBusinessHours(single)).toEqual(single);
  });

  test("returns null for empty array", () => {
    expect(validateBusinessHours([])).toBeNull();
  });

  test("returns null for null input", () => {
    expect(validateBusinessHours(null)).toBeNull();
  });

  test("returns null for undefined input", () => {
    expect(validateBusinessHours(undefined)).toBeNull();
  });

  test("returns null for non-array input", () => {
    expect(validateBusinessHours("not an array")).toBeNull();
    expect(validateBusinessHours(42)).toBeNull();
    expect(validateBusinessHours({})).toBeNull();
  });

  test("returns null when entry has empty day", () => {
    expect(validateBusinessHours([{ day: "", hours: "9-5" }])).toBeNull();
  });

  test("returns null when entry has empty hours", () => {
    expect(validateBusinessHours([{ day: "Monday", hours: "" }])).toBeNull();
  });

  test("returns null when entry is missing day field", () => {
    expect(validateBusinessHours([{ hours: "9-5" }])).toBeNull();
  });

  test("returns null when entry is missing hours field", () => {
    expect(validateBusinessHours([{ day: "Monday" }])).toBeNull();
  });

  test("strips extra fields from entries", () => {
    const withExtra = [{ day: "Monday", hours: "9-5", extra: "field" }];
    const result = validateBusinessHours(withExtra);
    expect(result).toEqual([{ day: "Monday", hours: "9-5" }]);
  });
});
