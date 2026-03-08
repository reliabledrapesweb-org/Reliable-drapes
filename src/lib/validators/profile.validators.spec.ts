import { describe, expect, test } from "vitest";
import fc from "fast-check";
import { indianPhoneSchema, profileSchema } from "./profile.validators";

describe("indianPhoneSchema", () => {
  test("accepts valid 10-digit Indian mobile numbers", () => {
    const valid = ["9876543210", "6000000000", "7123456789", "8999999999"];
    for (const num of valid) {
      expect(indianPhoneSchema.safeParse(num).success).toBe(true);
    }
  });

  test("rejects numbers not starting with 6-9", () => {
    const invalid = ["5876543210", "0123456789", "1234567890", "4999999999"];
    for (const num of invalid) {
      expect(indianPhoneSchema.safeParse(num).success).toBe(false);
    }
  });

  test("rejects wrong length", () => {
    const invalid = ["987654321", "98765432101", ""];
    for (const num of invalid) {
      expect(indianPhoneSchema.safeParse(num).success).toBe(false);
    }
  });

  test("rejects non-digit characters", () => {
    const invalid = ["98765abcde", "987-654-3210", "+919876543210"];
    for (const num of invalid) {
      expect(indianPhoneSchema.safeParse(num).success).toBe(false);
    }
  });

  test("all valid phones are exactly 10 digits starting with 6-9", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 6, max: 9 }),
        fc.stringMatching(/^\d{9}$/),
        (first, rest) => {
          const phone = `${first}${rest}`;
          expect(indianPhoneSchema.safeParse(phone).success).toBe(true);
        },
      ),
    );
  });
});

describe("profileSchema", () => {
  test("validates valid profile data", () => {
    const validData = {
      full_name: "John Doe",
      phone: "9876543210",
      address_line1: "123 Main St",
      city: "Mumbai",
      postal_code: "400001",
      country: "India",
    };

    const result = profileSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  test("allows optional fields to be omitted", () => {
    const validData = {
      full_name: "John Doe",
    };

    const result = profileSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  test("allows empty string for phone", () => {
    const validData = {
      full_name: "John Doe",
      phone: "",
    };

    const result = profileSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  test("fails when full_name is too short", () => {
    const invalidData = {
      full_name: "J",
    };

    const result = profileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Name must be at least 2 characters",
      );
    }
  });

  test("fails when full_name is missing", () => {
    const invalidData = {
      phone: "9876543210",
    };

    const result = profileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test("validates correct types", () => {
    const invalidData = {
      full_name: "John Doe",
      phone: 1234567890,
    };

    const result = profileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test("rejects invalid phone in profile", () => {
    const invalidData = {
      full_name: "John Doe",
      phone: "1234567890",
    };

    const result = profileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
