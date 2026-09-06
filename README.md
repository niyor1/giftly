# Giftly

<div align="center">

```
   _____          _     _       _
  / ____|        | |   (_)     | |
 | |     ___  _ __| |_  _ _ __ | |_
 | |    / _ \| '__| __|| | '_ \| __|
 | |___| (_) | |  | |_ | | | | | |_
  \_____\___/|_|   \__||_|_| |_|\__|
```

**AI-powered gift recommendations — described in seconds, delivered instantly.**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/niyor1/giftly/actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-purple.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](CHANGELOG.md)
[![Made with React](https://img.shields.io/badge/made_with-React-61DAFB.svg)](https://react.dev)

</div>

Giftly is a web application that helps you find the perfect gift in seconds. Simply describe who the gift is for, pick a budget range, and Giftly's AI engine generates tailored product suggestions with real prices, images, and direct shopping links.

## Screenshots

<!-- TODO: Add screenshots below once available -->
<!-- Place app screenshots (e.g., home page, results page) in `/public/screenshots/` and link them here -->

## Features

- 🎯 **AI-powered recommendations** — Describe the recipient and occasion; get personalized gift ideas powered by Google Gemini
- 💰 **Real-time pricing** — Live Google Shopping data via SerpApi ensures prices and availability are current
- 🔗 **Direct shopping links** — Every suggestion includes a link to buy from major UK retailers
- 🎨 **Beautiful UI** — Responsive, accessible interface built with Tailwind CSS and smooth page transitions
- ❤️ **Wishlist** — Save your favourite gifts for later using browser localStorage
- 🏷️ **Occasion explorer** — Browse curated gift ideas by occasion (birthday, wedding, Christmas, etc.)
- 🔍 **Popular gifts** — Discover trending products with a single click
- 📧 **Email sharing** — Share gift lists via email directly from the results page
- 🍪 **Cookie consent** — GDPR-friendly cookie banner

## Tech Stack

| Layer       | Technology                                     |
|-------------|------------------------------------------------|
| Frontend    | React 19                                       |
| Routing     | React Router DOM 7                             |
| Styling     | Tailwind CSS v4                                |
| Build tool  | Vite v8                                        |
| AI Engine   | Google Gemini API (gemini-3.6-flash)           |
| Product Data| SerpApi (Google Shopping)                      |
| Testing     | Vitest + React Testing Library                 |
| Linting     | Oxlint                                         |
| Deployment  | Vercel (auto-deploy via GitHub Actions)        |

## Live Demo

Try it live: [https://giftly.green.vercel.app](https://giftly.green.vercel.app)

> **Note:** The demo uses live API keys. Rate limits may apply.

## Prerequisites

Before setting up Giftly locally, make sure you have:

| Requirement       | Version     | Why                                          |
|-------------------|-------------|----------------------------------------------|
| Node.js           | 18+         | Runtime for Vite and React                   |
| npm               | 9+          | Package manager                              |
| Vercel account    | Free tier   | For deployment (optional)                    |
| Gemini API key    | —           | AI gift generation                           |
| SerpApi key       | —           | Google Shopping product data                 |

## Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/niyor1/giftly.git
cd giftly/giftly

# 2. Install dependencies
npm install

# 3. Create a local environment file
cp .env.example .env.local

# 4. Edit .env.local and add your API keys:
#    GEMINI_API_KEY=your_gemini_key_here
#    SERPAPI_KEY=your_serpapi_key_here

# 5. Start the development server
npm run dev

# 6. Open http://localhost:5173 in your browser
```

## Environment Variables

| Variable          | Description                  | Required | Where to get it                                        |
|-------------------|------------------------------|----------|--------------------------------------------------------|
| `GEMINI_API_KEY`  | Google Gemini API key        | Yes      | [Google AI Studio](https://aistudio.google.com/apikey) |
| `SERPAPI_KEY`     | SerpApi search key           | Yes      | [SerpApi](https://serpapi.com/)                        |

## Project Structure

```
giftly/
├── api/
│   ├── recommendations.js    # AI-powered gift recommendation endpoint
│   └── popular-gifts.js       # Trending/popular gifts endpoint
├── public/
│   ├── favicon.svg            # Site favicon
│   └── icons.svg              # Inline sprite icons
├── src/
│   ├── components/
│   │   ├── BackToTop.jsx      # Scroll-to-top button
│   │   ├── CookieBanner.jsx   # GDPR cookie consent banner
│   │   ├── EmailModal.jsx     # Email sharing modal
│   │   ├── ErrorBoundary.jsx  # React error boundary wrapper
│   │   ├── Footer.jsx         # Site footer
│   │   ├── GiftCard.jsx       # Individual gift product card
│   │   ├── Navbar.jsx         # Top navigation bar
│   │   ├── PageTransition.jsx # Page enter/exit animation
│   │   ├── StarRating.jsx     # Star rating display component
│   │   └── Toast.jsx          # Notification toast component
│   ├── config/
│   │   └── ai.js              # AI model configuration
│   ├── context/
│   │   └── AiLoadingContext.jsx  # AI loading state provider
│   ├── data/
│   │   └── mockData.js        # Fallback/mock gift data
│   ├── hooks/
│   │   ├── useGiftSearch.js   # Gift search API hook
│   │   └── useWishlist.js     # Wishlist localStorage hook
│   ├── pages/
│   │   ├── Home.jsx           # Landing page with search form
│   │   ├── HowItWorks.jsx     # Explainer page
│   │   ├── NotFound.jsx       # 404 page
│   │   ├── Occasions.jsx      # Browse by occasion page
│   │   ├── Results.jsx        # Gift results display page
│   │   └── Wishlist.jsx       # Saved wishlist page
│   ├── tests/
│   │   ├── hooks/             # Hook unit tests
│   │   ├── utils/             # Utility function tests
│   │   └── setup.js           # Test environment setup
│   ├── utils/
│   │   └── helpers.js         # Shared utility functions
│   ├── App.jsx                # Root component + routing
│   ├── index.css              # Global styles (Tailwind)
│   └── main.jsx               # Entry point
├── .env.example               # Environment variable template
├── .gitignore                 # Git ignore rules
├── .oxlintrc.json             # Oxlint configuration
├── index.html                 # HTML entry point
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite build configuration
└── vitest.config.*            # Vitest configuration
```

## How It Works

1. **Describe** — Enter a description of the gift recipient on the home page (e.g., "my dad who loves grilling")
2. **Set budget** — Choose your budget range
3. **Generate** — Click "Get Gift Ideas" to trigger the AI engine
4. **Browse results** — View personalized product suggestions with real prices, images, and retailer links
5. **Save or share** — Add items to your wishlist or share via email

## Deployment

Giftly is deployed on Vercel with automatic deployments:

1. Push to the `main` branch triggers a GitHub Actions workflow
2. The workflow runs `npm run build` to produce a production bundle
3. Vercel automatically deploys the built output
4. The live site at [giftly.green.vercel.app](https://giftly.green.vercel.app) is updated

**To deploy locally with Vercel:**

```bash
# Install the Vercel CLI
npm i -g vercel

# Login to your Vercel account
vercel login

# Deploy (reads from .env.local automatically)
vercel
```

## API Reference

### `POST /api/recommendations`

Generates AI-powered gift recommendations based on a user query.

| Field         | Type   | Required | Description                          |
|---------------|--------|----------|--------------------------------------|
| `query`       | string | Yes      | Gift description (e.g., "gift for mom") |
| `budgetRange` | number | Yes      | Budget in GBP                        |

**Response:** Array of product objects

```json
[
  {
    "title": "Smart Meat Thermometer",
    "price": "£45.99",
    "thumbnail": "https://...",
    "productLink": "https://retailer.co.uk/product",
    "retailer": "Amazon UK"
  }
]
```

**Flow:** User query → Gemini API generates search term → SerpApi fetches Google Shopping results → Returns up to 10 products.

### `GET /api/popular-gifts`

Returns trending/popular gift products from Google Shopping.

**Response:** Array of product objects (up to 6 items)

```json
[
  {
    "title": "Popular Gift Item",
    "price": "£29.99",
    "thumbnail": "https://...",
    "productLink": "https://retailer.co.uk/product",
    "retailer": "John Lewis"
  }
]
```

**Flow:** SerpApi searches Google Shopping for "popular gifts uk" → Returns top 6 results.

## Affiliate Links & Monetisation

Giftly generates revenue through affiliate marketing:

- Product links in search results may contain affiliate tracking parameters
- When a visitor clicks a product link and makes a purchase, Giftly earns a small commission from the retailer
- This comes at **no extra cost** to the user — the price you pay is the same as if you'd visited the retailer directly
- Affiliate relationships are disclosed in the footer and cookie banner

## Known Limitations

- 🇬🇧 **UK-focused** — Shopping data is currently limited to UK retailers (Google UK)
- 🔑 **API key required** — Both Gemini and SerpApi keys are needed for full functionality; without them, results return empty arrays
- ⚡ **AI latency** — Gift generation takes 5–15 seconds depending on API response time
- 📱 **Wishlist is local only** — Wishlist data is stored in browser localStorage and won't sync across devices
- 🔒 **No user accounts** — Giftly doesn't require login; all data stays in the browser

## Roadmap

Future features we'd like to build:

- [ ] User accounts with cloud-synced wishlists
- [ ] Price comparison across multiple countries/regions
- [ ] "Similar gifts" suggestions based on a liked item
- [ ] Gift card options alongside physical products
- [ ] Social sharing (Twitter, WhatsApp, Facebook)
- [ ] Dark mode toggle
- [ ] Browser extension for quick gift saving
- [ ] Email newsletter with weekly trending gifts
- [ ] Review/rating system for saved gifts
- [ ] Voice input for gift descriptions

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

Built with ❤️ by [Niyor Gogoi](https://github.com/niyor1)
