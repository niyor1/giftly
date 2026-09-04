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
  "suggestions. Always stay within budget.\n\n" +
  "Do NOT suggest specific brand names or specific products. Instead suggest broad gift categories and ideas. For example:\n" +
  "- Instead of 'MEATER Plus Wireless Smart Meat Thermometer' say 'Smart Meat Thermometer'\n" +
  "- Instead of 'Leatherman Wave+ Multi-Tool' say 'Multi-Tool Set'\n" +
  "- Instead of 'Ember Temperature Control Smart Mug 2' say 'Temperature Control Smart Mug'\n\n" +
  "The ideaTitle should be a generic product type, not a brand or model name.\n" +
  "The searchQuery should be a short generic Amazon search term with no brand names.\n" +
  "Keep descriptions and reasons personalised to the recipient but keep product names generic.";

// ─── SerpApi helpers ────────────────────────────────────────────────

/**
 * Fetch Google Shopping results from SerpApi for a single search query.
 * Returns up to 6 products, or an empty array on failure / no results.
 */
async function fetchProducts(searchQuery) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey || apiKey === "your_serpapi_key_here") return [];

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_shopping");
  url.searchParams.set("q", searchQuery);
  url.searchParams.set("gl", "uk");
  url.searchParams.set("hl", "en");
  url.searchParams.set("api_key", apiKey);

  console.log("[fetchProducts] SerpApi URL:", url.toString());

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60_000);

  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    console.log("[fetchProducts] SerpApi status:", res.status);
    if (!res.ok) return [];
    const data = await res.json();
    console.log("[fetchProducts] Raw SerpApi response keys:", Object.keys(data));
    console.log("[fetchProducts] shopping_results count:", (data?.shopping_results || []).length);

    // Log first result to inspect field names
    if (data?.shopping_results?.[0]) {
      console.log("[fetchProducts] First SerpApi result keys:", Object.keys(data.shopping_results[0]));
      console.log("[fetchProducts] First SerpApi result sample:", JSON.stringify(data.shopping_results[0], null, 2));
    }

    const products = data?.shopping_results || [];
    if (!products.length) {
      // Fallback: return an Amazon search link when no shopping results
      console.log("[fetchProducts] No shopping results, returning Amazon fallback for:", searchQuery);
      return [
        {
          title: searchQuery,
          price: "Price TBD",
          thumbnail: null,
          productLink: `https://www.amazon.co.uk/s?k=${encodeURIComponent(searchQuery)}`,
          retailer: "Amazon UK",
        },
      ];
    }

    return products.slice(0, 6).map((p) => {
      const rawProductLink =
        p.link ||
        p.product_link ||
        p.sellers_results?.online_sellers?.[0]?.link ||
        null;
      return {
        title: p.title || searchQuery,
        price: p.price || null,
        thumbnail: p.thumbnail || p.img_url || null,
        productLink: sanitizeUrl(rawProductLink) || null,
        retailer: p.source || null,
      };
    });
  } catch (err) {
    console.error("[fetchProducts] Error fetching products:", err.message);
    return [];
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
  console.log("[handler] Incoming request body:", JSON.stringify({ query, budgetRange }));

  if (!query || !budgetRange) {
    return res.status(400).json({ error: "Missing query or budgetRange" });
  }

  const userMessage = `Generate exactly 3 gift ideas for: ${query}. Budget: ${budgetRange}. Each idea should be a specific product (not a broad category). Return a JSON array where each object has exactly these fields: ideaTitle, description, reason, emoji, category, searchQuery. The searchQuery field must be a short, specific Google Shopping search term for finding real products. Do NOT return more than 3 ideas.`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });

    console.log("[handler] Sending request to Gemini...");
    const result = await model.generateContent([SYSTEM_PROMPT, userMessage]);
    const text = result.response.text();
    console.log("[handler] Raw Gemini response:", text);

    // Strip thinking tags (Gemini may wrap output in <thinking>...</thinking>)
    let cleaned = text.replace(/<thinking>[\s\S]*?<\/thinking>\s*/gi, "").trim();

    // Strip markdown backticks and json language tag
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

    console.log("[handler] Cleaned Gemini response:", cleaned);

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("[handler] JSON parse failed:", parseErr.message);
      console.error("[handler] Raw text that failed to parse:", cleaned);
      // Return empty ideas array instead of crashing
      return res.status(200).json({ ideas: [] });
    }

    console.log("[handler] Parsed Gemini response:", JSON.stringify(parsed, null, 2));

    if (!Array.isArray(parsed)) {
      console.warn("[handler] Gemini response parsed but was not an array, type:", typeof parsed);
      return res.status(200).json({ ideas: [] });
    }

    if (parsed.length === 0) {
      console.warn("[handler] Gemini returned empty array");
      return res.status(200).json({ ideas: [] });
    }

    console.log("[handler] Parsed ideas count:", parsed.length);

    // Fetch up to 6 products for each of the 3 ideas — all in parallel
    const ideasWithProducts = await Promise.all(
      parsed.map(async (idea) => {
        const searchQ = idea.searchQuery || idea.ideaTitle;
        console.log("[handler] Fetching products for idea:", JSON.stringify(idea));
        const products = await fetchProducts(searchQ);
        console.log("[handler] Products fetched for", idea.ideaTitle, ":", products.length);
        return {
          ideaTitle: idea.ideaTitle,
          description: idea.description || "",
          reason: idea.reason || "",
          emoji: idea.emoji || "🎁",
          category: idea.category || "Gift Idea",
          products,
        };
      }),
    );

    console.log("[handler] Final ideasWithProducts:", JSON.stringify(ideasWithProducts, null, 2));

    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ ideas: ideasWithProducts });
  } catch (err) {
    console.error("[handler] Gemini API error:", err.message);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({ error: "Failed to generate gift recommendations" });
  }
}
