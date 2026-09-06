import { useState, useCallback, useRef, useEffect } from "react";

const API_URL = "/api/recommendations";

// ─── Hook ───────────────────────────────────────────────────────────

export default function useGiftSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isDoneRef = useRef(false);
  const abortRef = useRef(null);

  // Return idea objects as-is from the API (each with a .products array)
  const normalizeIdea = useCallback((idea) => {
    if (!idea) return null;
    return idea;
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

        // Log the raw response body as it arrives (SSE stream)
        const rawReader = res.body.getReader();
        const rawDecoder = new TextDecoder();
        let rawBuffer = "";
        const rawStream = new ReadableStream({
          start(controller) {
            function push() {
              rawReader.read().then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }
                rawBuffer += rawDecoder.decode(value, { stream: true });
                console.log("[useGiftSearch] Raw API response chunk:", rawBuffer);
                controller.enqueue(value);
                push();
              });
            }
            push();
          },
        });

        const reader = rawStream.getReader();
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
                console.log("[useGiftSearch] Parsed idea:", parsed.ideaTitle, "products:", parsed.products?.length ?? 0);
                const normalized = normalizeIdea(parsed);
                setResults((prev) => [...prev, normalized]);
                console.log("[useGiftSearch] Total results in state:", prev.length + 1);
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
