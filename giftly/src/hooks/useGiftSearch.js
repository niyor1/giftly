import { useState, useCallback, useEffect, useRef } from "react";

const API_URL = "/api/recommendations";

// ─── Hook ───────────────────────────────────────────────────────────

export default function useGiftSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isDoneRef = useRef(false);
  const abortRef = useRef(null);

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

        const products = await res.json();
        setResults(products);
        isDoneRef.current = true;
        setLoading(false);
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
    [],
  );

  // Cleanup on unmount — abort any in-flight request
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { results, loading, error, isDone: isDoneRef, search };
}
