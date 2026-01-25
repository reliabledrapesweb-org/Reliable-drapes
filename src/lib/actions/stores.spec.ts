import { describe, test, expect, vi, beforeEach } from "vitest";
import {
  getStores,
  getAllStoresAdmin,
  createStore,
  updateStore,
  deleteStore,
  searchStores,
} from "./stores";

// Helper function to create chainable mock
function createChainableMock(finalValue: any) {
  const chainable: any = {};
  const methods = [
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "neq",
    "order",
    "single",
    "or",
  ];

  methods.forEach((method) => {
    chainable[method] = vi.fn().mockImplementation(() => {
      if (method === "single") {
        return Promise.resolve(finalValue);
      }
      return chainable;
    });
  });

  chainable.then = (resolve: any) => Promise.resolve(finalValue).then(resolve);

  return chainable;
}

// Mock Supabase clients
const mockAnonClient = {
  from: vi.fn(),
};

const mockAdminClient = {
  from: vi.fn(),
};

vi.mock("@/lib/supabase/anon", () => ({
  getAnonSupabase: () => mockAnonClient,
}));

vi.mock("@/lib/supabase/admin", () => ({
  getAdminSupabase: () => mockAdminClient,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Store Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getStores", () => {
    test("fetches active stores successfully", async () => {
      const mockStores = [{ id: "store-1", name: "Store 1", is_active: true }];
      const chainable = createChainableMock({ data: mockStores, error: null });
      mockAnonClient.from.mockReturnValue(chainable);

      const result = await getStores();

      expect(result.success).toBe(true);
      expect(result.stores).toEqual(mockStores);
      expect(chainable.eq).toHaveBeenCalledWith("is_active", true);
    });

    test("handles fetch error", async () => {
      const chainable = createChainableMock({
        data: null,
        error: { message: "Fetch failed" },
      });
      mockAnonClient.from.mockReturnValue(chainable);

      const result = await getStores();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to fetch stores");
    });
  });

  describe("getAllStoresAdmin", () => {
    test("fetches all stores successfully", async () => {
      const mockStores = [
        { id: "store-1", name: "Store 1", is_active: true },
        { id: "store-2", name: "Store 2", is_active: false },
      ];
      const chainable = createChainableMock({ data: mockStores, error: null });
      mockAdminClient.from.mockReturnValue(chainable);

      const result = await getAllStoresAdmin();

      expect(result.success).toBe(true);
      expect(result.stores).toEqual(mockStores);
      expect(mockAdminClient.from).toHaveBeenCalledWith("stores");
    });
  });

  describe("createStore", () => {
    test("creates store successfully", async () => {
      const newStore = {
        name: "New Store",
        address: "123 Main St",
        city: "City",
        country: "Country",
      };

      const createdStore = { id: "store-1", ...newStore, is_active: true };
      const chainable = createChainableMock({
        data: createdStore,
        error: null,
      });
      mockAdminClient.from.mockReturnValue(chainable);

      const result = await createStore(newStore);

      expect(result.success).toBe(true);
      expect(result.store).toEqual(createdStore);
      expect(chainable.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: "New Store" }),
        ]),
      );
    });

    test("handles creation error", async () => {
      const chainable = createChainableMock({
        data: null,
        error: { message: "Insert failed" },
      });
      mockAdminClient.from.mockReturnValue(chainable);

      const result = await createStore({} as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to create store");
    });
  });

  describe("updateStore", () => {
    test("updates store successfully", async () => {
      const updates = { name: "Updated Store" };
      const updatedStore = { id: "store-1", name: "Updated Store" };

      const chainable = createChainableMock({
        data: updatedStore,
        error: null,
      });
      mockAdminClient.from.mockReturnValue(chainable);

      const result = await updateStore("store-1", updates);

      expect(result.success).toBe(true);
      expect(result.store).toEqual(updatedStore);
      expect(chainable.update).toHaveBeenCalledWith(
        expect.objectContaining(updates),
      );
      expect(chainable.eq).toHaveBeenCalledWith("id", "store-1");
    });

    test("handles update error", async () => {
      const chainable = createChainableMock({
        data: null,
        error: { message: "Update failed" },
      });
      mockAdminClient.from.mockReturnValue(chainable);

      const result = await updateStore("store-1", { name: "Test" });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to update store");
    });
  });

  describe("deleteStore", () => {
    test("deletes store successfully", async () => {
      const chainable = createChainableMock({ error: null });
      mockAdminClient.from.mockReturnValue(chainable);

      const result = await deleteStore("store-1");

      expect(result.success).toBe(true);
      expect(chainable.delete).toHaveBeenCalled();
      expect(chainable.eq).toHaveBeenCalledWith("id", "store-1");
    });

    test("handles deletion error", async () => {
      const chainable = createChainableMock({
        error: { message: "Delete failed" },
      });
      mockAdminClient.from.mockReturnValue(chainable);

      const result = await deleteStore("store-1");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to delete store");
    });
  });

  describe("searchStores", () => {
    test("searches stores successfully", async () => {
      const mockStores = [{ id: "store-1", name: "Search Match" }];
      const chainable = createChainableMock({ data: mockStores, error: null });
      mockAnonClient.from.mockReturnValue(chainable);

      const result = await searchStores("search");

      expect(result.success).toBe(true);
      expect(result.stores).toEqual(mockStores);
      expect(chainable.or).toHaveBeenCalledWith(
        expect.stringContaining("name.ilike.%search%"),
      );
    });
  });
});
