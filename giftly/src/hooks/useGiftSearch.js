import { useState, useCallback, useRef, useEffect } from "react";
import { sanitizeUrl, extractJSON } from "../utils/helpers.js";

const API_URL = "/api/recommendations";
const FETCH_TIMEOUT = Number(import.meta.env.VITE_FETCH_TIMEOUT) || 60_000;

// ─── Hook ───────────────────────────────────────────────────────────

export default function useGiftSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  // Build Amazon UK affiliate URL from a search query
  const amazonURL = useCallback(
    (query) => {
      // Use helpers.buildAmazonURL if available, otherwise default
      return `https://www.amazon.co.uk/s?k=${encodeURIComponent(query)}`;
    },
    [],
  );

  // Transform a single product from the new response shape into GiftCard-compatible shape
  const normalizeProduct = useCallback(
    (product, ideaTitle) => {
      return {
        id: `prod_${ideaTitle}_${product.title}_${Date.now()}`,
        title: product.title || "Untitled Product",
        description: "",
        priceRange: product.price || "Price TBD",
        category: "",
        occasion: null,
        imageUrl: sanitizeUrl(product.thumbnail) || null,
        affiliateUrl: sanitizeUrl(amazonURL(product.title)),
        rating: 4.5,
        reviewCount: 500,
        badge: null,
        searchQuery: product.title,
        reason: "",
        emoji: "🎁",
        price: product.price || null,
        thumbnail: product.thumbnail || null,
        productLink: sanitizeUrl(product.productLink) || sanitizeUrl(amazonURL(product.title)),
        retailer: product.retailer || null,
      };
    },
    [amazonURL],
  );

  // Legacy normalizer for old response shape (kept as fallback)
  const normalizeGift = useCallback(
    (raw, index) => {
      const priceRange =
        raw.priceRange ||
        (raw.minPrice && raw.maxPrice
          ? `£${raw.minPrice} – £${raw.maxPrice}`
          : "Price TBD");

      return {
        id: `ai_${index}_${Date.now()}`,
        title: raw.title || "Untitled Gift",
        description: raw.description || "",
        priceRange,
        category: raw.category || "Gift Idea",
        occasion: raw.occasion || null,
        imageUrl: sanitizeUrl(raw.imageUrl) || null,
        affiliateUrl: sanitizeUrl(amazonURL(raw.searchQuery || raw.title)),
        rating: raw.rating || 4.5,
        reviewCount: raw.reviewCount ?? 500,
        badge: raw.badge || null,
        searchQuery: raw.searchQuery || raw.title,
        reason: raw.reason || "",
        emoji: raw.emoji || "🎁",
        price: raw.price || null,
        thumbnail: raw.thumbnail || null,
        productLink: raw.productLink || sanitizeUrl(amazonURL(raw.searchQuery || raw.title)),
        retailer: raw.retailer || null,
      };
    },
    [amazonURL],
  );

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
      setError(null);
      setResults([]);

      const budgetRange =
        budget !== null && budget < 500 ? `£0 – £${budget}` : "No strict budget";

      // Shared fetch wrapper with timeout
      async function fetchWithTimeout() {
        const controller = new AbortController();
        abortRef.current = controller;
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
        try {
          const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: safeQuery, budgetRange }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (!res.ok) throw new Error(`API returned ${res.status}: ${res.statusText}`);
          return res.json();
        } finally {
          clearTimeout(timeoutId);
        }
      }

      // Normalize raw API response into GiftCard-compatible flat array
      function normalize(raw) {
        // New shape: { ideas: [{ ideaTitle, products: [...] }] }
        if (raw?.ideas && Array.isArray(raw.ideas)) {
          const flat = [];
          raw.ideas.forEach((idea) => {
            if (idea.products && Array.isArray(idea.products)) {
              idea.products.forEach((product) => {
                flat.push(normalizeProduct(product, idea.ideaTitle));
              });
            }
          });
          return flat;
        }
        // Fallback: old shape (array of gift objects)
        if (Array.isArray(raw)) return raw.map((item, i) => normalizeGift(item, i));
        return [];
      }

      // Validate response is usable
      function validateResponse(data) {
        // New shape — ideas array
        if (data?.ideas && Array.isArray(data.ideas)) return true;
        // Old shape — direct array
        if (Array.isArray(data)) return true;
        // Try extracting JSON from text response
        const json = extractJSON(JSON.stringify(data));
        return json && Array.isArray(json);
      }

      // Fetch with retry logic
      let lastErr = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const data = await fetchWithTimeout();
          console.log("Raw API response:", data);

          if (!validateResponse(data)) {
            throw new Error(attempt === 1 ? "API did not return a valid JSON array." : "API did not return a valid JSON array on retry.");
          }

          setResults(normalize(data));
          setLoading(false);
          return; // success — exit
        } catch (err) {
          lastErr = err;

          if (err.name === "AbortError") {
            setError("Request timed out after 60 seconds. The AI service may be slow or unavailable.");
            setLoading(false);
            return;
          }

          // Network error — serverless endpoint unreachable
          if (err instanceof TypeError) {
            setError("Cannot connect to the gift recommendation service. Please try again later.");
            setLoading(false);
            return;
          }

          // First failure — retry on second attempt
          if (attempt === 1) continue;
        }
      }

      // Both attempts failed
      setError(lastErr?.message || "Failed to fetch gift ideas from the AI service.");
      setLoading(false);
    },
    [normalizeProduct, normalizeGift],
  );

  // Cleanup on unmount — abort any in-flight request
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { results, loading, error, search, amazonURL };
}
