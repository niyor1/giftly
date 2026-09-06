const { GoogleGenerativeAI } = require("@google/generative-ai");

const SYSTEM_PROMPT =
  "You are a gift recommendation expert. Respond with ONLY a valid JSON array. " +
  "No markdown, no backticks, no explanation. Just raw JSON. Avoid generic " +
  "suggestions. Always stay within budget.\n\n" +
  "Do NOT suggest specific brand names or specific products. Instead suggest broad gift categories and ideas. For example:\n" +
  "- Instead of 'MEATER Plus Wireless Smart Meat Thermometer' say 'Smart Meat Thermometer'\n" +
  "- Instead of 'Leatherman Wave+ Multi-Tool' say 'Multi-Tool Set'\n" +
  "- Instead of 'Ember Temperature Control Smart Mug 2' say 'Temperature Control Smart Mug'\n\n" +
  "The ideaTitle should be a generic product type, not a brand or model name.\n" +
  "The searchQuery should be a short generic Google Shopping search term with no brand names.\n" +
  "Keep descriptions and reasons personalised to the recipient but keep product names generic.";

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

// ─── Main handler ───────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query, budgetRange } = req.body;

  if (!query || !budgetRange) {
    return res.status(400).json({ error: "Missing query or budgetRange" });
  }

  const userMessage = `Generate exactly 1 gift idea for: ${query}. Budget: ${budgetRange}. The idea should be a specific product (not a broad category). Return a JSON array where each object has exactly these fields: ideaTitle, description, reason, emoji, category, searchQuery. The searchQuery field must be a short, specific Google Shopping search term for finding real products.`;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const geminiResult = await model.generateContent(`${SYSTEM_PROMPT}\n\n${userMessage}`);
  let rawText = geminiResult.response.text();

  // Strip markdown backticks and json language tag
  let cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (parseErr) {
    console.error("[handler] JSON parse failed:", parseErr.message);
    return res.json([]);
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return res.json([]);
  }

  const searchQuery = parsed[0].searchQuery || parsed[0].ideaTitle;

  // ─── SerpApi call ──────────────────────────────────────────────

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey || apiKey === "your_serpapi_key_here") {
    return res.json([]);
  }

  const serpUrl = new URL("https://serpapi.com/search.json");
  serpUrl.searchParams.set("engine", "google_shopping");
  serpUrl.searchParams.set("q", searchQuery);
  serpUrl.searchParams.set("gl", "uk");
  serpUrl.searchParams.set("hl", "en");
  serpUrl.searchParams.set("api_key", apiKey);

  let serpRes;
  try {
    serpRes = await fetch(serpUrl.toString());
  } catch {
    return res.json([]);
  }

  if (!serpRes.ok) {
    return res.json([]);
  }

  const serpData = await serpRes.json();
  const products = (serpData?.shopping_results || []).slice(0, 10).map((p) => ({
    title: p.title || searchQuery,
    price: p.price || null,
    thumbnail: p.thumbnail || p.img_url || null,
    productLink: sanitizeUrl(p.link || p.product_link || null),
    retailer: p.source || null,
  }));

  return res.json(products);
};
