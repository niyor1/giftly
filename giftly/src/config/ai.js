// ─── AI Configuration ──────────────────────────────────────────────
// NOTE: These prompts are embedded in client-side code, which means
// they're visible to anyone who inspects the bundle. In production,
// move all AI interaction to a backend proxy to prevent prompt leakage
// and reduce injection attack surface.

/** Default system prompt sent to Gemini */
export const SYSTEM_PROMPT =
  "You are a gift recommendation expert. Respond with ONLY a valid JSON array. " +
  "No markdown, no backticks, no explanation. Just raw JSON. Avoid generic " +
  "suggestions. Be specific with product names and brands. Always stay within budget.";
