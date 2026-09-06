import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Search,
  Gift,
  Sparkles,
} from "lucide-react";

// ─── Step data ──────────────────────────────────────────────────────

const steps = [
  {
    emoji: "✍️",
    title: "Describe your recipient",
    description:
      "Tell us who you're buying for — their interests, age, style, and the occasion. The more detail, the better the results.",
  },
  {
    emoji: "🎁",
    title: "Get personalised ideas",
    description:
      "Our AI curates a list of unique gifts tailored to your recipient. Browse, save, and compare your favourites.",
  },
  {
    emoji: "🛒",
    title: "Buy with one click",
    description:
      "Found the perfect gift? Click through to purchase directly from trusted retailers. No middleman, no extra fees.",
  },
];

// ─── FAQ data ───────────────────────────────────────────────────────

const faqs = [
  {
    question: "How does Giftly work?",
    answer:
      "Giftly uses a combination of AI and hand-curated gift data to suggest the perfect presents for anyone, any occasion. Simply describe who you're buying for — their interests, age, style, and budget — and we'll generate a list of personalised gift ideas with direct links to purchase.",
  },
  {
    question: "Is it free to use?",
    answer:
      "Yes! Giftly is completely free. There's no cost to search for gifts, save wishlists, or share your curated lists with others. We never charge you anything for using our service.",
  },
  {
    question: "How do affiliate links work?",
    answer:
      "When you click through to purchase a gift, you'll be redirected to our retail partners' websites. If you make a purchase, we may earn a small commission at no extra cost to you. This is how we keep Giftly free and running. We only recommend products we genuinely think are great.",
  },
  {
    question: "Can I save my gift ideas?",
    answer:
      "Absolutely! Tap the heart icon on any gift card to save it to your wishlist. You can create multiple named wishlists (e.g. \"Dad's Birthday\", \"Christmas 2026\") and organise gifts across them. Your saved items persist in your browser, so they'll be there when you come back.",
  },
  {
    question: "How do I share a wishlist?",
    answer:
      "On your Wishlist page, click the \"Share wishlist\" button to copy a link to your clipboard. Anyone with that link can see all the items on your list and click through to purchase. It's perfect for birthdays, weddings, holidays, or just telling people what you'd love!",
  },
  {
    question: "What occasions do you cover?",
    answer:
      "Giftly covers all major occasions — birthdays, Christmas, Valentine's Day, Mother's Day, Father's Day, anniversaries, weddings, graduations, housewarmings, retirements, and more. But our search is flexible enough for any moment: just describe the person and we'll find something special.",
  },
  {
    question: "Can I set a budget?",
    answer:
      "Yes! Use the budget slider on the home page or results page to filter gifts within your price range. You can also include your budget directly in the search description (e.g. \"my sister, 28, loves yoga, budget £60\"). We'll show you options both below and just above your target.",
  },
  {
    question: "How do I get the best results?",
    answer:
      "Be specific! The more details you share about the recipient — their hobbies, favourite colours, age, style preferences, past gifts they've loved or hated — the more accurate and personalised your results will be. Don't forget to mention your budget and the occasion for even better matches.",
  },
];

// ─── Step Card component ──────────────────────────────────────────

function StepCard({ emoji, stepNumber, title, description }) {
  return (
    <div className="group relative flex flex-col items-center rounded-2xl border border-transparent bg-white/[0.03] p-10 text-center transition-all duration-300 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/5">
      {/* Gold gradient accent bar at top */}
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      {/* Large number badge */}
      <div className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-lg font-bold text-gold">
        {stepNumber}
      </div>

      {/* Emoji icon */}
      <div className="mt-14 mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-white/[0.03] text-6xl transition-all duration-300 group-hover:bg-gold/10">
        {emoji}
      </div>

      {/* Title */}
      <h3 className="mb-3 text-xl font-bold text-white group-hover:text-gold transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="max-w-sm text-sm leading-relaxed text-white/50">
        {description}
      </p>
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-gold"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-white">{question}</span>
        <ChevronDown
          size={20}
          className={`flex-shrink-0 text-white/30 transition-transform duration-300 ${
            open ? "rotate-180 text-gold" : ""
          }`}
        />
      </button>

      {/* Animated panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-96 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-sm leading-relaxed text-white/50">{answer}</p>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────

export default function HowItWorks() {
  const navigate = useNavigate();

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const input = form.querySelector("input");
      if (!input?.value.trim()) return;
      const params = new URLSearchParams({ q: input.value });
      navigate(`/results?${params.toString()}`);
    },
    [navigate],
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Hero ─────────────────────────────────────────────── */}

      <section className="mb-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10">
          <Sparkles size={32} className="text-gold" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Find the perfect gift{" "}
          <span className="text-gold">in seconds</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-white/50">
          Giftly uses AI to curate personalised gift ideas for anyone, any
          occasion. Just describe who you're buying for — we'll do the rest.
        </p>
      </section>

      {/* ── 3 Steps ──────────────────────────────────────────── */}

      <section className="mb-28">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8">
          {steps.map((step, i) => (
            <StepCard
              key={step.title}
              emoji={step.emoji}
              stepNumber={i + 1}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}

      <section className="mb-28">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-lg text-white/50">
            Everything you need to know about Giftly.
          </p>
        </div>

        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-4">
          {faqs.map((faq) => (
            <FAQItem key={faq.question} {...faq} />
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}

      <section className="mb-16">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-gold-subtle/50 via-white/[0.02] to-deep-purple-light/30 px-4 py-10 sm:px-16 sm:py-16 text-center">
          {/* Background glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-gold/[0.06]" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-gold/[0.04]" />

          <div className="relative">
            <Gift size={40} className="mx-auto mb-5 text-gold" />
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to find the perfect gift?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-lg text-white/50">
              Start by describing who you're buying for.
            </p>

            {/* Inline search bar */}
            <form
              onSubmit={handleSearch}
              className="mx-auto mt-8 w-full max-w-lg"
            >
              <div className="flex items-stretch rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm focus-within:border-gold/40 focus-within:shadow-md focus-within:shadow-gold/10 transition-all">
                <div className="flex items-center pl-4 sm:pl-5 pointer-events-none">
                  <Search size={20} className="text-white/30" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. My dad, 60, loves fishing, budget £50"
                  className="flex-1 min-w-0 rounded-xl border-0 bg-transparent py-4 px-4 sm:px-5 text-base text-white placeholder-white/30 outline-none"
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-r-xl bg-gold px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold text-deep-purple shadow-lg shadow-gold/20 transition-all hover:bg-gold-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Sparkles size={16} />
                  Find gifts
                </button>
              </div>
            </form>

            {/* Quick links */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {["Birthday", "Christmas", "Anniversary", "Valentine's Day"].map(
                (occasion) => (
                  <button
                    type="button"
                    key={occasion}
                    onClick={() => {
                      const params = new URLSearchParams({
                        q: `gift ideas for ${occasion.toLowerCase()}`,
                      });
                      navigate(`/results?${params.toString()}`);
                    }}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/60 transition-all hover:border-gold/40 hover:bg-gold-subtle hover:text-gold"
                  >
                    {occasion}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
