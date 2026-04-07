# OfficialUM1 Platform

## Overview

A full-stack digital agency and marketplace platform for OfficialUM1. Combines a premium marketing site, digital product marketplace (social media accounts), agency services, buyer accounts, blog, reviews, and support system.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/officialum1)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM (local) + MariaDB (`queryExt`) for external settings
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Routing**: Wouter (frontend), Express Router (backend)
- **UI**: shadcn/ui + Tailwind CSS v4
- **Theme**: Light/white design, PRIMARY=#4f7af5, SIDEBAR_BG=#0f172a, CONTENT_BG=#f0f4f8

## Mobile / Responsive Design

- **Logo**: `public/logo.svg` (U1 icon + OfficialUM1 wordmark), `public/favicon.svg` (U1 branded)
- **Bottom Nav**: `src/components/layout/BottomNav.tsx` — fixed bottom navigation bar on mobile (lg:hidden), 5 tabs: Home, Shop, Reviews, Services, Account
- **Safe areas**: CSS custom properties `--safe-top/bottom` using `env(safe-area-inset-*)` for iOS notch/home bar
- **Touch**: `-webkit-tap-highlight-color: transparent`, smooth scrolling, `overscroll-behavior: none`
- **AppLayout**: Includes BottomNav and spacer div for mobile content padding

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Public Pages

| Route | Purpose |
|---|---|
| `/` | Homepage — hero, stats, featured products, live orders, services, reviews, blog, newsletter |
| `/shop` | Product marketplace with search, filter by category, add to cart |
| `/shop/:id` | Product detail with reviews |
| `/cart` | Shopping cart |
| `/checkout` | Checkout with payment method selection |
| `/order-success` | Post-checkout confirmation |
| `/my-orders` | Buyer order history |
| `/orders/:id` | Order detail |
| `/dashboard` | Buyer dashboard |
| `/login` | Buyer login |
| `/register` | Buyer registration |
| `/services` | Agency services |
| `/about` | About page |
| `/blog` | Blog listing |
| `/blog/:slug` | Blog article |
| `/reviews` | Public reviews + testimonials |
| `/contact` | Contact form |
| `/support` | Support ticket system |
| `/membership` | Membership pricing |
| `/refer` | Referral program |
| `/privacy`, `/terms` | Legal pages |
| `/faq` | FAQ with search, category filter, accordion |
| `/work` | Portfolio / case studies with stats, filter, and DB projects |
| `/wishlist` | Saved items wishlist (localStorage-persistent) |
| `/bundles` | Bundle builder — 5% off 2 items, 15% off 3+ items |
| `/builder` | VIP Account Builder Wizard (Silver/Gold/Diamond only) |
| `/kb` | Knowledge base grouped by category with search |
| `/kb/:slug` | Individual KB article with helpful/not helpful voting |
| `/share-experience` | Submit a review/testimonial form |
| `/forgot-password` | Password reset request page |

## DB Schema (lib/db/src/schema/)

- `products` — product catalog with pricing, stock, platform, badges
- `categories` — product categories
- `orders` — customer orders with items JSON
- `users` — buyer accounts with wallet, referral codes
- `blogs` — blog content
- `reviews` — product and general reviews
- `services` — agency services
- `tickets` — support tickets with reply threads
- `contacts` — contact form submissions
- `newsletter` — email newsletter subscriptions

## API Routes (artifacts/api-server/src/routes/)

- `/api/products` — product catalog with search/filter
- `/api/products/featured` — featured products
- `/api/products/categories` — category list
- `/api/cart` — in-memory session cart
- `/api/orders` — order CRUD + checkout
- `/api/auth/*` — register, login, logout, me, dashboard
- `/api/blogs` — blog CRUD
- `/api/reviews` — review wall + stats
- `/api/services` — agency services
- `/api/stats/public` — homepage stats
- `/api/contact` — contact form
- `/api/newsletter/subscribe` — newsletter signup
- `/api/tickets` — support tickets

## Auth

