import { describe, it, expect } from "vitest";
import {
  sanitizeUrl,
  extractJSON,
  parsePriceRange,
  parsePriceForSort,
  extractBudget,
  buildAmazonURL,
  buildPlaceholderImage,
} from "../../utils/helpers.js";

// ─── sanitizeUrl ─────────────────────────────────────────────────────

describe("sanitizeUrl", () => {
  it("returns the URL unchanged for valid http URLs", () => {
    expect(sanitizeUrl("https://example.com")).toBe("https://example.com/");
  });

  it("returns the URL unchanged for valid https URLs", () => {
    expect(sanitizeUrl("https://www.amazon.co.uk/s?k=test")).toBe(
      "https://www.amazon.co.uk/s?k=test",
    );
  });

  it("rejects javascript: URIs", () => {
    expect(sanitizeUrl("javascript:alert('xss')")).toBe("#");
  });

  it("rejects data: URIs", () => {
    expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe("#");
  });

  it("returns '#' for null input", () => {
    expect(sanitizeUrl(null)).toBe("#");
  });

  it("returns '#' for undefined input", () => {
    expect(sanitizeUrl(undefined)).toBe("#");
  });

  it("returns '#' for non-string input", () => {
    expect(sanitizeUrl(123)).toBe("#");
  });

  it("returns '#' for empty string", () => {
    expect(sanitizeUrl("")).toBe("#");
  });

  it("rejects malformed URLs that throw", () => {
    expect(sanitizeUrl("not a url at all!@#$")).toBe("#");
  });
});

// ─── extractJSON ──────────────────────────────────────────────────────

describe("extractJSON", () => {
  it("parses raw JSON array", () => {
    const input = '[{"title":"Test"}]';
    expect(extractJSON(input)).toEqual([{ title: "Test" }]);
  });

  it("parses empty array", () => {
    expect(extractJSON("[]")).toEqual([]);
  });

  it("parses nested arrays", () => {
    const input = '[{"tags":["a","b"]}]';
    expect(extractJSON(input)).toEqual([{ tags: ["a", "b"] }]);
  });

  it("extracts JSON from markdown code blocks with json lang", () => {
    const input = '```json\n[{"title":"Test"}]\n```';
    expect(extractJSON(input)).toEqual([{ title: "Test" }]);
  });

  it("extracts JSON from markdown code blocks without lang", () => {
    const input = "```\n[{\"title\":\"Test\"}]\n```";
    expect(extractJSON(input)).toEqual([{ title: "Test" }]);
  });

  it("returns null for text with no brackets", () => {
    expect(extractJSON("Hello world")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractJSON("")).toBeNull();
  });

  it("handles trailing text after JSON array", () => {
    const input = '[{"title":"Test"}] Some extra text';
    expect(extractJSON(input)).toEqual([{ title: "Test" }]);
  });

  it("returns null for invalid JSON in brackets", () => {
    expect(extractJSON("{not: valid}")).toBeNull();
  });
});

// ─── parsePriceRange ──────────────────────────────────────────────────

describe("parsePriceRange", () => {
  it("parses dollar range", () => {
    expect(parsePriceRange("$29 – $59")).toEqual([29, 59]);
  });

  it("parses pound range", () => {
    expect(parsePriceRange("£19 – £75")).toEqual([19, 75]);
  });

  it("handles single value (returns array of length 1)", () => {
    expect(parsePriceRange("$29")[0]).toBe(29);
    expect(parsePriceRange("$29").length).toBe(1);
  });

  it("returns [null, null] for empty string", () => {
    expect(parsePriceRange("")).toEqual([null, null]);
  });

  it("returns [null, null] for null input", () => {
    expect(parsePriceRange(null)).toEqual([null, null]);
  });

  it("handles unparseable values (returns NaN)", () => {
    const result = parsePriceRange("Free!");
    expect(result[0]).toBeNaN();
    expect(result.length).toBe(1);
  });

  it("handles mixed currency symbols", () => {
    expect(parsePriceRange("$29 – £59")).toEqual([29, 59]);
  });
});

// ─── parsePriceForSort ────────────────────────────────────────────────

describe("parsePriceForSort", () => {
  it("extracts first number from pound price", () => {
    expect(parsePriceForSort("£29")).toBe(29);
  });

  it("extracts first number from dollar range", () => {
    expect(parsePriceForSort("$29 – $59")).toBe(29);
  });

  it("handles null input", () => {
    expect(parsePriceForSort(null)).toBeNull();
  });

  it("handles empty string", () => {
    expect(parsePriceForSort("")).toBeNull();
  });

  it("handles no currency symbol", () => {
    expect(parsePriceForSort("29")).toBe(29);
  });

  it("handles whitespace before number", () => {
    expect(parsePriceForSort("  £42")).toBe(42);
  });
});

// ─── extractBudget ────────────────────────────────────────────────────

describe("extractBudget", () => {
  it("extracts budget from query with £ symbol", () => {
    expect(extractBudget("dad fishing £50")).toBe(50);
  });

  it("extracts budget from query with $ symbol", () => {
    expect(extractBudget("gift for $100")).toBe(100);
  });

  it("extracts budget from query with € symbol", () => {
    expect(extractBudget("budget €75")).toBe(75);
  });

  it("handles whitespace between £ and number", () => {
    expect(extractBudget("budget £ 75")).toBe(75);
  });

  it("returns null for empty string", () => {
    expect(extractBudget("")).toBeNull();
  });

  it("returns null for null input", () => {
    expect(extractBudget(null)).toBeNull();
  });

  it("returns null when no £ symbol present", () => {
    expect(extractBudget("no budget here")).toBeNull();
  });

  it("extracts the first match (not the last)", () => {
    expect(extractBudget("£50 and £100")).toBe(50);
  });
});

// ─── buildAmazonURL ───────────────────────────────────────────────────

describe("buildAmazonURL", () => {
  it("builds a valid Amazon UK search URL", () => {
    const result = buildAmazonURL("fishing rod");
    expect(result).toBe("https://www.amazon.co.uk/s?k=fishing+rod&tag=giftly-21");
  });

  it("handles empty query", () => {
    const result = buildAmazonURL("");
    expect(result).toBe("https://www.amazon.co.uk/s?k=&tag=giftly-21");
  });

  it("encodes special characters", () => {
    const result = buildAmazonURL("gift & present");
    expect(result).toBe("https://www.amazon.co.uk/s?k=gift+%26+present&tag=giftly-21");
  });
});

// ─── buildPlaceholderImage ────────────────────────────────────────────

describe("buildPlaceholderImage", () => {
  it("returns a placeholder URL for valid text", () => {
    const result = buildPlaceholderImage("test product");
    expect(result).toContain("placehold.co");
    expect(result).toContain("test%20product");
  });

  it("returns null for empty string", () => {
    expect(buildPlaceholderImage("")).toBeNull();
  });

  it("returns null for null input", () => {
    expect(buildPlaceholderImage(null)).toBeNull();
  });

  it("returns null for whitespace-only input", () => {
    expect(buildPlaceholderImage("   ")).toBeNull();
  });

  it("rejects javascript: text safely", () => {
    const result = buildPlaceholderImage("javascript:alert(1)");
    expect(result).toBeNull();
  });

  it("rejects data: URIs", () => {
    const result = buildPlaceholderImage("data:text/html,<script>alert(1)</script>");
    expect(result).toBeNull();
  });
});
