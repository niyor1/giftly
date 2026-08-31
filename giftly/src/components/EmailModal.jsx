import { useState, useEffect } from "react";
import { X, Mail } from "lucide-react";

export default function EmailModal({ open, onClose, onSubmit }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail("");
      setSubmitted(false);
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitted(true);
      setTimeout(() => onSubmit(email), 600);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-deep-purple-light p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center text-center py-6">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Mail size={28} />
            </div>
            <h3 className="text-xl font-bold text-white">List sent!</h3>
            <p className="mt-2 text-sm text-white/50">
              Your curated gift list has been sent to your inbox.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
              <Mail size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Email your gift list</h3>
            <p className="mt-2 text-sm text-white/50">
              We'll send your curated results to your inbox so you can share them with friends and family.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/40">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={submitting}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                />
              </div>

              <button
                type="submit"
                disabled={!email.trim() || submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-3 text-sm font-bold text-deep-purple shadow-lg shadow-gold/20 transition-all hover:bg-gold-hover hover:shadow-gold-hover/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <Mail size={16} />
                )}
                {submitting ? "Sending…" : "Send my list"}
              </button>

              <p className="text-center text-xs text-white/25">
                No spam, ever. We'll only send your gift list.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
