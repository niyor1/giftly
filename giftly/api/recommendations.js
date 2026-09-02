import { google } from "@google/generative-ai";

const SYSTEM_PROMPT =
  "You are a gift recommendation expert. Respond with ONLY a valid JSON array. " +
  "No markdown, no backticks, no explanation. Just raw JSON. Avoid generic " +
  "suggestions. Be specific with product names and brands. Always stay within budget.";

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
    const genAI = google({ apiKey: process.env.GEMINI_API_KEY });
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("Gemini API error:", err.message);
    return res.status(500).json({ error: "Failed to generate gift recommendations" });
  }
}
