import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useGiftSearch from "../../hooks/useGiftSearch.js";

// ─── Shared test data ──────────────────────────────────────────────

const mockProducts = [
  { title: "Test Product 1", price: "£29.99", thumbnail: null, productLink: null, retailer: "Amazon" },
  { title: "Test Product 2", price: "£49.99", thumbnail: null, productLink: null, retailer: "eBay" },
];

// ─── Tests ────────────────────────────────────────────────────────────

describe("useGiftSearch", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with empty results and no loading/error", () => {
    const { result } = renderHook(() => useGiftSearch());

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isDone.current).toBe(false);
  });

  it("fetches products and sets results", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockProducts,
    });

    const { result } = renderHook(() => useGiftSearch());

    await act(async () => {
      result.current.search("test query", 100);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isDone.current).toBe(true);
    expect(result.current.results).toEqual(mockProducts);
  });

  it("handles network error gracefully", async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError("Network error"));

    const { result } = renderHook(() => useGiftSearch());

    await act(async () => {
      result.current.search("test query", 100);
    });

    expect(result.current.error).toContain("Cannot connect");
    expect(result.current.loading).toBe(false);
    expect(result.current.isDone.current).toBe(true);
  });

  it("rejects short queries (< 3 chars)", async () => {
    const { result } = renderHook(() => useGiftSearch());

    await act(async () => {
      result.current.search("ab", 100);
    });

    expect(result.current.error).toContain("at least 3 characters");
    expect(result.current.loading).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("rejects empty queries", async () => {
    const { result } = renderHook(() => useGiftSearch());

    await act(async () => {
      result.current.search("", 100);
    });

    expect(result.current.error).toContain("search query");
    expect(result.current.loading).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("truncates queries longer than 200 chars", async () => {
    const longQuery = "a".repeat(250);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { result } = renderHook(() => useGiftSearch());

    await act(async () => {
      result.current.search(longQuery, 100);
    });

    expect(result.current.error).toBeNull();
    expect(global.fetch).toHaveBeenCalled();
  });

  it("aborts in-flight request on new search", async () => {
    let resolveFirst;
    const promise = new Promise((resolve) => { resolveFirst = resolve; });

    global.fetch = vi.fn().mockImplementation(() => promise);

    const { result } = renderHook(() => useGiftSearch());

    await act(async () => {
      result.current.search("first query", 100);
    });

    const abortController = global.fetch.mock.calls[0][1].signal;

    await act(async () => {
      result.current.search("second query", 100);
    });

    expect(abortController.aborted).toBe(true);
  });
});
