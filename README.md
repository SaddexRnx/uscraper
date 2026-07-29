# Ultra Scraper — Frontend

A clean, professional SaaS-style dashboard for the **Ultra Scraper** backend. Built with React 19, TanStack Start/Router, Tailwind CSS v4, shadcn/ui and Lucide icons. Live at **https://uscraper.duckdns.org/**.

> **Backend repo:** https://github.com/SaddexRnx/ultra_fork
> **Upstream:** [Scrapling by d4vinci](https://github.com/d4vinci/Scrapling) — trimmed down to ~500 lines of orchestration for speed.


---

## What this app does

Ultra Scraper is a browser UI over a FastAPI scraping backend. You paste a URL, add CSS selectors, and get structured JSON back — with automatic fallbacks that defeat most anti-bot systems (curl_cffi → stealth browser → paid proxy fallback).

The frontend gives you:

- **Login** — trial token or Telegram (mock), stored locally.
- **Dashboard** — URL input, tag-based CSS selector input with an "Auto-Detect (AI)" helper, live status cycling while the scrape runs, and grouped results with copy/export.
- **Results view** — metadata banner (status, method used, cached), per-selector groups, one-click copy, and **Export JSON / CSV**.
- **History** — local table of the last successful scrapes (stored in `localStorage`).
- **Settings** — configure the **Backend API URL** and optional **Bring-Your-Own-Proxy** keys (ScraperAPI, ZenRows, ScrapingBee).
- **Admin panel** — token generation with quota limits. Unlocked by logging in with any token starting with `ADMIN-` (e.g. `ADMIN-DEV`).
- **Quota badge** in the header (e.g. `12 / 50`).

Design constraints: no gradients, solid colors only, subtle borders/shadows, Vercel/Stripe-style spacing. Fully responsive — desktop sidebar, mobile bottom nav.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | React 19 + TanStack Start v1 (Vite 7) |
| Routing | TanStack Router (file-based, `src/routes/`) |
| Styling | Tailwind CSS v4 (via `src/styles.css`) |
| Components | shadcn/ui + Lucide React |
| State | React Context (`AuthProvider`) + `localStorage` |
| Notifications | `sonner` |
| Package manager | `bun` (npm/pnpm also work) |

---

## Project structure

```text
src/
├── routes/                          # File-based routes
│   ├── __root.tsx                   # App shell + <Toaster />
│   ├── index.tsx                    # Redirect: /login or /dashboard
│   ├── login.tsx                    # Trial token / Telegram tabs
│   ├── _authenticated.tsx           # Sidebar + mobile nav + quota badge
│   ├── _authenticated.dashboard.tsx # Main scraper UI
│   ├── _authenticated.history.tsx   # Local scrape history table
│   ├── _authenticated.settings.tsx  # API URL + BYOK proxy config
│   └── _authenticated.admin.tsx     # Admin-only token generator
├── components/scraper/
│   ├── SelectorInput.tsx            # Tag-based CSS selector input
│   ├── LoadingStatus.tsx            # Rotating status skeleton
│   ├── ResultsView.tsx              # Grouped results + copy/export
│   ├── HistoryPanel.tsx             # Sidebar history
│   └── SettingsDialog.tsx           # Backend URL modal
└── lib/
    ├── scraper-types.ts             # Types + storage keys + default API URL
    ├── auth-context.tsx             # Token, user, quota, hydration
    └── api-client.ts                # fetch wrapper with Bearer auth + timeouts
```

---

## How it talks to the backend

All requests go through `src/lib/api-client.ts`, which:

1. Reads the base URL from `localStorage` (`ultra-scraper:api-url`), defaulting to `https://uscraper.duckdns.org`.
2. Attaches `Authorization: Bearer <token>` when a token is stored.
3. Sends JSON, times out after 60 s, and surfaces server error messages via `ApiError`.

The main scrape call is:

```http
POST {BASE_URL}/scrape
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://example.com/product",
  "selectors": ["h1", ".price"]
}
```

Response shape:

```json
{
  "url": "https://example.com/product",
  "status": 200,
  "cached": false,
  "method_used": "curl_cffi",
  "data": {
    "h1": ["Product Title"],
    ".price": ["$19.99"]
  }
}
```

`method_used` is one of `curl_cffi`, `stealthy_fallback`, or the paid-proxy fallback — see the [backend README](https://github.com/SaddexRnx/uscraper#readme) for the full fallback chain.

---

## Local development

```sh
git clone https://github.com/SaddexRnx/uscraper-frontend.git
cd uscraper-frontend
bun install        # or: npm install
bun run dev        # Vite dev server on http://localhost:8080
```

Point it at your own backend from the **Settings** page (gear icon) — no `.env` required.

### Build

```sh
bun run build
bun run preview
```

The app targets Cloudflare Workers via TanStack Start's edge output. Any static host that supports SPA fallback works too.

---

## Auth model (mock, frontend-only)

- Tokens are stored in `localStorage` under `ultra-scraper:token`.
- Any token starting with `ADMIN-` (case-insensitive) grants admin privileges and unlocks `/admin`.
- Quota is tracked client-side (`ultra-scraper:quota`) and increments after every successful scrape.
- Wire this up to the backend's real auth when ready — swap `AuthProvider` in `src/lib/auth-context.tsx`.

---

## Notes

- No gradients, anywhere — enforced across the design system.
- SSR is disabled on routes that touch `localStorage` (login, index redirect).
- History is local-first; the backend has its own `/history` endpoint you can wire in if you want cross-device history.

---

## Credits & thanks

- **Upstream:** [Scrapling by d4vinci](https://github.com/d4vinci/Scrapling) — the framework this project stands on. If you like it, **give it a ⭐**.
- If you like **Ultra Scraper**, a ⭐ on this repo means a lot.
- Built by **Saddex** — portfolio: https://saddexrnx.github.io/
- Contact / trial codes on Telegram: **[@Saddex_x](https://t.me/Saddex_x)**

