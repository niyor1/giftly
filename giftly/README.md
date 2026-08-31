# Giftly 🎁

AI-powered gift discovery for every occasion, person, and budget.

## Overview

Giftly helps you find the perfect gift by describing who you're buying for. It combines AI-generated gift ideas with hand-curated product data to deliver personalized recommendations — complete with direct purchase links via Amazon affiliate integrations.

## Features

- **AI-powered search** — Describe your recipient (interests, age, style, budget) and get 12 tailored gift ideas
- **Smart filtering** — Filter by budget, category, or occasion
- **Wishlists** — Create named wishlists, save items across multiple lists
- **Direct purchase links** — One-click Amazon affiliate links for every gift
- **Responsive design** — Works beautifully on mobile and desktop

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Vite](https://vite.dev) + React 19 |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Routing | [React Router v7](https://reactrouter.com) |
| Icons | [Lucide](https://lucide.dev) |
| AI Engine | [Ollama](https://ollama.ai) (local LLM) |
| Testing | [Vitest](https://vitest.dev) + [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) |

## Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org)
- [Ollama](https://ollama.ai) installed and running locally
- A model pulled in Ollama (default: `qwen3:35b`)

```bash
ollama pull qwen3:35b
```

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd giftly

# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Environment Configuration

Copy `.env.example` to `.env` and customize as needed:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_OLLAMA_URL` | `http://localhost:11434/api/chat` | Ollama API endpoint |
| `VITE_OLLAMA_MODEL` | `qwen3:35b` | Model name (must be pulled locally) |
| `VITE_FETCH_TIMEOUT` | `60000` | Request timeout in milliseconds |

## Project Structure

```
giftly/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── GiftCard.jsx   # Individual gift card display
│   │   ├── StarRating.jsx # 5-star rating with half-stars
│   │   ├── Navbar.jsx     # Top navigation bar
│   │   ├── Footer.jsx     # Site footer
│   │   └── ...
│   ├── context/           # React contexts (loading state)
│   ├── data/              # Static data (mock gifts, reviews)
│   ├── hooks/             # Custom React hooks
│   │   ├── useGiftSearch.js  # AI search hook
│   │   └── useWishlists.js   # Wishlist management hook
│   ├── pages/             # Page components
│   │   ├── Home.jsx       # Landing page
│   │   ├── Results.jsx    # Search results page
│   │   ├── Wishlist.jsx   # Wishlist management
│   │   └── ...
│   ├── tests/             # Test files
│   │   ├── utils/         # Utility function tests
│   │   └── hooks/         # Hook tests
│   ├── utils/             # Shared utility functions
│   └── App.jsx            # App shell + routing
├── .env.example           # Environment variable template
├── vite.config.js         # Vite configuration
└── package.json
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run [oxlint](https://oxc.rs) for code quality checks |
| `npm test` | Start Vitest in watch mode |
| `npm run test:run` | Run all tests once and exit |

## Testing

```bash
# Run all tests
npm test

# Run a specific test file
npx vitest run src/tests/utils/helpers.test.js
```

Tests cover:
- **Utility functions** (47 tests) — URL sanitization, JSON extraction, price parsing, budget extraction
- **useGiftSearch hook** (12 tests) — search flow, error handling, sanitizeUrl validation
- **useWishlists hook** (15 tests) — flat IDs, named lists CRUD, localStorage persistence

## Architecture Notes

### AI Integration

Giftly uses a local Ollama instance for gift generation. The `useGiftSearch` hook:

1. Sends the user's query to Ollama with a system prompt enforcing JSON-only output
2. Parses and validates the response (handles markdown-wrapped JSON, raw arrays, etc.)
3. Normalizes results into a GiftCard-compatible format with URL sanitization
4. Retries once with a stricter prompt if the first attempt fails

### State Management

- **`AiLoadingContext`** — Global loading state shared across pages (prevents double-submits)
- **`useWishlists` hook** — Local state + localStorage persistence for wishlists
- **Flat ID store** — Backward compatibility layer for home page heart icons

### Security

- All URLs are sanitized via `sanitizeUrl()` to reject `javascript:`, `data:`, and other non-HTTP protocols
- Input validation (min 3 chars, max 200 chars) reduces prompt injection surface
- System prompts are extracted to `src/config/ai.js` for easier maintenance

## License

MIT
