import { Link } from "react-router-dom";
import { Heart, Mail, MessageCircle, Camera, Link2 } from "lucide-react";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Occasions", path: "/occasions" },
  { label: "Wishlists", path: "/wishlist" },
  { label: "How It Works", path: "/how-it-works" },
];

const socialLinks = [
  { icon: MessageCircle, href: "#", label: "Twitter / X" },
  { icon: Camera, href: "#", label: "Instagram" },
  { icon: Link2, href: "#", label: "GitHub" },
  { icon: Mail, href: "#", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-deep-purple-light/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-lg font-bold">
              <span className="text-xl">🎁</span>
              <span className="text-gold">Giftly</span>
            </Link>
            <p className="mt-3 text-sm text-white/50 leading-relaxed">
              AI-powered gift discovery for every occasion, person, and budget.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
              Navigate
            </h3>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/60 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
              Follow Us
            </h3>
            <ul className="flex gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/40 hover:text-gold transition-colors"
                  >
                    <Icon size={20} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Affiliate */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
              Disclosure
            </h3>
            <p className="text-xs text-white/35 leading-relaxed">
              Giftly earns commissions from affiliate links on this site. This helps us keep the
              service free. Prices and availability are subject to change.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/30 md:flex-row">
          <p>© {new Date().getFullYear()} Giftly. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={14} className="text-gold" fill="currentColor" /> for gift-givers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