Simple JWT-like token stored in localStorage (`um1_token`). Server reads Bearer token to identify users. Password hashed with SHA-256 + salt.

## SEO Architecture

### Infrastructure
- `react-helmet-async` — server-side compatible dynamic head management
- `src/lib/seo.ts` — schema generators: Organization, WebSite, Product, BlogPosting, FAQ, Breadcrumb, Review, Service
- `src/components/SEO.tsx` — universal SEO component (title, description, OG, Twitter/X, JSON-LD, breadcrumbs, noindex)
- `src/components/Breadcrumbs.tsx`, `FAQSection.tsx` — UI helpers
- `public/robots.txt` — noindex private paths, allow AI crawlers, sitemap reference
- `public/sitemap.xml` — static sitemap of all public pages
- `public/llms.txt`, `public/humans.txt` — AI and human discoverability files

### Per-Page SEO Coverage
Every public page has:
- Unique `<title>` and `<meta description>` (155 chars max)
- Open Graph + Twitter Card tags
- Canonical URL
- Breadcrumb JSON-LD
- Page-specific JSON-LD schema:
  - Home: Organization + WebSite + FAQ (5 Q&As)
  - Shop detail: Product schema with price, rating, availability
  - Blog detail: BlogPosting schema with author, dates
  - FAQ: FAQPage schema (all 25+ Q&As)
  - Services, KB, Reviews, etc.: breadcrumb only

### Noindex Pages
cart, checkout, order-success, my-orders, dashboard, login, register, forgot-password, wishlist, support, admin, refer, builder

## Admin Panel (artifacts/officialum1/src/pages/admin.tsx)

Admin route: `/admin`. Protected by HMAC token (`um1_admin_token` localStorage, 12h expiry).
Admin password from `ADMIN_PASSWORD` env var via `requireAdmin` middleware.

### Dedicated Panel Components
| Section | Panel | Backend |
|---|---|---|
| `dashboard` | Dashboard with KPI cards, recent orders | `/api/admin/dashboard` |
| `catalog` | CatalogPanel — product CRUD | `/api/admin/products` |
| `orders` | OrdersPanel — stats + status filter | `/api/admin/orders` |
| `reviews_center` | ReviewsPanel — star ratings + delete | `/api/admin/reviews` |
| `g2g` | G2GPanelFull — local listings CRUD, live G2G API (offers/orders/fulfill), settings | `/api/admin/g2g/*` |
| `wallet` | WalletPanel — user wallet balance list + add/subtract funds | `/api/admin/wallet/*` |
| `staff` | StaffPanel — staff card grid CRUD | External MariaDB `staff` table |
| `docs` | DocumentsPanel — invoice generator, contract generator, list | External MariaDB `documents` table |
| `payments` | PaymentsPanel — Stripe/crypto key management | `/api/admin/site-settings` |
| `settings_table` | SiteSettingsPanel — 7 tabs: General/SMTP/Telegram/Payment/Social/Z2U/Other | `/api/admin/site-settings` |
| `live_traffic` | LiveTrafficPanelImproved — real-time visitor sim with device/geo/referer | Simulated |
| `stock` | StockPanel | External MariaDB |
| `playerup` | PlayerUpOpsPanel | External MariaDB |
| `whatsapp` | WhatsAppPanel | External MariaDB |
| `ext_logs` | ExtensionLogsPanel — telemetry console, KPI stats, log table, token settings | External MariaDB `bump_logs` table |

### Generic TableManager (NAV_TABLE_MAP)
| Section | Table |
|---|---|
| `buyers` | `users` |
| `activity` | `activity_logs` |
| `bundles` | `bundles` |
| `z2u_logs` | `z2u_logs` |
| `builder_requests` | `builder_requests` |
| `promos` | `promotions` |
| `leads` | `leads` |
| `sellers` | `sellers` |
| `verifications` | `verifications` |
| `formations` | `formations` |
| `support` | `support_tickets` |

## Database Architecture

