import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gold text-deep-purple shadow-lg shadow-gold/30 transition-all hover:bg-gold-hover hover:scale-110 active:scale-95"
      aria-label="Back to top"
    >
      <ChevronUp size={24} strokeWidth={2.5} />
    </button>
  );
}
