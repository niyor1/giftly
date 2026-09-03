import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── URL sanitization ────────────────────────────────────────────────

function sanitizeUrl(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const parsed = new URL(url);
    if (["http:", "https:"].includes(parsed.protocol)) return parsed.href;
    return null;
  } catch {
    return null;
  }
}

const SYSTEM_PROMPT =
  "You are a gift recommendation expert. Respond with ONLY a valid JSON array. " +
  "No markdown, no backticks, no explanation. Just raw JSON. Avoid generic " +
  "suggestions. Be specific with product names and brands. Always stay within budget.";

// ─── SerpApi helpers ────────────────────────────────────────────────

/**
 * Fetch Google Shopping results from SerpApi for a single search query.
 * Returns the first product result, or null on failure / no results.
 */
async function fetchProduct(searchQuery) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey || apiKey === "your_serpapi_key_here") return null;

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_shopping");
  url.searchParams.set("q", searchQuery);
  url.searchParams.set("gl", "uk");
  url.searchParams.set("hl", "en");
  url.searchParams.set("api_key", apiKey);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    if (!res.ok) return null;
    const data = await res.json();
    const products = data?.shopping_results || [];
    if (!products.length) return null;
    const p = products[0];

    // Multi-level product link priority:
    // 1. result.link (direct shopping URL)
    // 2. result.product_link (alternative SerpApi field)
    // 3. sellers_results.online_sellers[0].link (first online seller)
    const rawProductLink =
      p.link ||
      p.product_link ||
      p.sellers_results?.online_sellers?.[0]?.link ||
      null;

    return {
      title: p.title || searchQuery,
      price: p.price || null,
      thumbnail: p.thumbnail || p.img_url || null,
      link: sanitizeUrl(p.link) || null,
      productLink: sanitizeUrl(rawProductLink) || null,
      source: p.source || null,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Main handler ───────────────────────────────────────────────────

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query, budgetRange } = req.body || {};
  if (!query || !budgetRange) {
    return res.status(400).json({ error: "Missing query or budgetRange" });
  }

  const userMessage = `Generate 12 gift ideas for: ${query}. Budget: ${budgetRange}. Return a JSON array where each object has exactly these fields: title, description, priceRange, category, searchQuery, reason, emoji. The searchQuery field should be a short Amazon UK search term for that product.`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const result = await model.generateContent([SYSTEM_PROMPT, userMessage]);
    const text = result.response.text();

    // Parse the raw JSON array from Gemini's response
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Try to extract JSON block if wrapped in markdown
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        parsed = JSON.parse(match[1].trim());
      } else {
        // Fallback: find first [ and matching ]
        const firstBracket = text.indexOf("[");
        if (firstBracket === -1) throw new Error("No JSON array found in response");
        let depth = 0;
        let endBracket = -1;
        for (let i = firstBracket; i < text.length; i++) {
          if (text[i] === "[") depth++;
          if (text[i] === "]") {
            depth--;
            if (depth === 0) {
              endBracket = i;
              break;
            }
          }
        }
        if (endBracket === -1) throw new Error("No JSON array found in response");
        parsed = JSON.parse(text.slice(firstBracket, endBracket + 1));
      }
    }

    if (!Array.isArray(parsed)) {
      throw new Error("Response was not a JSON array");
    }

    // Fetch real product data from SerpApi in batches of 3
    const BATCH_SIZE = 3;
    const merged = [];

    for (let i = 0; i < parsed.length; i += BATCH_SIZE) {
      const batch = parsed.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async (item) => {
          const product = await fetchProduct(item.searchQuery || item.title);

          // Fallback: Amazon UK search link if no SerpApi result
          const fallbackLink = `https://www.amazon.co.uk/s?k=${encodeURIComponent(item.searchQuery || item.title)}`;

          // Build productLink with full priority chain + sanitizeUrl validation
          const rawProductLink =
            product?.link ||
            product?.product_link ||
            product?.sellers_results?.online_sellers?.[0]?.link ||
            null;
          const resolvedProductLink = sanitizeUrl(rawProductLink) || fallbackLink;

          return {
            ...item,
            price: product?.price || null,
            thumbnail: product?.thumbnail || null,
            productLink: resolvedProductLink,
            retailer: product?.source || "Amazon UK",
          };
        }),
      );
      merged.push(...results);
    }

    return res.status(200).json(merged);
  } catch (err) {
    console.error("Gemini API error:", err.message);
    return res.status(500).json({ error: "Failed to generate gift recommendations" });
  }
}
