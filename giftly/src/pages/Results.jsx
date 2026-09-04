import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  X,
  RefreshCw,
  Share2,
  Mail,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import GiftCard from "../components/GiftCard";
import Toast from "../components/Toast";
import EmailModal from "../components/EmailModal";
import useGiftSearch from "../hooks/useGiftSearch";
import { extractBudget, parsePriceForSort } from "../utils/helpers.js";
import { useAiLoading } from "../context/AiLoadingContext";

// ─── Data constants ────────────────────────────────────────────────

const allCategories = [
  "Art & Decor",
  "Home & Living",
  "Gardening",
  "Personalized Gifts",
  "Food & Drink",
  "Accessories",
  "Wellness",
  "Toys & Games",
  "Kitchen & Dining",
  "Electronics",
  "Beauty & Fragrance",
];

const occasionEmojis = {
  anniversary: "💍",
  housewarming: "🏡",
  memorial: "🕊️",
  graduation: "🎓",
  "father's-day": "👔",
  birthday: "🎂",
  christmas: "🎄",
  "valentines-day": "❤️",
  "mothers-day": "🌸",
};

// ─── Skeleton loading grid ─────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
        >
          {/* Image placeholder */}
          <div className="aspect-[3/2] animate-pulse bg-white/5" />

          {/* Content placeholders */}
          <div className="flex flex-1 flex-col p-5">
            <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
            <div className="mt-2 h-5 w-3/4 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-3 w-full animate-pulse rounded bg-white/5" />
            <div className="mt-1 h-3 w-5/6 animate-pulse rounded bg-white/5" />

            {/* Rating placeholder */}
            <div className="mt-4 flex items-center gap-2">
              <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-8 animate-pulse rounded bg-white/10" />
            </div>

            {/* Price + CTA placeholder */}
            <div className="mt-auto pt-4">
              <div className="flex items-center justify-between border-t border-white/10">
                <div className="h-4 w-20 animate-pulse rounded bg-gold/20" />
                <div className="h-8 w-24 animate-pulse rounded-lg bg-gold/10" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Error state ────────────────────────────────────────────────────

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/[0.03] py-24 text-center">
      <div className="rounded-full bg-red-500/10 p-6">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-red-400"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <h3 className="mt-6 text-xl font-bold text-white">
        Unable to fetch gift ideas
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/40">
        {message || "We couldn't connect to the local AI model. Make sure Ollama is running at http://localhost:11434."}
      </p>
      <button
        onClick={onRetry}
        className="mt-8 flex items-center gap-2 rounded-xl bg-gold px-8 py-3 text-base font-bold text-deep-purple shadow-lg shadow-gold/20 transition-all hover:bg-gold-hover hover:shadow-gold-hover/30"
      >
        <RefreshCw size={18} />
        Try again
      </button>
    </div>
  );
}

// ─── Idea section component ─────────────────────────────────────────

