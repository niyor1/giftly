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

export default async function handler(req, res) {
  // CORS headers for browser requests
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return res.status(200).json({}, corsHeaders);
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" }, corsHeaders);
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey || apiKey === "your_serpapi_key_here") {
    return res.json([], corsHeaders);
  }

  const serpUrl = new URL("https://serpapi.com/search.json");
  serpUrl.searchParams.set("engine", "google_shopping");
  serpUrl.searchParams.set("q", "popular gifts uk");
  serpUrl.searchParams.set("gl", "uk");
  serpUrl.searchParams.set("hl", "en");
  serpUrl.searchParams.set("api_key", apiKey);

  let serpRes;
  try {
    serpRes = await fetch(serpUrl.toString());
  } catch {
    return res.json([], corsHeaders);
  }

  if (!serpRes.ok) {
    return res.json([], corsHeaders);
  }

  const serpData = await serpRes.json();
  const products = (serpData?.shopping_results || []).slice(0, 6).map((p) => ({
    title: p.title || "Popular gift",
    price: p.price || null,
    thumbnail: p.thumbnail || p.img_url || null,
    productLink: sanitizeUrl(p.link || p.product_link || null),
    retailer: p.source || null,
  }));

  return res.json(products, corsHeaders);
}
