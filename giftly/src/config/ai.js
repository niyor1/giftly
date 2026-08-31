// ─── AI Configuration ──────────────────────────────────────────────
// NOTE: These prompts are embedded in client-side code, which means
// they're visible to anyone who inspects the bundle. In production,
// move all AI interaction to a backend proxy to prevent prompt leakage
// and reduce injection attack surface.

/** Default system prompt sent to Ollama */
export const SYSTEM_PROMPT =
  "You are a gift recommendation assistant. You must respond with ONLY a valid JSON array. No markdown, no backticks, no explanation, no thinking tags. Just raw JSON.";

/** Stricter fallback system prompt used on retry */
export const STRICTER_SYSTEM_PROMPT =
  "You are a gift recommendation assistant. Respond with ONLY a raw JSON array — nothing else. No markdown, no backticks, no code blocks, no explanation. Start your response with [ and end with ].";
