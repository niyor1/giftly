import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Search, Gift, X as XIcon } from "lucide-react";
import GiftCard from "../components/GiftCard";
import useWishlist from "../hooks/useWishlist";
import StarRating from "../components/StarRating";
import { customerReviews } from "../data/mockData";
import { popularGifts } from "../data/popularGifts";
import { useAiLoading } from "../context/AiLoadingContext";

// ─── Data ──────────────────────────────────────────────────────────

const recipientPresets = [
  { label: "Mum", emoji: "👩" },
  { label: "Dad", emoji: "👨" },
  { label: "Partner", emoji: "💑" },
  { label: "Best Friend", emoji: "🤝" },
  { label: "Boss", emoji: "💼" },
  { label: "Teacher", emoji: "🍎" },
  { label: "Child", emoji: "🧒" },
  { label: "Grandparent", emoji: "👴" },
];

const occasionTags = [
  { label: "Birthday", emoji: "🎂" },
  { label: "Christmas", emoji: "🎄" },
  { label: "Wedding", emoji: "💒" },
  { label: "Anniversary", emoji: "💍" },
  { label: "Valentine's Day", emoji: "❤️" },
  { label: "Mother's Day", emoji: "🌸" },
  { label: "Father's Day", emoji: "👔" },
  { label: "Graduation", emoji: "🎓" },
  { label: "Housewarming", emoji: "🏡" },
  { label: "Sympathy", emoji: "🕊️" },
];

const surprisePrompts = [
  "My sister, 28, loves yoga and sustainable living, budget £60",
  "A colleague retiring after 40 years in engineering",
  "My best friend who collects vintage cameras",
  "My niece turning 7 — she's obsessed with dinosaurs right now",
  "Someone who has everything and doesn't need anything practical",
  "My partner who just got into cooking Italian food",
  "A teacher who works at a primary school",
  "My grandad who loves gardening and the outdoors",
];

const stats = [
  { value: "10,000+", label: "gift ideas" },
  { value: "500+", label: "occasions covered" },
  { value: "50,000+", label: "loved by users" },
];

// ─── Sub-components ────────────────────────────────────────────────

