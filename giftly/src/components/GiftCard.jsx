import { useState, useCallback } from "react";
import { Heart } from "lucide-react";
import StarRating from "./StarRating";

// ─── Badge color map ────────────────────────────────────────────────

const badgeStyles = {
  "Best Seller": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Top Rated": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Editor's Pick": "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "Trending": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "New": "bg-sky-500/20 text-sky-400 border-sky-500/30",
};

// ─── Main component ─────────────────────────────────────────────────

export default function GiftCard({ gift, onWishlistToggle, isWishlisted }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleImageLoad = useCallback(() => setImgLoaded(true), []);
  const handleImageError = useCallback(() => setImgError(true), []);

  if (!gift) return null;

  // Use the real thumbnail from SerpApi; fall back to null so we show the placeholder
  const imageUrl = gift.thumbnail && !imgError ? gift.thumbnail : null;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-gold/5">
      {/* Image */}
      <div className="relative aspect-[3/2] overflow-hidden bg-deep-purple-light/40">
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 animate-pulse bg-white/5" />
        )}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={gift.title}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={(e) => {
              handleImageError();
              e.target.src = "https://placehold.co/400x400/1a0533/gold?text=Gift+Idea";
            }}
            className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-[1.03] ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/15">
            <span className="text-4xl">{gift.emoji || "🎁"}</span>
          </div>
        )}

        {/* Badge chip */}
        {gift.badge && (
          <span
            className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
              badgeStyles[gift.badge] || "bg-white/20 text-white border-white/30"
            }`}
          >
            {gift.badge}
          </span>
        )}

        {/* Wishlist heart */}
        <button
          type="button"
          onClick={() => onWishlistToggle?.(gift.id)}
          className="absolute right-3 top-3 rounded-full bg-black/40 p-2 text-white/70 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-gold group-hover:bg-black/50 group-hover:text-gold"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} className={isWishlisted ? "fill-gold text-gold" : ""} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium uppercase tracking-widest text-white/30">
          {gift.category}
        </p>
        <h3 className="mt-1.5 text-lg font-bold leading-snug text-white group-hover:text-gold transition-colors">
          {gift.title || 'Gift Idea'}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-white/50 leading-relaxed flex-1">
          {gift.description}
        </p>

        {/* Rating */}
        <div className="mt-4 flex items-center gap-2">
          <StarRating rating={gift.rating} />
          <span className="text-sm font-semibold text-white/80">{gift.rating}</span>
          <span className="text-xs text-white/30">
            ({(gift.reviewCount?.toLocaleString() ?? 'N/A')} reviews)
          </span>
        </div>

        {/* Price + CTA */}
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          {gift.price ? (
            <>
              <span className="text-sm font-bold text-gold">{gift.price}</span>
              {gift.retailer && (
                <span className="ml-2 text-xs text-white/30">From {gift.retailer}</span>
              )}
            </>
          ) : gift.priceRange ? (
            <span className="text-sm font-bold text-gold">{gift.priceRange}</span>
          ) : (
            <span className="text-sm font-bold text-gold">Price unavailable</span>
          )}
          <a
            href={gift.productLink || gift.affiliateUrl || "#"}
            rel="noopener noreferrer"
            target="_blank"
            className="rounded-lg bg-gold/10 px-4 py-2 text-sm font-semibold text-gold transition-all hover:bg-gold hover:text-deep-purple"
          >
            Buy Now
          </a>
        </div>
      </div>
    </article>
  );
}