### Local PostgreSQL (Drizzle ORM — lib/db)
- `usersTable` — id, email, password, name, role, walletBalance (numeric), referralCode, referredBy, membershipTier
- `productsTable` — marketplace products
- `ordersTable` — purchase orders
- `reviewsTable` — customer reviews

### External MariaDB (queryExt — artifacts/api-server/src/lib/mysql.ts)
- `settings` — key/value site settings (SMTP, G2G API keys, payment keys, `ext_log_token`, etc.)
- `g2g_listings` — G2G marketplace listings
- `staff` — team members
- `documents` — invoices and contracts
- `bump_logs` — Chrome extension bump events (event, account_title, listing_id, platform, price, message, error_detail, source, ip, ext_version)
- `inventory`, `activity_logs`, `users` (sellers), and more

## G2G API Integration
- Base: `https://api.g2g.com`
- Key: `G2G_API_KEY` Replit secret (priority) → MariaDB `settings.g2g_api_key` (fallback)
- Auth: `Authorization: Bearer {key}` for all G2G calls
- Core endpoints: `/v2/seller/offers`, `/v2/seller/orders`, `PATCH /v2/seller/offers/{id}`, `POST /v2/seller/orders/{id}/fulfill`
- New endpoints: `GET /admin/g2g/profile`, `GET /admin/g2g/analytics`, `POST /admin/g2g/bulk-price`, `POST /g2g/webhook`
- Frontend: shows "Connected via G2G_API_KEY secret" badge when env key active; API settings tab masks key
- Webhook: `POST /api/g2g/webhook` — HMAC-SHA256 verified, logs events to `activity_logs`, auto-updates order status

## Security Hardening (app.ts)
- **Helmet** — HTTP security headers: CSP, HSTS, noSniff, XSS filter, referrerPolicy, hidePoweredBy
- **CORS** — restricted to `officialum1.com`, `*.replit.dev`, `*.replit.app`, localhost; blocks unknown origins with 403
- **Rate limiting** — auth endpoint: 10 req/15min; API general: 300 req/min; extension: 600 req/min (production only for auth)
- **Body limit** — 2MB max for JSON/urlencoded
- **Admin auth** — HMAC-SHA256 token, 12h expiry, timing-safe comparison
- **Input validation** — safeTableName() regex guard on all dynamic table names

## PlayerUp Command Center
- Dark themed dashboard header with gradient (navy → indigo)
- KPI stats: Total Listings, Sell Rate, Bumped Today, Active Status
- Controls: Cloud Sync toggle, Stop Bump, Auto Bump All (interval), Bump All, Bump Selected
- Configurable bump interval (seconds) — live auto-bump loop with activity console
- Activity log console — color-coded real-time log inside panel
- Listings table with satellite/bump tracking, status badges, per-row Bump button
- Settings: username, session cookie, bump interval (no API key — extension-only approach)
- Analytics: performance overview, top listings by bump count

## Extension Logs System
- **Table**: `bump_logs` in external MariaDB — auto-created on first request
- **Ingest endpoint**: `POST /api/extension/log` — no admin auth required, optionally validates `ext_log_token` from settings
- **Admin endpoints**: `GET /api/admin/extension/logs` (paginated, filter by platform/event/search), `GET /api/admin/extension/stats` (KPI stats), `DELETE /api/admin/extension/logs/clear`
- **Event types**: `bump_success`, `bump_failed`, `bump_error`, `bump_limit`, `bump_skip`, `extension_start`, `extension_stop`, `cloud_sync`
- **Platform filter**: all, reddit, social, linkedin, snapchat, other
- **Panel**: Telemetry console (dark terminal UI), Log Table (paginated), Settings (token config + endpoint docs)
- **Token auth**: set `ext_log_token` in site settings → extension must send matching value in `ext_token` field

## External Integrations (Active + Planned)
- G2G Marketplace — API key connected via Replit secret
- PlayerUp — manual/auto bump via session cookie + Chrome extension bridge
- Z2U — stub (not configured)
- Stripe (planned), Cryptomus (planned), Binance Pay (planned)
- SMTP email (planned)
- Corporate Tools / US business formation (planned)
