import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useWishlist from "../../hooks/useWishlist.js";

// ─── localStorage mock ────────────────────────────────────────────────

function createLocalStorageMock() {
  const store = new Map();
  return {
    getItem: vi.fn((key) => store.get(key) ?? null),
    setItem: vi.fn((key, value) => store.set(key, value)),
    removeItem: vi.fn((key) => store.delete(key)),
    clear: vi.fn(() => store.clear()),
    get length() { return store.size; },
    get key() { return vi.fn((i) => [...store.keys()][i] ?? null); },
  };
}

// ─── Shared test data ─────────────────────────────────────────────────

const mockGift = { id: 42, title: "Test Gift", priceRange: "£10 – £20" };

// ─── Tests ────────────────────────────────────────────────────────────

describe("useWishlists", () => {
  let lsMock;

  beforeEach(() => {
    lsMock = createLocalStorageMock();
    Object.defineProperty(global, "localStorage", {
      value: lsMock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("flat IDs (backward compat)", () => {
    it("starts with empty ids set", () => {
      const { result } = renderHook(() => useWishlist());
      expect(result.current.ids.size).toBe(0);
    });

    it("toggles a gift ID into the flat store", async () => {
      const { result } = renderHook(() => useWishlist());

      await act(async () => {
        result.current.toggle(mockGift.id);
      });

      expect(result.current.ids.has(mockGift.id)).toBe(true);
    });

    it("removes a gift ID when toggled again", async () => {
      const { result } = renderHook(() => useWishlist());

      await act(async () => {
        result.current.toggle(mockGift.id);
        result.current.toggle(mockGift.id);
      });

      expect(result.current.ids.has(mockGift.id)).toBe(false);
    });

    it("persists flat IDs to localStorage", async () => {
      const { result } = renderHook(() => useWishlist());

      await act(async () => {
        result.current.toggle(mockGift.id);
      });

      expect(lsMock.setItem).toHaveBeenCalledWith(
        "giftly_wishlist_ids",
        expect.any(String),
      );
    });

    it("clears flat IDs", async () => {
      const { result } = renderHook(() => useWishlist());

      await act(async () => {
        result.current.toggle(mockGift.id);
        result.current.clear();
      });

      expect(result.current.ids.has(mockGift.id)).toBe(false);
    });
  });

  describe("has()", () => {
    it("returns true when gift is in flat IDs", async () => {
      const { result } = renderHook(() => useWishlist());

      await act(async () => {
        result.current.toggle(mockGift.id);
      });

      expect(result.current.has(mockGift.id)).toBe(true);
    });

    it("returns false when gift is not wishlisted", async () => {
      const { result } = renderHook(() => useWishlist());
      expect(result.current.has(mockGift.id)).toBe(false);
    });
  });

  describe("named lists CRUD", () => {
    it("creates a new named list", async () => {
      const { result } = renderHook(() => useWishlist());

      await act(async () => {
        result.current.createList("Birthday gifts");
      });

      expect(result.current.wishlists).not.toBeNull();
      expect(Object.keys(result.current.wishlists.lists)).toHaveLength(1);
    });

    it("persists named lists to localStorage when created", async () => {
      const { result } = renderHook(() => useWishlist());

      await act(async () => {
        result.current.createList("Birthday gifts");
      });

      // createList calls saveNamedLists internally (inline persistence)
      expect(lsMock.setItem).toHaveBeenCalledWith(
        "giftly_wishlists",
        expect.any(String),
      );
    });

    it("adds an item to the active list", async () => {
      const { result } = renderHook(() => useWishlist());

      await act(async () => {
        result.current.createList("Test list");
        result.current.addItem(mockGift);
      });

      // Access via the keys of lists since activeId may have changed
      const listKeys = Object.keys(result.current.wishlists.lists);
      expect(listKeys).toHaveLength(1);
      const items = result.current.wishlists.lists[listKeys[0]].items;
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe(mockGift.id);
    });

    it("prevents duplicate items in a list", async () => {
      const { result } = renderHook(() => useWishlist());

      await act(async () => {
        result.current.createList("Test list");
        result.current.addItem(mockGift);
        result.current.addItem({ ...mockGift, title: "Duplicate" });
      });

      const listKeys = Object.keys(result.current.wishlists.lists);
      const items = result.current.wishlists.lists[listKeys[0]].items;
      expect(items).toHaveLength(1);
    });

    it("removes an item from the active list", async () => {
      const { result } = renderHook(() => useWishlist());

      await act(async () => {
        result.current.createList("Test list");
        result.current.addItem(mockGift);
        result.current.removeItem(mockGift.id);
      });

      const listKeys = Object.keys(result.current.wishlists.lists);
      const items = result.current.wishlists.lists[listKeys[0]].items;
      expect(items).toHaveLength(0);
    });

    it("clears all items from the active list", async () => {
      const { result } = renderHook(() => useWishlist());

      await act(async () => {
        result.current.createList("Test list");
        result.current.addItem(mockGift);
        result.current.clearAllItems();
      });

      const listKeys = Object.keys(result.current.wishlists.lists);
      const items = result.current.wishlists.lists[listKeys[0]].items;
      expect(items).toHaveLength(0);
    });

    it("deletes a named list", async () => {
      // Pre-seed two lists in localStorage so the hook reads them on mount
      const seed = {
        activeId: "list_1",
        lists: {
          list_1: { name: "List 1", items: [] },
          list_2: { name: "List 2", items: [] },
        },
      };
      lsMock.setItem("giftly_wishlists", JSON.stringify(seed));

      const { result } = renderHook(() => useWishlist());

      expect(Object.keys(result.current.wishlists.lists)).toHaveLength(2);

      await act(async () => {
        result.current.deleteList("list_1");
      });

      expect(Object.keys(result.current.wishlists.lists)).toHaveLength(1);
    });

    it("prevents deleting the last list", async () => {
      const { result } = renderHook(() => useWishlist());

      await act(async () => {
        result.current.createList("Only list");
      });

      const initialCount = Object.keys(result.current.wishlists.lists).length;
      const id = Object.keys(result.current.wishlists.lists)[0];

      await act(async () => {
        result.current.deleteList(id);
      });

      // Should still have exactly one list (cannot delete the last)
      expect(Object.keys(result.current.wishlists.lists)).toHaveLength(initialCount);
    });
  });
});
