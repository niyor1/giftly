// ─── URL sanitization ───────────────────────────────────────────────

// Validate and sanitize a URL — rejects non-http/https protocols to prevent XSS
export function sanitizeUrl(url) {
  if (!url || typeof url !== "string") return "#";
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return "#";
    return parsed.href;
  } catch {
    // Invalid URL (e.g., javascript: or data:) — reject it
    return "#";
  }
}

// ─── JSON extraction helpers ────────────────────────────────────────

// Try to find a JSON array in the response text — handles markdown-wrapped or raw JSON
export function extractJSON(text) {
  const trimmed = text.trim();

  // Try direct parse first (raw JSON)
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // not raw JSON, keep looking
  }

  // Look for ```json ... ``` blocks
  const jsonBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    try {
      const parsed = JSON.parse(jsonBlockMatch[1].trim());
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // not valid JSON in block, keep looking
    }
  }

  // Look for [ ... ] by scanning for the first [ and matching ]
  const firstBracket = trimmed.indexOf("[");
  if (firstBracket === -1) return null;

  let depth = 0;
  let endBracket = -1;
  for (let i = firstBracket; i < trimmed.length; i++) {
    if (trimmed[i] === "[") depth++;
    if (trimmed[i] === "]") {
      depth--;
      if (depth === 0) {
        endBracket = i;
        break;
      }
    }
  }

  if (endBracket === -1) return null;

  const candidate = trimmed.slice(firstBracket, endBracket + 1);
  try {
    const parsed = JSON.parse(candidate);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // not valid JSON
  }

  return null;
}

// ─── Price parsing helpers ──────────────────────────────────────────

// Price range string like "$29 – $59" or "£19 – £75" → [min, max] numbers (null when unparseable)
export function parsePriceRange(pr) {
  if (!pr) return [null, null];
  const parts = pr.replace(/[$£\s]/g, "").split("–");
  return parts.map((p) => (p ? Number(p) : null));
}

// Extract first number from a price string like "£29" or "$19 – $75" → returns the number
export function parsePriceForSort(pr) {
  if (!pr) return null;
  const match = String(pr).match(/£?\s*(\d+)/);
  return match ? Number(match[1]) : null;
}

// ─── Budget extraction helpers ──────────────────────────────────────

// Extract budget from a query string like "dad fishing £50" or "gift for $100"
export function extractBudget(query) {
  if (!query) return null;
  const match = query.match(/[$£€¥]\s*(\d+)/);
  return match ? Number(match[1]) : null;
}

// ─── Amazon affiliate URL builder ───────────────────────────────────

// Build Amazon UK affiliate URL from a search query
export function buildAmazonURL(query) {
  const encoded = encodeURIComponent(query).replace(/%20/g, "+");
  return `https://www.amazon.co.uk/s?k=${encoded}&tag=giftly-21`;
}

// ─── Image placeholder builder ──────────────────────────────────────

// Build a safe image URL from text — rejects javascript: / data: inputs
export function buildPlaceholderImage(text) {
  if (!text || typeof text !== "string") return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  // Reject known dangerous protocol prefixes (javascript:, data:, vbscript:)
  if (/^[\w+.-]+:/i.test(trimmed)) return null;
  const encoded = encodeURIComponent(trimmed);
  return `https://placehold.co/600x400/e2e8f0/475569?text=${encoded}`;
}

// ─── Wishlists storage helpers ──────────────────────────────────────

const FLAT_STORAGE_KEY = "giftly_wishlist_ids";
const NAMED_STORAGE_KEY = "giftly_wishlists";

export function loadFlatIds() {
  try {
    const raw = localStorage.getItem(FLAT_STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function saveFlatIds(ids) {
  localStorage.setItem(FLAT_STORAGE_KEY, JSON.stringify([...ids]));
}

export function loadNamedLists() {
  try {
    const raw = localStorage.getItem(NAMED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveNamedLists(wishlists) {
  localStorage.setItem(NAMED_STORAGE_KEY, JSON.stringify(wishlists));
}
