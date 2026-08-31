import { useState, useCallback, useRef, useEffect } from "react";
import { sanitizeUrl, extractJSON, buildAmazonURL } from "../utils/helpers.js";
import { SYSTEM_PROMPT, STRICTER_SYSTEM_PROMPT } from "../config/ai.js";

const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || "http://localhost:11434/api/chat";
const MODEL = import.meta.env.VITE_OLLAMA_MODEL || "qwen3:35b";
const FETCH_TIMEOUT = Number(import.meta.env.VITE_FETCH_TIMEOUT) || 60_000;

// ─── Hook ───────────────────────────────────────────────────────────

export default function useGiftSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  // Build Amazon UK affiliate URL from a search query
  const amazonURL = useCallback(
    (query) => buildAmazonURL(query),
    [],
  );

  // Transform raw AI response into the shape GiftCard expects
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
        reviewCount: raw.reviewCount ?? 500, // deterministic fallback — avoids StrictMode flicker
        badge: raw.badge || null,
        searchQuery: raw.searchQuery || raw.title,
        reason: raw.reason || "",
        emoji: raw.emoji || "🎁",
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

      const systemPrompt = SYSTEM_PROMPT;

      const userPrompt = `Generate 12 gift ideas for: ${safeQuery}. Budget: ${budgetRange}. Return a JSON array where each object has exactly these fields: title, description, priceRange, category, searchQuery, reason, emoji. The searchQuery field should be a short Amazon search term for that product.`;

      // Retry tracking
      let attempts = 0;
      const maxAttempts = 2;

      while (attempts < maxAttempts) {
        try {
          const controller = new AbortController();
          abortRef.current = controller;

          // Set timeout — kill the fetch after 60s
          const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

          const res = await fetch(OLLAMA_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: MODEL,
              stream: false,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!res.ok) {
            throw new Error(`Ollama API returned ${res.status}: ${res.statusText}`);
          }

          const data = await res.json();
          const rawText = data?.message?.content || "";

          const json = extractJSON(rawText);
          if (!json || !Array.isArray(json) || json.length === 0) {
            throw new Error("Ollama did not return a valid JSON array.");
          }

          // Normalize into GiftCard-compatible shape
          const normalized = json.slice(0, 12).map((item, i) => normalizeGift(item, i));
          setResults(normalized);
          setLoading(false);
          return; // success — exit
        } catch (err) {
          attempts++;

          if (err.name === "AbortError") {
            setError(
              "Request timed out after 60 seconds. Ollama may be slow or not running.",
            );
            setLoading(false);
            return;
          }

          // Network error (TypeError) — Ollama is unreachable
          if (err instanceof TypeError) {
            setError(
              "Cannot connect to Ollama. Make sure it is running at http://localhost:11434.",
            );
            setLoading(false);
            return;
          }

          if (attempts >= maxAttempts) {
            // Second failure — try with stricter prompt
            const stricterSystem = STRICTER_SYSTEM_PROMPT;

            const stricterPrompt = userPrompt + " Remember: output ONLY a JSON array.";

            try {
              const controller = new AbortController();
              abortRef.current = controller;

              const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

              const res = await fetch(OLLAMA_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  model: MODEL,
                  stream: false,
                  messages: [
                    { role: "system", content: stricterSystem },
                    { role: "user", content: stricterPrompt },
                  ],
                }),
                signal: controller.signal,
              });

              clearTimeout(timeoutId);

              if (!res.ok) {
                throw new Error(`Ollama API returned ${res.status}: ${res.statusText}`);
              }

              const data = await res.json();
              const rawText = data?.message?.content || "";

              const json = extractJSON(rawText);
              if (!json || !Array.isArray(json) || json.length === 0) {
                throw new Error("Ollama did not return a valid JSON array on retry either.");
              }

              const normalized = json.slice(0, 12).map((item, i) => normalizeGift(item, i));
              setResults(normalized);
              setLoading(false);
              return;
            } catch (retryErr) {
              if (retryErr.name === "AbortError") {
                setError(
                  "Request timed out after 60 seconds. Ollama may be slow or not running.",
                );
              } else {
                setError(
                  retryErr.message || "Failed to fetch gift ideas from Ollama.",
                );
              }
              setLoading(false);
              return;
            }
          }

          // First failure — retry with stricter prompt
          continue;
        }
      }
    },
    [normalizeGift],
  );

  // Cleanup on unmount — abort any in-flight request
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { results, loading, error, search, amazonURL };
}
