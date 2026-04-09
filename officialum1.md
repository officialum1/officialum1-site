# OfficialUM1 — Project Overview

Single source of truth for what this project is, what was built, and where things live. Use this to onboard quickly or hand off to the next agent.

---

## 1. Project overview

- **What it is**: OfficialUM1 is the digital agency site (officialum1.com): marketing site, shop, blog/knowledge base, client dashboard, and internal admin plus tooling (Z2U automation, G2G, etc.).
- **Repo layout**:
  - Next.js app lives in this repo (e.g. `app/`, `components/`, `lib/`).
  - Chrome extension for Z2U lives in `z2u-thread-extender/`.
  - Separate Flutter admin mobile app; path and build steps are in `BUILD_MOBILE_APP.md`.

---

## 2. Tech stack

- **Web**: Next.js 15 (App Router), React 19, TypeScript, Tailwind, Framer Motion.
- **Backend**: Next.js API routes, MySQL via `lib/db.ts`, server-side auth in `lib/auth.ts`.
- **Deploy**: Vercel; environment variables and checklist in `DEPLOYMENT.md`.
- **Mobile**: Flutter admin app; build steps in `BUILD_MOBILE_APP.md`.

---

## 3. Main application (Next.js)

- **Public**: Home (`app/page.tsx`), shop, services, blog, knowledge base, checkout, auth (login, register, forgot-password), delivery page, reviews, etc.
- **Admin**: `/admin/login` then dashboard; tabs include Z2U, G2G, inventory, indexing, catalog, payments, HR, etc. Auth via `ADMIN_PASSWORD` and/or DB session.
- **APIs**: Under `app/api/` — e.g. `admin/z2u`, `admin/settings`, `webhook/g2g/*`, `products`, `blogs`, `kb`, health check.

---

## 4. Z2U integration (current behavior)

- **Purpose**: Automate “Batch Sort” on Z2U.com manage list page (bump listings).

- **Chrome extension** (`z2u-thread-extender/`):
  - **Batch sort only**: Select-all + click Batch Sort on manage list. No thread expand, no relist, no extend.
  - **Where**: Injected on Z2U `sell/manageList`; worker popup opens with `?worker=1`, runs batch sort, then closes.
  - **Satellite mode**: Background opens a 1x1 popup on an interval to run batch sort and close.
  - **Logging**: Actions logged in extension storage and optionally sent to OfficialUM1 API (`log_bump`).

- **Backend** (`app/api/admin/z2u/route.ts`):
  - `POST` with `action: 'log_bump'`: writes to `z2u_bump_logs` (allowed with `x-admin-password` header or env `ADMIN_PASSWORD`).
  - Authenticated: sync listings (upsert into `z2u_listings`), delete listing, GET listings, GET bump logs.

- **Admin UI**: `app/admin/z2u/page.tsx` and `components/admin/tabs/Z2UTab.tsx` — view/sync listings, bump logs, settings. Extension popup uses `z2u-thread-extender/dashboard.html` (Batch Sort label, logs, satellite toggle, admin password).

- **DB**: Tables `z2u_listings` (id, title, price, stock, status, last_sync, url, editUrl, relistUrl, extendUrl) and `z2u_bump_logs` (message, type, created_at). Schema/init in `lib/db.ts`; standalone scripts: `setup_z2u_db.js`, `scripts/setup_z2u_logs.js`, `fix_z2u_schema.js`.

---

## 4.1 Z2U Intel (AI live market research)

- **Purpose**: Search Z2U/G2G live (via AI web search), find hot buyer keywords + demand/competition gaps, and generate a ready-to-publish listing plan (title, pricing, SEO description, ranking tips) plus quick wins.
- **Admin navigation**: Added to the Admin Workspace sidebar “Content & Tools” right after “🚀 Google Indexing” (implemented inside `app/admin/inventory/page.tsx`) and navigates to `/admin/z2u-intel`.
- **Page**: `app/admin/z2u-intel/page.tsx`
  - Inputs: Platform (Z2U/G2G), Category, Game/Product, “Analyze Now” with loading spinner
  - Results: Hot Keywords table, Best Offer card (copy buttons), Quick Wins list, italic AI summary
  - Issue fixed: page was rendering standalone (no admin shell). It’s now wrapped with the Admin Workspace chrome (Navbar + sticky left sidebar) so it matches other admin pages.
- **API**: `app/api/admin/z2u-intel/route.ts`
  - Auth: `x-admin-password` must match `process.env.ADMIN_PASSWORD`
  - Anthropic: uses `process.env.ANTHROPIC_API_KEY`, model `claude-sonnet-4-20250514`, and web search tool `web_search_20250305`
  - Output: returns strict JSON (or `{ error: "Analysis failed, try again" }` with 500 on parse failure)

---

## 5. Other notable areas

- **G2G**: Webhooks and tables `g2g_orders`, `g2g_offers`; admin G2G page.
- **Extension (other)**: `extension/` — separate from `z2u-thread-extender`; different manifest and content scripts (e.g. bridge, popup).
- **z2u.html**: Standalone HTML in repo (e.g. scraping/legacy); not the main Next.js app.

---

## 6. Key files quick reference

| Area | Path |
|------|------|
| Config / env | `package.json`, `next.config.ts`, `vercel.json`, `DEPLOYMENT.md`, `.env` (not committed) |
| DB / auth | `lib/db.ts`, `lib/auth.ts` |
| Z2U extension | `z2u-thread-extender/content.js` (batch sort logic), `z2u-thread-extender/background.js` (worker popup) |
| Z2U API / admin | `app/api/admin/z2u/route.ts`, `components/admin/tabs/Z2UTab.tsx` |
| Z2U Intel | `app/admin/z2u-intel/page.tsx`, `app/api/admin/z2u-intel/route.ts` |
| Admin | `app/admin/login`, `app/admin/dashboard`, `app/admin/z2u`, `app/admin/settings` |

---

## 7. Current state and decisions

- **Z2U extension**: Only batch sort is implemented. Thread expansion, relist, and extend were removed; the worker does a single step (batch sort) then closes.
- **Docs**: `z2u-thread-extender/README.md` describes the extension; `DEPLOYMENT.md` and `BUILD_MOBILE_APP.md` cover deploy and mobile.

---

## How to continue

To add a feature or fix: find the relevant app route or component (and Z2U extension file if it’s extension-related), then implement. For env vars and production setup, use `DEPLOYMENT.md`. For Z2U behavior, all logic is in `z2u-thread-extender/` and `app/api/admin/z2u/route.ts`.
