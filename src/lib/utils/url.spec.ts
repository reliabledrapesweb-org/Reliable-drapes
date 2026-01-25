import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { getBaseUrl } from "./url";

describe("URL Utils", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test("returns NEXT_PUBLIC_APP_URL when set", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://myapp.com";
    process.env.VERCEL_URL = "vercel-deploy.com";

    expect(getBaseUrl()).toBe("https://myapp.com");
  });

  test("returns Vercel URL when NEXT_PUBLIC_APP_URL is missing", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.VERCEL_URL = "vercel-deploy.com";

    expect(getBaseUrl()).toBe("https://vercel-deploy.com");
  });

  test("falls back to localhost when no env vars are set", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_URL;

    expect(getBaseUrl()).toBe("http://localhost:3000");
  });
});
