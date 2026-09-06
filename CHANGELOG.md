# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-09-06

### Added

- **AI-powered gift recommendations** — Google Gemini (gemini-3.6-flash) generates personalized gift ideas based on user description and budget
- **Real-time product data** — SerpApi integration fetches live Google Shopping results with prices, images, and retailer info
- **Home page** with search form (recipient description + budget selector)
- **Results page** displaying gift cards with product thumbnails, prices, and shopping links
- **Occasions page** — browse curated gift ideas by occasion type
- **Wishlist page** — save favourite gifts to browser localStorage
- **How It Works page** — explainer for first-time users
- **Popular gifts section** — trending products fetched via `/api/popular-gifts`
- **Email sharing modal** — share gift lists via email directly from results
- **Cookie consent banner** — GDPR-compliant cookie notice
- **Star rating component** — visual star ratings on gift cards
- **Toast notification system** — success/error feedback for user actions
- **Page transition animations** — smooth enter/exit transitions between routes
- **Back-to-top button** — floating scroll-to-top control
- **Error boundary** — graceful error handling with fallback UI
- **404 not-found page** — custom missing-page route
- **Responsive design** — mobile-first layout across all pages
- **API routes** — `/api/recommendations` (POST) and `/api/popular-gifts` (GET)
- **URL sanitization** — safe link handling for product URLs
- **Testing setup** — Vitest + React Testing Library with hook and utility tests
- **Environment variable template** — `.env.example` for local development
- **MIT License**
- **Contributing guide** — branch conventions, PR template, code style
- **Changelog** — this file

### Changed

- Unified product link handling with a shared `sanitizeUrl()` utility across API routes
- Standardised error responses — empty arrays (`[]`) returned gracefully when APIs are unavailable
- Tailwind CSS v4 via Vite plugin for faster builds and smaller bundles

### Fixed

- Resolved SerpApi timeout issues by adding proper error boundaries in API handlers
- Fixed Gemini JSON parse failures by stripping markdown code fences from model output
- Corrected popular gifts section data flow across pages
- Export error fixes for Vercel serverless deployment

### Removed

- Ollama-based local AI fallback (moved to Google Gemini API only)

---

## [Unreleased]

_No unreleased changes yet._

<!-- Template for future versions:

## [X.Y.Z] — YYYY-MM-DD

### Added
- New feature description

### Changed
- Change description

### Fixed
- Bug fix description

### Removed
- Removal description
-->
