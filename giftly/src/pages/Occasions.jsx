import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { occasions, recipientPresets } from "../data/mockData";

// ─── Helpers ──────────────────────────────────────────────────────

// Determine which 3 occasions are "popular right now" based on current month
function getPopularOccasions() {
  const month = new Date().getMonth(); // 0-indexed: 0=Jan, 5=June, etc.
  const popularMap = {
    0: ["Christmas", "New Year"], // January
    2: ["Easter"], // March
    3: ["Mother's Day", "Earth Day"], // April
    4: ["Father's Day", "Graduation"], // May
    5: ["Father's Day", "Summer", "Birthday"], // June
    6: ["Back to School", "Summer"], // July
    8: ["Labor Day", "Fall"], // September
    10: ["Halloween", "Thanksgiving"], // November
    11: ["Christmas", "Hanukkah"], // December
  };
  const names = popularMap[month] || ["Birthday", "Wedding"];

  return occasions.filter((o) => names.includes(o.name));
}

// ─── Occasion Card component ──────────────────────────────────────

function OccasionCard({ occasion, onClick }) {
  return (
    <button
      onClick={() => onClick(occasion.examplePrompt)}
      className="group flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-gold/5"
    >
      <span className="text-5xl transition-transform group-hover:scale-110">
        {occasion.emoji}
      </span>
      <h3 className="text-xl font-bold text-white group-hover:text-gold transition-colors">
        {occasion.name}
      </h3>
      <p className="max-w-xs text-sm leading-relaxed text-white/50">
        {occasion.examplePrompt}
      </p>
      <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-gold/20 px-4 py-1.5 text-sm font-medium text-gold opacity-60 transition-all group-hover:opacity-100">
        Explore gifts
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </span>
    </button>
  );
}

// ─── Recipient Card component ──────────────────────────────────────

function RecipientCard({ preset, onClick }) {
  return (
    <button
      onClick={() => onClick(preset.promptHint)}
      className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:bg-white/[0.06]"
    >
      <span className="text-3xl transition-transform group-hover:scale-110">
        {preset.emoji}
      </span>
      <div>
        <h3 className="font-semibold text-white group-hover:text-gold transition-colors">
          {preset.label}
        </h3>
        <p className="text-sm text-white/40 italic">"{preset.promptHint}"</p>
      </div>
    </button>
  );
}

// ─── Page ──────────────────────────────────────────────────────────

export default function Occasions() {
  const navigate = useNavigate();
  const [searchFilter, setSearchFilter] = useState("");

  const popular = useMemo(() => getPopularOccasions(), []);

  const filteredOccasions = useMemo(
    () =>
      occasions.filter((o) =>
        o.name.toLowerCase().includes(searchFilter.toLowerCase())
      ),
    [searchFilter]
  );

  const handleNavigate = (query) => {
    navigate(`/results?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page hero */}
      <div className="mb-14 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Shop by Occasion
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/50">
          Browse gift ideas organized by the special moments in your life.
        </p>

        {/* Search filter */}
        <div className="mx-auto mt-8 w-full max-w-md">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              size={18}
            />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search occasions…"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder-white/30 focus:border-gold/40 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Popular right now */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-gold/70">
          Popular Right Now
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {popular.map((occasion) => (
            <button
              key={occasion.name}
              onClick={() => handleNavigate(occasion.examplePrompt)}
              className="relative overflow-hidden rounded-2xl border-2 border-gold/40 bg-gold-subtle p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-lg hover:shadow-gold/10"
            >
              <span className="absolute left-4 top-4 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-deep-purple">
                Trending
              </span>
              <span className="mt-6 block text-5xl">{occasion.emoji}</span>
              <h3 className="mt-4 text-xl font-bold text-gold">
                {occasion.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {occasion.examplePrompt}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* All occasions grid */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-white/40">
          All Occasions
        </h2>
        {filteredOccasions.length === 0 ? (
          <p className="text-center text-white/40">No occasions match "{searchFilter}"</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredOccasions.map((occasion) => (
              <OccasionCard key={occasion.name} occasion={occasion} onClick={handleNavigate} />
            ))}
          </div>
        )}
      </section>

      {/* Shop by Recipient */}
      <section>
        <h2 className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-white/40">
          Shop by Recipient
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recipientPresets.map((preset) => (
            <RecipientCard key={preset.label} preset={preset} onClick={handleNavigate} />
          ))}
        </div>
      </section>
    </div>
  );
}
