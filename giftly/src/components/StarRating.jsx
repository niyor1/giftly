import { Star } from "lucide-react";

// ─── Star rating component ──────────────────────────────────────────
// Renders a 5-star rating with half-star support.
// Usage: <StarRating rating={4.5} /> → ★★★★☆ (filled, filled, filled, filled, half, empty)

export default function StarRating({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} size={14} className="fill-gold text-gold" />
      ))}
      {half && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          className="fill-gold text-gold"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} size={14} className="text-white/20" />
      ))}
    </span>
  );
}
