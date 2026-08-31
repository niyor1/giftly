import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Occasions from "./pages/Occasions";
import Results from "./pages/Results";
import Wishlist from "./pages/Wishlist";
import HowItWorks from "./pages/HowItWorks";
import NotFound from "./pages/NotFound";
import BackToTop from "./components/BackToTop";
import CookieBanner from "./components/CookieBanner";
import PageTransition from "./components/PageTransition";
import ErrorBoundary from "./components/ErrorBoundary";
import { AiLoadingProvider } from "./context/AiLoadingContext";

// ── Wrapper that applies page transitions + back-to-top ─────────────

function AppShell({ children }) {
  return (
    <>
      <PageTransition>
        {children}
      </PageTransition>
      <BackToTop />
      <CookieBanner />
    </>
  );
}

// ── Placeholder pages ───────────────────────────────────────────────

function WishlistPage() {
  return <AppShell><Wishlist /></AppShell>;
}

function HowItWorksPage() {
  return <AppShell><HowItWorks /></AppShell>;
}

// ── Home wrapper (navigates to /results on search) ──────────────────

function HomeWithSearch() {
  const navigate = useNavigate();

  const handleSearch = (query, budget) => {
    if (!query.trim()) return;
    const params = new URLSearchParams({ q: query });
    if (budget < 500) params.set("budget", String(budget));
    navigate(`/results?${params.toString()}`);
  };

  return (
    <AppShell>
      <Home onSearch={handleSearch} />
    </AppShell>
  );
}

// ── App shell ───────────────────────────────────────────────────────

function App() {
  return (
    <AiLoadingProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <div className="flex min-h-screen flex-col">
            <Navbar />
          <main className="flex-1 pt-24">
            <Routes>
              <Route path="/" element={<HomeWithSearch />} />
              <Route path="/occasions" element={<AppShell><Occasions /></AppShell>} />
              <Route path="/results" element={<AppShell><Results /></AppShell>} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="*" element={<AppShell><NotFound /></AppShell>} />
            </Routes>
          </main>
          <Footer />
          </div>
        </ErrorBoundary>
      </BrowserRouter>
    </AiLoadingProvider>
  );
}

export default App;
