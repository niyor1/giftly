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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    if (!res.ok) return [];
    const data = await res.json();
    const products = data?.shopping_results || [];
    if (!products.length) return [];

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
  } catch {
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
  if (!query || !budgetRange) {
    return res.status(400).json({ error: "Missing query or budgetRange" });
  }

  const userMessage = `Generate exactly 3 gift ideas for: ${query}. Budget: ${budgetRange}. Each idea should be a specific product (not a broad category). Return a JSON array where each object has exactly these fields: ideaTitle, description, reason, emoji, category, searchQuery. The searchQuery field must be a short, specific Google Shopping search term for finding real products. Do NOT return more than 3 ideas.`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const result = await model.generateContent([SYSTEM_PROMPT, userMessage]);
    const text = result.response.text();

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

    // Fetch up to 6 products for each of the 3 ideas — all in parallel
    const ideasWithProducts = await Promise.all(
      parsed.map(async (idea) => {
        const products = await fetchProducts(idea.searchQuery || idea.ideaTitle);
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

    return res.status(200).json({ ideas: ideasWithProducts });
  } catch (err) {
    console.error("Gemini API error:", err.message);
    return res.status(500).json({ error: "Failed to generate gift recommendations" });
  }
}
