import { describe, expect, test } from "vitest";
import { profileSchema } from "./profile.validators";

describe("Profile Validators", () => {
  test("validates valid profile data", () => {
    const validData = {
      full_name: "John Doe",
      phone: "1234567890",
      address_line1: "123 Main St",
      city: "New York",
      postal_code: "10001",
      country: "USA",
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
      phone: "1234567890",
    };

    const result = profileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test("validates correct types", () => {
    const invalidData = {
      full_name: "John Doe",
      phone: 1234567890, // Should be string
    };

    const result = profileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
