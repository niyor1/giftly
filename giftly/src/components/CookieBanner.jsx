import { useState, useEffect } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "giftly_cookie_dismissed";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      // Small delay so the banner doesn't flash on first load
      const id = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(id);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-deep-purple-light/95 backdrop-blur-xl p-5 shadow-2xl sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1 text-sm leading-relaxed text-white/70 sm:text-base">
              <p className="font-semibold text-white mb-1">
                🍪 Cookies & Affiliate Disclosure
              </p>
              <p>
                Giftly uses local storage to save your wishlist preferences. Some links on this site are affiliate links — if you make a purchase through them, we may earn a small commission at no extra cost to you. This helps keep Giftly free and running.
              </p>
            </div>
            <button
              onClick={dismiss}
              className="flex-shrink-0 rounded-full p-1.5 text-white/40 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
