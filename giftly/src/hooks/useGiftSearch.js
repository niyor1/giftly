import { useState, useCallback, useRef, useEffect } from "react";

const API_URL = "/api/recommendations";

// ─── Hook ───────────────────────────────────────────────────────────

export default function useGiftSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isDoneRef = useRef(false);
  const abortRef = useRef(null);

  // Normalize a streamed idea into GiftCard-compatible objects
  const normalizeIdea = useCallback((idea) => {
    if (!idea?.products?.length) return [];
    return idea.products.map((product) => ({
      id: `prod_${idea.ideaTitle}_${product.title}_${Date.now()}`,
      title: product.title || "Untitled Product",
      description: "",
      priceRange: product.price || "Price TBD",
      category: "",
      occasion: null,
      imageUrl: product.thumbnail || null,
      rating: 4.5,
      reviewCount: 500,
      badge: null,
      searchQuery: product.title,
      reason: idea.reason || "",
      emoji: idea.emoji || "🎁",
      price: product.price || null,
      thumbnail: product.thumbnail || null,
      productLink: product.productLink || null,
      retailer: product.retailer || null,
    }));
  }, []);

  const search = useCallback(
    async (query, budget) => {
      if (!query.trim()) {
        setError("Please enter a search query.");
        return;
      }

      // Validate input length to reduce prompt injection surface
      if (query.trim().length < 3) {
        setError("Please enter a more detailed description (at least 3 characters).");
        return;
      }
      const safeQuery = query.trim().length > 200 ? query.trim().slice(0, 200) : query.trim();

      // Cancel any in-flight request
      if (abortRef.current) abortRef.current.abort();

      setLoading(true);
      isDoneRef.current = false;
      setError(null);
      setResults([]);

      const budgetRange =
        budget !== null && budget < 500 ? `£0 – £${budget}` : "No strict budget";

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: safeQuery, budgetRange }),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`API returned ${res.status}: ${res.statusText}`);
        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Split into complete SSE events (each ends with \n\n)
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || ""; // keep incomplete event in buffer

          for (const event of parts) {
            if (!event.trim()) continue;

            const lines = event.split("\n");
            let eventType = "";
            let dataStr = "";

            for (const line of lines) {
              if (line.startsWith("event: ")) {
                eventType = line.slice(7).trim();
              } else if (line.startsWith("data: ")) {
                dataStr = line.slice(6).trim();
              }
            }

            if (!eventType || !dataStr) continue;

            if (eventType === "idea") {
              try {
                const parsed = JSON.parse(dataStr);
                const normalized = normalizeIdea(parsed);
                setResults((prev) => [...prev, ...normalized]);
                console.log("[useGiftSearch] Streamed idea:", parsed.ideaTitle, "products:", normalized.length);
              } catch {
                // Invalid JSON — ignore
              }
            } else if (eventType === "done") {
              isDoneRef.current = true;
              setLoading(false);
            } else if (eventType === "error") {
              try {
                const parsed = JSON.parse(dataStr);
                setError(parsed.message || "Gift recommendation service encountered an error.");
              } catch {
                setError("Gift recommendation service encountered an error.");
              }
              isDoneRef.current = true;
              setLoading(false);
            }
          }
        }

        // Stream ended without a done event — treat as complete
        if (!isDoneRef.current) {
          isDoneRef.current = true;
          setLoading(false);
        }
      } catch (err) {
        if (err.name === "AbortError") {
          setError(null);
        } else {
          setError("Cannot connect to the gift recommendation service. Please try again later.");
        }
        isDoneRef.current = true;
        setLoading(false);
      }
    },
    [normalizeIdea],
  );

  // Cleanup on unmount — abort any in-flight request
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { results, loading, error, isDone: isDoneRef, search };
}
