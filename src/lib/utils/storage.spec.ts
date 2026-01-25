import { describe, expect, test, vi, beforeEach } from "vitest";
import { uploadFile, deleteFile, validateFile } from "./storage";

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  supabaseClient: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
        remove: vi.fn(),
      })),
    },
  },
}));

import { supabaseClient } from "@/lib/supabase/client";

describe("Storage Utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("uploadFile", () => {
    const mockFile = new File(["test content"], "test.png", {
      type: "image/png",
    });

    test("successfully uploads file and returns URL", async () => {
      const mockUpload = vi
        .fn()
        .mockResolvedValue({ data: { path: "folder/test.png" }, error: null });
      const mockGetPublicUrl = vi
        .fn()
        .mockReturnValue({
          data: { publicUrl: "https://example.com/test.png" },
        });

      (supabaseClient!.storage.from as any).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      });

      const result = await uploadFile(mockFile, "test-bucket", "folder");

      expect(result.success).toBe(true);
      expect(result.url).toBe("https://example.com/test.png");
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringContaining("folder/"),
        mockFile,
        expect.any(Object),
      );
    });

    test("returns error when upload fails", async () => {
      const mockUpload = vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: "Upload failed" } });

      (supabaseClient!.storage.from as any).mockReturnValue({
        upload: mockUpload,
      });

      const result = await uploadFile(mockFile, "test-bucket");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Upload failed");
    });

    test("handles unexpected exceptions", async () => {
      (supabaseClient!.storage.from as any).mockReturnValue({
        upload: vi.fn().mockRejectedValue(new Error("Network error")),
      });

      const result = await uploadFile(mockFile, "test-bucket");

      expect(result.success).toBe(false);
      expect(result.error).toBe("An unexpected error occurred during upload");
    });
  });

  describe("deleteFile", () => {
    test("successfully deletes file", async () => {
      const mockRemove = vi.fn().mockResolvedValue({ error: null });

      (supabaseClient!.storage.from as any).mockReturnValue({
        remove: mockRemove,
      });

      const url =
        "https://supabase.co/storage/v1/object/public/test-bucket/folder/file.png";
      const result = await deleteFile(url, "test-bucket");

      expect(result.success).toBe(true);
      expect(mockRemove).toHaveBeenCalledWith(["folder/file.png"]);
    });

    test("returns error for invalid URL", async () => {
      const result = await deleteFile("https://invalid-url.com", "test-bucket");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid file URL");
    });

    test("returns error when deletion fails", async () => {
      const mockRemove = vi
        .fn()
        .mockResolvedValue({ error: { message: "Delete failed" } });

      (supabaseClient!.storage.from as any).mockReturnValue({
        remove: mockRemove,
      });

      const url =
        "https://supabase.co/storage/v1/object/public/test-bucket/file.png";
      const result = await deleteFile(url, "test-bucket");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Delete failed");
    });
  });

  describe("validateFile", () => {
    const validFile = new File(["x".repeat(1024)], "test.png", {
      type: "image/png",
    });

    test("returns valid for correct type and size", () => {
      const result = validateFile(validFile, ["image/png"], 1);
      expect(result.valid).toBe(true);
    });

    test("returns invalid for incorrect type", () => {
      const result = validateFile(validFile, ["image/jpeg"], 1);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid file type");
    });

    test("returns invalid for exceeding size limit", () => {
      // 1024 bytes file, limit 0.0001 MB (approx 100 bytes)
      const result = validateFile(validFile, ["image/png"], 0.0001);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("File size exceeds");
    });
  });
});
