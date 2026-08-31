import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Occasions", path: "/occasions" },
  { label: "Wishlists", path: "/wishlist" },
  { label: "How It Works", path: "/how-it-works" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => setMobileOpen(false), [location]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-shadow duration-300 ${
        scrolled ? "shadow-lg shadow-black/20" : ""
      }`}
    >
      <nav
        className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
          scrolled
            ? "mt-3 rounded-2xl bg-deep-purple/70 backdrop-blur-xl border border-white/10"
            : "pt-3 sm:pt-5"
        }`}
      >
        <div className="flex h-12 sm:h-14 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span className="text-2xl">🎁</span>
            <span className="text-gold">Giftly</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} active={location.pathname === link.path}>
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden rounded-lg p-2.5 sm:p-2 text-white/70 hover:text-gold transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden px-1 pb-4 border-t border-white/10 mt-2 pt-4 space-y-1">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} active={location.pathname === link.path}>
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`relative py-3 sm:py-2 text-sm font-medium transition-colors ${
        active ? "text-gold" : "text-white/70 hover:text-white"
      }`}
    >
      {children}
      {active && (
        <span className="absolute -bottom-[5px] left-0 right-0 h-[2px] bg-gold rounded-full" />
      )}
    </Link>
  );
}
