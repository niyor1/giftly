import { Gift, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
      {/* Animated gift box */}
      <div className="relative mb-8">
        <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gold/10 animate-bounce-slow">
          <Gift size={56} className="text-gold" />
        </div>
      </div>

      <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
        404
      </h1>
      <p className="mt-4 max-w-md text-lg text-white/50">
        Oops! This gift seems to have wandered off. Let's get you back on track.
      </p>

      <a
        href="/"
        className="mt-8 flex items-center gap-2 rounded-xl bg-gold px-8 py-3.5 text-base font-bold text-deep-purple shadow-lg shadow-gold/20 transition-all hover:bg-gold-hover hover:shadow-gold-hover/30"
      >
        <ArrowLeft size={18} />
        Back to home
      </a>

      {/* Decorative dots */}
      <div className="mt-16 flex gap-3">
        {["🎁", "🎀", "🎊"].map((emoji, i) => (
          <span
            key={i}
            className="text-2xl animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            {emoji}
          </span>
        ))}
      </div>
    </div>
  );
}