function IdeaSection({ idea }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02]">
      {/* Section header */}
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{idea.emoji}</span>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{idea.ideaTitle}</h3>
            {idea.reason && (
              <p className="mt-0.5 text-sm text-white/40">{idea.reason}</p>
            )}
          </div>
        </div>
      </div>

      {/* Product grid for this idea */}
      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        {idea.products.length === 0 ? (
          <p className="text-sm text-white/30">No products found for this idea.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {idea.products.map((product, idx) => (
              <GiftCard key={`${idea.ideaTitle}_${idx}`} gift={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Sidebar component ─────────────────────────────────────────────

function ResultsSidebar({
  budget,
  onBudgetChange,
  categories,
  onCategoryToggle,
  occasion,
  onOccasionChange,
  onClearFilters,
  hasActiveFilters,
}) {
  return (
    <aside className="w-full space-y-8 lg:w-72 lg:flex-shrink-0">
      {/* Budget */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">
          Max Budget
        </h3>
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={500}
            step={5}
            value={budget}
            onChange={(e) => onBudgetChange(Number(e.target.value))}
            className="w-full accent-gold cursor-pointer"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/40">£0</span>
            <span className="font-bold text-gold">£{budget}</span>
            <span className="text-white/40">£500</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">
          Category
        </h3>
        <div className="space-y-2.5">
          {allCategories.map((cat) => (
            <label key={cat} className="flex cursor-pointer items-center gap-2.5 group">
              <input
                type="checkbox"
                checked={categories.includes(cat)}
                onChange={() => onCategoryToggle(cat)}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-gold accent-gold focus:ring-gold/30 cursor-pointer"
              />
              <span className="text-sm text-white/60 group-hover:text-white transition-colors">
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Occasion */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">
          Occasion
        </h3>
        <select
          value={occasion}
          onChange={(e) => onOccasionChange(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-gold/40 focus:outline-none cursor-pointer"
        >
          <option value="" className="text-white/40">All occasions</option>
          {Object.entries(occasionEmojis).map(([key, emoji]) => (
            <option key={key} value={key} className="text-white">
              {emoji} {key.replace(/-/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-gold transition-all hover:bg-gold-subtle"
        >
          <X size={14} />
          Clear filters
        </button>
      )}
    </aside>
  );
}

// ─── Page ──────────────────────────────────────────────────────────

export default function Results() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const urlBudget = searchParams.get("budget");
  const { setAiLoading } = useAiLoading();

  // Gift search hook (AI-powered)
  const { results: aiResults, loading: aiLoading, error: aiError, search } = useGiftSearch();

  // State
  const [query, setQuery] = useState(initialQuery);
  const [budget, setBudget] = useState(() => {
    if (urlBudget) return Math.min(Number(urlBudget), 500);
    const extracted = extractBudget(initialQuery);
    return extracted || 500;
  });
  const [categories, setCategories] = useState([]);
  const [occasion, setOccasion] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  // Sync hook loading state to global context so other pages can check it
  useEffect(() => {
    setAiLoading(aiLoading);
  }, [aiLoading, setAiLoading]);

  // Trigger search when query changes (and has content)
  useEffect(() => {
    if (initialQuery.trim()) {
      setAiLoading(true);
      search(initialQuery, budget);
    }
    // Only run on mount — don't re-run when budget changes (that's handled by filter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  // Check if a gift matches the budget (priceRange contains a value <= budget)
  function matchesBudget(gift, budget) {
    if (!budget || budget >= 500) return true;
    const price = parsePriceForSort(gift.price);
    if (price === null) return true;
    return price <= budget;
  }

  // Check if a gift matches selected categories
  function matchesCategory(gift, cats) {
    if (cats.length === 0) return true;
    return cats.includes(gift.category);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps

  // Update URL when query changes
  const updateQuery = useCallback(
    (newQuery) => {
      setQuery(newQuery);
      if (newQuery.trim()) {
        setSearchParams({ q: newQuery });
      } else {
        setSearchParams({});
      }
    },
    [setSearchParams],
  );

  // Trigger AI search from the inline query input
  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    search(query, budget);
  }, [query, budget, search]);

  // Share results
  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToastMsg("Link copied to clipboard!");
      setToastType("info");
    } catch {
      setToastMsg("Could not copy link.");
      setToastType("success");
    }
  }, []);

  // Email list
  const handleEmailSubmit = useCallback((email) => {
    setEmailOpen(false);
    setToastMsg(`Gift list sent to ${email}!`);
    setToastType("success");
  }, []);

  // Filter management
  const toggleCategory = useCallback((cat) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }, []);

  const clearFilters = useCallback(() => {
    setBudget(500);
    setCategories([]);
    setOccasion("");
    setSortBy("relevance");
  }, []);

  const hasActiveFilters = categories.length > 0 || occasion !== "" || budget < 500;

  // Retry handler
  const handleRetry = useCallback(() => {
    if (query.trim()) {
      search(query, budget);
    }
  }, [query, budget, search]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        {query && (
          <>
            <p className="text-sm font-medium uppercase tracking-widest text-gold">
              Search results
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Gift ideas for:{" "}
              <span className="text-gold">{query}</span>
            </h1>
          </>
        )}
        <p className="mt-2 text-sm text-white/40">
          {aiLoading
            ? "Searching with Gemini AI…"
            : aiError
              ? "Unable to load results"
              : `${aiResults?.length || 0} idea${aiResults?.length !== 1 ? "s" : ""} found`}
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Sort + Share + Email */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none rounded-lg border border-white/10 bg-white/5 py-2.5 pl-4 pr-10 text-sm text-white focus:border-gold/40 focus:outline-none cursor-pointer"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="rating">Highest Rated</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
            />
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 transition-all hover:border-gold/40 hover:text-gold"
          >
            <Share2 size={16} />
            Share
          </button>

          <button
            onClick={() => setEmailOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 transition-all hover:border-gold/40 hover:text-gold"
          >
            <Mail size={16} />
            Email my list
          </button>
        </div>

        {/* Mobile sidebar toggle + Search again */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:w-auto sm:flex-1">
          <div className="relative w-full sm:w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              size={16}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search again…"
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/30 focus:border-gold/40 focus:outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!query.trim() || aiLoading}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-deep-purple shadow-lg shadow-gold/20 transition-all hover:bg-gold-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Sparkles size={16} />
            Search
          </button>
          <button
            onClick={() => setShowSidebarMobile(!showSidebarMobile)}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 transition-all hover:border-gold/40 hover:text-gold sm:hidden"
          >
            <Filter size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {showSidebarMobile && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setShowSidebarMobile(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute right-0 top-0 h-full w-[85vw] sm:w-80 max-w-sm overflow-y-auto border-l border-white/10 bg-deep-purple-light p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Filters</h2>
              <button
                onClick={() => setShowSidebarMobile(false)}
                className="rounded-full p-2 text-white/40 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <ResultsSidebar
              budget={budget}
              onBudgetChange={setBudget}
              categories={categories}
              onCategoryToggle={toggleCategory}
              occasion={occasion}
              onOccasionChange={setOccasion}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar (desktop) */}
        <div className="hidden lg:block">
          <ResultsSidebar
            budget={budget}
            onBudgetChange={setBudget}
            categories={categories}
            onCategoryToggle={toggleCategory}
            occasion={occasion}
            onOccasionChange={setOccasion}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Results */}
        <div className="flex-1">
          {aiLoading ? (
            <>
              {/* Loading state */}
              <div className="mb-8 flex items-center gap-3 rounded-xl border border-gold/20 bg-gold/[0.03] px-6 py-5">
                <span className="text-2xl animate-bounce">🎁</span>
                <p className="text-base font-medium text-gold">
                  Finding perfect gifts…
                </p>
                <span className="flex gap-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-gold" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-gold" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-gold" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
              <LoadingSkeleton />
            </>
          ) : aiError ? (
            <>
              <ErrorState message={aiError} onRetry={handleRetry} />
              {/* Note about local AI */}
              <p className="mt-6 text-center text-xs text-white/25">
                Powered by Gemini AI
              </p>
            </>
          ) : aiResults && aiResults.length > 0 ? (
            <>
              {aiResults.map((idea, idx) => (
                <IdeaSection key={idea.ideaTitle} idea={idea} />
              ))}
              {/* Note about local AI */}
              <p className="mt-6 text-center text-xs text-white/25">
                Powered by Gemini AI
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] py-24 text-center">
              <Search size={48} className="mb-4 text-white/15" />
              <h3 className="text-xl font-bold text-white">No gifts found</h3>
              <p className="mt-2 max-w-sm text-sm text-white/40">
                Try adjusting your budget, categories, or search query to find more results.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Email modal */}
      <EmailModal open={emailOpen} onClose={() => setEmailOpen(false)} onSubmit={handleEmailSubmit} />

      {/* Toast */}
      <Toast message={toastMsg} type={toastType} onDismiss={() => setToastMsg("")} />
    </div>
  );
}
