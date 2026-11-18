# Ultra Scraper (frontend)

A browser dashboard for the [Ultra Scraper](https://github.com/SaddexRnx/ultra_fork) API. Paste a URL, add CSS selectors, and get structured JSON back. Live at https://uscraper.duckdns.org/.

Built with React 19, TanStack Start, Tailwind CSS v4, shadcn/ui, and Lucide.

## What it does

The backend handles the scraping and tries progressively heavier methods when a site fights back (curl_cffi, then a stealth browser, then an optional paid proxy). This app is the interface on top of it.

- **Login** with a trial token or Telegram (mock), stored locally
- **Dashboard** with a URL field, tag-based selector input, an "Auto-Detect (AI)" helper, live status while a scrape runs, and grouped results you can copy or export
- **Results view** showing status, method used, and whether the response was cached, with one-click copy and JSON/CSV export
- **History** of recent scrapes in `localStorage`
- **Settings** for the backend API URL and optional proxy keys (ScraperAPI, ZenRows, ScrapingBee)
- **Admin panel** for generating tokens with quota limits, unlocked by logging in with any token starting with `ADMIN-`
- **Quota badge** in the header

No gradients anywhere. Solid colors, subtle borders, a desktop sidebar and mobile bottom nav.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | React 19 + TanStack Start (Vite 7) |
| Routing | TanStack Router, file-based |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Lucide React |
| State | React Context and `localStorage` |
| Notifications | sonner |
| Package manager | bun (npm and pnpm work too) |

## Layout

```
src/
├── routes/                          # File-based routes
│   ├── __root.tsx                   # App shell and toaster
│   ├── index.tsx                    # Redirect to login or dashboard
│   ├── login.tsx
│   ├── _authenticated.tsx           # Sidebar, mobile nav, quota badge
│   ├── _authenticated.dashboard.tsx
│   ├── _authenticated.history.tsx
│   ├── _authenticated.settings.tsx
│   └── _authenticated.admin.tsx
├── components/scraper/
│   ├── SelectorInput.tsx
│   ├── LoadingStatus.tsx
│   ├── ResultsView.tsx
│   ├── HistoryPanel.tsx
│   └── SettingsDialog.tsx
└── lib/
    ├── scraper-types.ts
    ├── auth-context.tsx
    └── api-client.ts
```

## How it calls the backend

Everything goes through `src/lib/api-client.ts`. It reads the base URL from `localStorage` (default `https://uscraper.duckdns.org`), attaches the bearer token if one is stored, and sends JSON with a 60 second timeout.

```http
POST {BASE_URL}/scrape
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://example.com/product",
  "selectors": ["h1", ".price"]
}
```

The response includes `url`, `status`, `cached`, `method_used`, and a `data` object keyed by selector. See the [backend README](https://github.com/SaddexRnx/ultra_fork) for the full fallback chain.

## Run it locally

```sh
git clone https://github.com/SaddexRnx/uscraper.git
cd uscraper
bun install
bun run dev
```

The dev server runs on http://localhost:8080. Point it at your own backend from the Settings page, no `.env` needed.

```sh
bun run build
bun run preview
```

The app targets Cloudflare Workers through TanStack Start. Any static host with SPA fallback works too.

## About the auth

This is a mock, frontend-only auth model. Tokens live in `localStorage` under `ultra-scraper:token`, any token starting with `ADMIN-` grants admin access, and quota is tracked client-side. Swap out `AuthProvider` in `src/lib/auth-context.tsx` when you want to use the backend's real auth.

## Credits

[Scrapling by d4vinci](https://github.com/d4vinci/Scrapling) is the framework underneath all of this. Built by Saddex. Portfolio: https://saddexrnx.github.io/. Contact: [@Saddex_x](https://t.me/Saddex_x).
