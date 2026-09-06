# Contributing to Giftly

Thank you for your interest in contributing to Giftly! This document provides everything you need to know to make a successful contribution.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Branch Naming Convention](#branch-naming-convention)
- [Running Locally](#running-locally)
- [Code Style Guidelines](#code-style-guidelines)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Writing a Good PR Description](#writing-a-good-pr-description)

## Code of Conduct

By participating in this project, you agree to treat all contributors with respect and to follow our [Code of Conduct](CODE_OF_CONDUCT.md) (when available). Please be constructive and patient when giving or receiving feedback.

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repo on GitHub, then clone your fork:
git clone https://github.com/YOUR_USERNAME/giftly.git
cd giftly/giftly

# Add the upstream remote:
git remote add upstream https://github.com/niyor1/giftly.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY and SERPAPI_KEY
```

### 4. Run the Development Server

```bash
npm run dev
# Opens http://localhost:5173
```

## Branch Naming Convention

Use descriptive branch names with one of these prefixes:

| Prefix    | Purpose                          | Example                              |
|-----------|----------------------------------|--------------------------------------|
| `feature/` | New features                    | `feature/wishlist-page`              |
| `fix/`     | Bug fixes                       | `fix/gift-card-layout`               |
| `docs/`    | Documentation changes           | `docs/contributing-guide`            |
| `chore/`   | Maintenance (deps, config)      | `chore/update-deps`                  |
| `refactor/`| Code refactoring (no behavior change) | `refactor/api-client`           |

**Rules:**

- Use kebab-case (lowercase with hyphens)
- Keep names under 50 characters
- One branch per feature or fix

## Running Locally

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview the Production Build Locally

```bash
npm run preview
```

### Run Tests

```bash
# Watch mode (re-runs on file changes)
npm test

# Run once and exit
npm run test:run
```

### Lint

```bash
npm run lint
```

## Code Style Guidelines

### General Principles

- **Keep it simple** — prefer readable code over clever code
- **Consistency wins** — match the existing style in the file you're editing
- **Comment the "why"** — explain intent, not what the code does (the code shows that)

### JavaScript / JSX

- Use functional components with hooks (no class components)
- Follow the existing naming conventions:
  - Components: PascalCase (`GiftCard.jsx`)
  - Hooks: camelCase with `use` prefix (`useGiftSearch.js`)
  - Utilities: camelCase (`helpers.js`)
  - Constants: UPPER_SNAKE_CASE
- Use named exports over default exports for utilities and hooks
- Keep components under ~150 lines; extract logic into custom hooks when it grows larger

### CSS / Tailwind

- Use Tailwind utility classes inline where possible
- Group related classes logically (e.g., layout → spacing → typography → color)
- Avoid arbitrary values (`w-[367px]`) — prefer Tailwind's built-in scale

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`

Examples:

```
feat(results): add price sorting dropdown
fix(navbar): fix mobile menu z-index overlap
docs(readme): update deployment section
```

## Submitting a Pull Request

### Before You Submit

1. **Rebase on main** — make sure your branch is up to date:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run the linter and tests** — no errors or warnings:
   ```bash
   npm run lint
   npm run test:run
   ```

3. **Test manually** — open the app in your browser and verify the feature works as expected

4. **Commit with a clear message** — follow the commit style above

### Opening the PR

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-branch-name
   ```

2. Go to [github.com/niyor1/giftly/pulls](https://github.com/niyor1/giftly/pulls) and click **New Pull Request**

3. Fill in the PR template (see below)

4. Request a review from the maintainers

### What Makes a Good PR Description?

A great PR description helps reviewers understand your changes quickly:

#### ✅ Do this:

```markdown
## Description of changes

Added a price sorting dropdown to the results page. Users can now sort gift
recommendations by price (low-to-high or high-to-low).

### Screenshots
<!-- Before and after screenshots help reviewers see the visual change -->

### How I tested it
1. Opened http://localhost:5173/results?q=test&budget=50
2. Clicked the sort dropdown — verified items reorder correctly
3. Tested on mobile viewport (375px) — dropdown still functions
```

#### ❌ Avoid this:

```markdown
## Changes made

Fixed stuff.

### Testing
Tested it.
```

### PR Checklist

- [ ] Branch is up to date with `upstream/main`
- [ ] Code follows the project's style guidelines
- [ ] No console errors or warnings in the browser
- [ ] Tests pass (`npm run test:run`)
- [ ] Linter is clean (`npm run lint`)
- [ ] PR description explains **what** and **why**
- [ ] Screenshots included for UI changes
- [ ] Environment variables documented if new ones were added

## Getting Help

If you're stuck or have questions:

1. Check existing [issues](https://github.com/niyor1/giftly/issues) — your question may already be answered
2. Open a new issue with the `question` label
3. Feel free to tag a maintainer in your PR for guidance

---

Thank you for contributing to Giftly! 🎁
