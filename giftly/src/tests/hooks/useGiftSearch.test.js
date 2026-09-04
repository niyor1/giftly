import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useGiftSearch from "../../hooks/useGiftSearch.js";

// ─── SSE event helper ──────────────────────────────────────────────

function sseEvent(type, data) {
  return `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
}

function mockSSEStream(events) {
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(event));
      }
      controller.close();
    },
  });

  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: "OK",
    body,
  });
}

function mockNetworkError() {
  global.fetch = vi.fn().mockRejectedValue(new TypeError("Network error"));
}

// ─── Shared test data ──────────────────────────────────────────────

const mockIdea = {
  ideaTitle: "Test Gift Idea",
  description: "A test gift",
  reason: "It's great",
  emoji: "🎁",
  category: "Gift Idea",
  products: [{ title: "Test Product", price: "£29.99", thumbnail: null, productLink: null, retailer: "Amazon" }],
};

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

  it("streams ideas and appends products progressively", async () => {
    const events = [
      sseEvent("idea", mockIdea),
      sseEvent("done", {}),
    ];
    mockSSEStream(events);

    const { result } = renderHook(() => useGiftSearch());

    await act(async () => {
      result.current.search("test query", 100);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isDone.current).toBe(true);
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].title).toBe("Test Product");
  });

  it("appends multiple streamed ideas", async () => {
    const events = [
      sseEvent("idea", { ...mockIdea, ideaTitle: "Idea 1" }),
      sseEvent("idea", { ...mockIdea, ideaTitle: "Idea 2" }),
      sseEvent("done", {}),
    ];
    mockSSEStream(events);

    const { result } = renderHook(() => useGiftSearch());

    await act(async () => {
      result.current.search("test query", 100);
    });

    expect(result.current.results).toHaveLength(2);
    expect(result.current.isDone.current).toBe(true);
  });

  it("handles server error event", async () => {
    const events = [
      sseEvent("error", { message: "Service unavailable" }),
    ];
    mockSSEStream(events);

    const { result } = renderHook(() => useGiftSearch());

    await act(async () => {
      result.current.search("test query", 100);
    });

    expect(result.current.error).toContain("Service unavailable");
    expect(result.current.loading).toBe(false);
    expect(result.current.isDone.current).toBe(true);
  });

  it("handles network error gracefully", async () => {
    mockNetworkError();

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
    mockSSEStream([sseEvent("done", {})]);

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