function StatsBar() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-3xl font-extrabold tracking-tight text-gold sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm font-medium uppercase tracking-widest text-white/50">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [budget, setBudget] = useState(100);
  const maxChars = 280;
  const { aiLoading } = useAiLoading();

  const handleClear = useCallback(() => {
    setQuery("");
    setBudget(100);
  }, []);

  const appendPreset = useCallback(
    (text) => {
      setQuery((prev) => {
        if (!prev) return text;
        const trimmed = prev.replace(/,\s*$/, "");
        if (trimmed.includes(text)) return prev;
        return `${trimmed}, ${text}`;
      });
    },
    []
  );

  const handleSurpriseMe = useCallback(() => {
    const random = surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)];
    setQuery(random);
  }, []);

  const charPercent = (query.length / maxChars) * 100;
  const charColor =
    charPercent > 90 ? "bg-red-500" : charPercent > 70 ? "bg-yellow-500" : "bg-gold";

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Search input */}
      <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-shadow hover:shadow-lg hover:shadow-gold/5 focus-within:border-gold/40 focus-within:shadow-md focus-within:shadow-gold/10">
        <Search
          className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30"
          size={22}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value.slice(0, maxChars))}
          placeholder="e.g. My dad, 60, loves fishing, budget £50"
          className="w-full rounded-2xl border-0 bg-transparent py-4 sm:py-5 pl-12 pr-10 sm:pl-14 sm:pr-12 text-base sm:text-lg text-white placeholder-white/30 outline-none"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/40 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <XIcon size={16} />
          </button>
        )}
      </div>

      {/* Character counter */}
      <div className="mt-1.5 flex items-center gap-2 px-1">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full transition-all duration-200 ${charColor}`}
            style={{ width: `${charPercent}%` }}
          />
        </div>
        <span className="text-xs text-white/35 tabular-nums">{query.length}/{maxChars}</span>
      </div>

      {/* Budget slider */}
      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <label htmlFor="budget" className="text-sm font-medium text-white/50 whitespace-nowrap sm:w-16">
          Budget:
        </label>
        <div className="flex-1 w-full flex items-center gap-3">
          <input
            id="budget"
            type="range"
            min={0}
            max={500}
            step={5}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            aria-label="Maximum budget in pounds"
            className="w-full accent-gold cursor-pointer"
          />
          <span className="text-sm font-semibold text-gold tabular-nums whitespace-nowrap sm:w-20 sm:text-right">
            £{budget}
          </span>
        </div>
      </div>

      {/* Find Gifts button */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => onSearch?.(query, budget)}
          disabled={!query.trim() || aiLoading}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gold px-8 py-3.5 text-base sm:text-lg font-bold text-deep-purple shadow-lg shadow-gold/20 transition-all hover:bg-gold-hover hover:shadow-gold-hover/30 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-gold/20"
        >
          <Gift size={20} />
          Find Gifts
        </button>
        <button
          onClick={handleSurpriseMe}
          className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-white/10 px-5 py-3.5 text-sm font-medium text-white/60 transition-all hover:border-gold/40 hover:text-gold hover:bg-gold-subtle"
        >
          <Sparkles size={16} />
          Surprise me
        </button>
      </div>

      {/* Recipient presets */}
      <div className="mt-8">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-white/30">
          Who are you buying for?
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {recipientPresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => appendPreset(`${preset.emoji} ${preset.label}`)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-all hover:border-gold/40 hover:bg-gold-subtle hover:text-gold"
            >
              {preset.emoji} {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Occasion tags */}
      <div className="mt-6">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-white/30">
          What's the occasion?
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {occasionTags.map((tag) => (
            <button
              key={tag.label}
              onClick={() => appendPreset(`${tag.emoji} ${tag.label}`)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-all hover:border-gold/40 hover:bg-gold-subtle hover:text-gold"
            >
              {tag.emoji} {tag.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Popular Gifts section (hardcoded curated list) ──────────────────

function PopularGifts() {
  const wishlist = useWishlist();

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Popular Gift Ideas
        </h2>
        <p className="mt-3 text-lg text-white/50">
          Hand-picked gifts our users love most this season.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {popularGifts.map((gift) => (
          <GiftCard
            key={gift.title}
            gift={gift}
            onWishlistToggle={wishlist.toggle}
            isWishlisted={wishlist.has(gift.title)}
          />
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/occasions"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-8 py-3.5 text-base font-semibold text-white transition-all hover:border-gold/40 hover:text-gold hover:bg-gold-subtle"
        >
          View all occasions →
        </Link>
      </div>
    </section>
  );
}

// ─── Customer Reviews section ────────────────────────────────────────

const occasionEmojis = {
  anniversary: "💍",
  housewarming: "🏡",
  memorial: "🕊️",
  graduation: "🎓",
  "father's-day": "👔",
  birthday: "🎂",
  christmas: "🎄",
  "mothers-day": "🌸",
};

function ReviewsSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          What Our Users Say
        </h2>
        <p className="mt-3 text-lg text-white/50">
          Real stories from real gift-givers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {customerReviews.map((review, i) => (
          <article
            key={i}
            className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-gold/30 hover:bg-white/[0.06]"
          >
            <StarRating rating={review.rating} />
            <p className="mt-4 flex-1 text-sm leading-relaxed text-white/70">
              "{review.comment}"
            </p>
            <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold">
                {review.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{review.name}</p>
                <p className="text-xs text-white/40">{review.location}</p>
              </div>
            </div>
            {review.occasion && (
              <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white/40">
                {occasionEmojis[review.occasion] || "🎁"} {review.occasion.replace(/-/g, " ")}
              </span>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────

export default function Home({ onSearch }) {
  return (
    <div className="relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gold/[0.03]" />
      </div>

      {/* Hero */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Find the perfect gift
            <br />
            <span className="text-gold">for anyone</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/50 sm:text-xl">
            Just describe who you're buying for and we'll do the rest.
          </p>
        </div>

        <div className="mt-14">
          <SearchBar onSearch={onSearch} />
        </div>
      </section>

      {/* Stats bar */}
      <StatsBar />

      {/* Popular gifts */}
      <PopularGifts />

      {/* Customer reviews */}
      <ReviewsSection />
    </div>
  );
}
