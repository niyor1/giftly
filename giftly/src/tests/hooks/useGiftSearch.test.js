import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useGiftSearch from "../../hooks/useGiftSearch.js";

// ─── Mock fetch ──────────────────────────────────────────────────────

function mockFetchSuccess(jsonResponse) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: "OK",
    json: () => Promise.resolve({ message: { content: JSON.stringify(jsonResponse) } }),
  });
}

function mockFetchMarkdownJson(jsonResponse) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: "OK",
    json: () =>
      Promise.resolve({
        message: { content: "```json\n" + JSON.stringify(jsonResponse) + "\n```" },
      }),
  });
};

function mockFetchInvalidJson() {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: "OK",
    json: () => Promise.resolve({ message: { content: "Here are some gift ideas..." } }),
  });
}

function mockFetchServerError() {
  return vi.fn().mockResolvedValue({
    ok: false,
    status: 500,
    statusText: "Internal Server Error",
  });
}

// ─── Shared test data ─────────────────────────────────────────────────

const mockGifts = [
  {
    title: "Test Gift",
    description: "A test gift",
    priceRange: "£29 – £59",
    category: "Toys & Games",
    searchQuery: "test gift",
    reason: "It's great",
    emoji: "🎁",
  },
];

// ─── Tests ────────────────────────────────────────────────────────────

describe("useGiftSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("starts with empty results and no loading/error", async () => {
    const { result } = renderHook(() => useGiftSearch());

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("calls Ollama and sets results on success", async () => {
    global.fetch.mockImplementation(mockFetchSuccess(mockGifts));

    const { result } = renderHook(() => useGiftSearch());

    await act(async () => {
      result.current.search("test query", 100);
    });

    // Need to advance timers for the fetch timeout
    await vi.advanceTimersByTimeAsync(100);

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].title).toBe("Test Gift");
  });

  it("parses markdown-wrapped JSON response", async () => {
    global.fetch.mockImplementation(mockFetchMarkdownJson(mockGifts));

    const { result } = renderHook(() => useGiftSearch());

    await act(async () => {
      result.current.search("test query", 100);
    });

    await vi.advanceTimersByTimeAsync(100);

    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].title).toBe("Test Gift");
  });

  it("sets error when Ollama returns non-OK status", async () => {
    global.fetch.mockImplementation(mockFetchServerError());

    const { result } = renderHook(() => useGiftSearch());

    await act(async () => {
      result.current.search("test query", 100);
    });

    await vi.advanceTimersByTimeAsync(100);

    expect(result.current.error).toContain("500");
    expect(result.current.loading).toBe(false);
  });

  it("sets error when response contains no valid JSON array", async () => {
    global.fetch.mockImplementation(mockFetchInvalidJson());

    const { result } = renderHook(() => useGiftSearch());

    await act(async () => {
      result.current.search("test query", 100);
    });

    await vi.advanceTimersByTimeAsync(100);

    expect(result.current.error).toContain("valid JSON array");
    expect(result.current.loading).toBe(false);
  });

  it("returns '#' for sanitizeUrl when imageUrl is null", async () => {
    global.fetch.mockImplementation(mockFetchSuccess([
      { ...mockGifts[0], imageUrl: null },
    ]));

    const { result } = renderHook(() => useGiftSearch());

    await act(async () => {
      result.current.search("test query", 100);
    });

    await vi.advanceTimersByTimeAsync(100);

    expect(result.current.results[0].imageUrl).toBe("#");
  });

  it("rejects javascript: URLs via sanitizeUrl", async () => {
    global.fetch.mockImplementation(mockFetchSuccess([
      { ...mockGifts[0], imageUrl: "javascript:alert(1)" },
    ]));

    const { result } = renderHook(() => useGiftSearch());

    await act(async () => {
      result.current.search("test query", 100);
    });

    await vi.advanceTimersByTimeAsync(100);

    expect(result.current.results[0].imageUrl).toBe("#");
  });

  it("rejects data: URLs via sanitizeUrl", async () => {
    global.fetch.mockImplementation(mockFetchSuccess([
      { ...mockGifts[0], imageUrl: "data:text/html,<h1>xss</h1>" },
    ]));

    const { result } = renderHook(() => useGiftSearch());

    await act(async () => {
      result.current.search("test query", 100);
    });

    await vi.advanceTimersByTimeAsync(100);

    expect(result.current.results[0].imageUrl).toBe("#");
  });

  it("rejects short queries (< 3 chars)", async () => {
    global.fetch.mockImplementation(mockFetchSuccess(mockGifts));

    const { result } = renderHook(() => useGiftSearch());

    await act(async () => {
      result.current.search("ab", 100);
    });

    expect(result.current.error).toContain("at least 3 characters");
    expect(result.current.loading).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("truncates queries longer than 200 chars", async () => {
    global.fetch.mockImplementation(mockFetchSuccess(mockGifts));

    const longQuery = "a".repeat(250);
    const { result } = renderHook(() => useGiftSearch());

    await act(async () => {
      result.current.search(longQuery, 100);
    });

    await vi.advanceTimersByTimeAsync(100);

    // Should not error — the hook truncates internally
    expect(result.current.error).toBeNull();
  });

  it("generates correct Amazon affiliate URL", () => {
    const { result } = renderHook(() => useGiftSearch());
    const url = result.current.amazonURL("fishing rod");
    expect(url).toBe("https://www.amazon.co.uk/s?k=fishing+rod&tag=giftly-21");
  });

  it("caps results to 12 items", async () => {
    const manyGifts = Array.from({ length: 20 }, (_, i) => ({
      ...mockGifts[0],
      title: `Gift ${i}`,
    }));

    global.fetch.mockImplementation(mockFetchSuccess(manyGifts));

    const { result } = renderHook(() => useGiftSearch());

    await act(async () => {
      result.current.search("test query", 100);
    });

    await vi.advanceTimersByTimeAsync(100);

    expect(result.current.results).toHaveLength(12);
  });
});
