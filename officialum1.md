# OfficialUM1 — Master Engineering & Architecture Handbook

> **Single Source of Truth** for the entire OfficialUM1 digital ecosystem. This document contains full structural, architectural, route, API, database, and integration details so that any developer, engineer, or agent can immediately understand, maintain, and scale the project without missing anything.

---

## 1. Executive Summary & Business Ecosystem

**OfficialUM1 LLC** (`officialum1.com`) is an enterprise-grade digital services agency, e-commerce marketplace, and US company formation gateway. The platform incorporates:

1. **Agency Marketplace & E-Commerce**: High-ticket development, speed optimization, WordPress-to-Next.js migrations, guest posting, pre-ranked digital rentals, and digital assets.
2. **US Business & LLC Formation Hub**: Full-service company formation and compliance across all 50 US states, powered by a native white-label integration with **Northwest Registered Agent (Corporate Tools API)**.
3. **Centralized Admin ERP & CRM**: Unified command center managing live traffic, sales, orders, deliveries, inventory, KYC verification, reviews, blogs, SEO indexing, and affiliate finance.
4. **24/7 Global Client Acquisition Engine**: Background Python daemon deployed on **Render.com** executing autonomous multi-region outreach sprints (Dubai, Europe, Africa, USA, UK).
5. **Cross-Platform Mobile App**: Native Flutter mobile administration app (`officialum_admin_mobile`) with push notifications and order fulfillment tools.

---

## 2. Technology Stack

### Frontend & Web Application
* **Framework**: Next.js 15 (App Router, Server Components & Client Components)
* **Runtime**: React 19, TypeScript
* **Styling**: Vanilla CSS Design Tokens + Tailwind CSS utility layers
* **UI & Animation**: Framer Motion, Lucide React Icons, Sonner Toasts
* **Typography**: Space Grotesk (Headings), Plus Jakarta Sans / Inter (Body)

### Backend, APIs & Database
* **Serverless Backend**: Next.js API Routes (`app/api/*`) with RESTful JSON interfaces
* **Database**: MySQL 8.0 on dedicated Hostinger infrastructure
* **Connection Layer**: `mysql2/promise` with auto-reconnecting connection pool, idle timeout safety, transactions, and performance indexes
* **Authentication**: JWT token authentication, bcrypt password hashing, role-based access control (`admin`, `staff`, `buyer`, `seller`)

### Infrastructure & Deployments
* **Main Website**: Deployed on **Vercel** (`https://officialum1.com`) with automated GitHub CI/CD webhooks
* **Outreach Cloud Daemon**: Deployed on **Render.com** as a Python Web Worker (`officialum1-global-outreach-engine`)
* **DNS & Edge Security**: Cloudflare edge network, SSL/TLS full strict encryption
* **Email Infrastructure**: Titan SMTP (`hello@officialum1.com`) & Resend API

---

## 3. Directory & Codebase Layout

```
officialum1/
├── app/                              # Next.js App Router (Pages, Layouts, API Routes)
│   ├── (public pages)                # Home, Shop, Services, Blog, About, Contact, etc.
│   ├── admin/                        # Admin Portal & Dynamic Sub-routes
│   ├── api/                          # 50+ Backend Serverless API Endpoints
│   ├── dashboard/                    # Logged-in Buyer & Seller Portals
│   ├── delivery/                     # Secure Per-Order Token Fulfillment Portal
│   ├── services/form-business/       # US LLC & Business Formation Hub
│   ├── staff/                        # Internal Staff Portal & Dashboard
│   ├── globals.css                   # Global Design System Variables & Tokens
│   └── layout.tsx                    # Root Layout with Nav, Footer & SEO Schema
├── components/                       # Modular UI Components
│   ├── admin/                        # Admin Shell & Tab Panels (20+ dedicated tabs)
│   ├── ui/                           # Reusable UI primitives (Badge, PageHero, Buttons)
│   ├── Navbar.tsx                    # Main Global Navigation Bar
│   ├── Footer.tsx                    # Global Footer with SEO Site Links
│   ├── BusinessSection.tsx           # Home Page Formation Pricing Explorer
│   └── HomePageClient.tsx            # Interactive Homepage Client Hub
├── automation/                       # 24/7 Python Global Client Acquisition Engine
│   ├── worker.py                     # FastAPI background daemon for Render.com
│   ├── main.py                       # Lead batch processing, email templates, rotation
│   ├── lead_hunter.py                # Autonomous lead scraping & contact extraction
│   ├── smart_emailer.py              # Anti-spam interval email dispatcher
│   ├── crm_sync.py                   # Automatic syncing with MySQL CRM leads table
│   └── config.json                   # SMTP & Outreach configuration
├── lib/                              # Core Utility Libraries & Database Client
│   ├── db.ts                         # MySQL Connection Pool, Auto-Migration, Indexes
│   ├── corptools.ts                  # Northwest Registered Agent API & HMAC-SHA256 JWT
│   ├── auth.ts                       # Server-side auth, password hashing & verification
│   ├── email.ts                      # Nodemailer SMTP engine for order/inquiry alerts
│   ├── icons.tsx                     # Vector platform icon resolvers
│   └── rank-math-schema.ts           # JSON-LD Structured Data & Rich Snippets
├── officialum_admin_mobile/          # Flutter Cross-Platform Admin Mobile App
├── data/                             # Fallback JSON Data Sets (Services, Leads, Blogs)
├── public/                           # Static Media, Logos, SEO Icons & Brand Assets
└── render.yaml                       # Cloud infrastructure specification for Render
```

---

## 4. Complete App Router Pages Encyclopedia

### A. Public Client Pages
| Route URL | File Path | Description |
| :--- | :--- | :--- |
| `/` | `app/page.tsx` | Master Homepage (Hero, Services, US Business, Case Studies, Reviews, CTA). |
| `/services` | `app/services/page.tsx` | Services catalog (Development, Speed Optimization, SEO, Cloud). |
| `/services/form-business` | `app/services/form-business/page.tsx` | US LLC & Business Formation Hub (Dynamic Northwest State Schemas). |
| `/shop` | `app/shop/page.tsx` | Digital assets & service marketplace with category filtering and search. |
| `/shop/[id]` | `app/shop/[id]/page.tsx` | Individual product detail page with instant buy & review submission. |
| `/shop/compare` | `app/shop/compare/page.tsx` | Side-by-side product & service feature comparison table. |
| `/store` | `app/store/page.tsx` | Digital Real Estate & Pre-ranked authority asset marketplace. |
| `/bundles` | `app/bundles/page.tsx` | Discounted multi-service bundles and enterprise packages. |
| `/about` | `app/about/page.tsx` | Agency mission, corporate story, performance statistics, and trust metrics. |
| `/contact` | `app/contact/page.tsx` | Interactive inquiry form, live support contacts, and meeting booker. |
| `/reviews` | `app/reviews/page.tsx` | Verified customer testimonials and platform satisfaction ratings. |
| `/work` | `app/work/page.tsx` | Portfolio showcase, case studies, and before/after metrics. |
| `/faq` | `app/faq/page.tsx` | Categorized Frequently Asked Questions with search accordions. |
| `/kb` | `app/kb/page.tsx` | Knowledge Base index with search, categories, and documentation. |
| `/kb/[slug]` | `app/kb/[slug]/page.tsx` | Dedicated knowledge base article viewer with SEO schema. |
| `/blog` | `app/blog/page.tsx` | Agency articles, SEO guides, and technology insights index. |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | High-engagement blog article post with Rank Math JSON-LD schema. |
| `/help` | `app/help/page.tsx` | Customer Help Center & issue diagnostic guides. |
| `/help/[slug]` | `app/help/[slug]/page.tsx` | Dedicated help resolution article. |
| `/backlink-checker` | `app/backlink-checker/page.tsx` | Free SEO backlink analysis and domain authority evaluation tool. |
| `/tools/password-generator` | `app/tools/password-generator/page.tsx` | High-entropy cryptographic password generator utility. |
| `/terms` | `app/terms/page.tsx` | Official terms of service and client engagement policies. |
| `/privacy` | `app/privacy/page.tsx` | GDPR/CCPA compliant privacy and data handling notice. |
| `/refund` | `app/refund/page.tsx` | Service delivery guarantee and refund guidelines. |

### B. User Authentication & Dashboard Portals
| Route URL | File Path | Description |
| :--- | :--- | :--- |
| `/login` | `app/login/page.tsx` | Buyer and client authentication portal. |
| `/register` | `app/register/page.tsx` | Account registration with automatic referral code tracking. |
| `/forgot-password` | `app/forgot-password/page.tsx` | Password reset request and recovery token dispatcher. |
| `/verify-email` | `app/verify-email/page.tsx` | Account email confirmation validator. |
| `/dashboard` | `app/dashboard/page.tsx` | Client control hub: active orders, wallet balance, support tickets. |
| `/dashboard/seller` | `app/dashboard/seller/page.tsx` | Seller marketplace portal for managing listings and payouts. |
| `/dashboard/verification` | `app/dashboard/verification/page.tsx` | KYC identity verification upload portal. |
| `/my-orders` | `app/my-orders/page.tsx` | Complete client purchase history and milestone progress tracker. |
| `/checkout` | `app/checkout/page.tsx` | Multi-gateway checkout (Crypto, Wallet, Bank, Card) with coupon codes. |
| `/order-success` | `app/order-success/page.tsx` | Post-checkout confirmation and invoice receipt. |
| `/delivery/[token]` | `app/delivery/[token]/page.tsx` | Secure, encrypted delivery page with access logs & proof verification. |
| `/wishlist` | `app/wishlist/page.tsx` | Saved products and services list. |
| `/refer` | `app/refer/page.tsx` | Affiliate referral dashboard with tracking links and commission charts. |
| `/membership` | `app/membership/page.tsx` | VIP membership upgrades and tiered priority benefits. |

### C. Internal Staff & Admin Portals
| Route URL | File Path | Description |
| :--- | :--- | :--- |
| `/admin/login` | `app/admin/login/page.tsx` | Secure Admin & Staff authentication portal. |
| `/admin/[[...slug]]` | `app/admin/[[...slug]]/page.tsx` | Master dynamic Admin ERP/CRM Shell managing all tabs. |
| `/admin/business` | Component `BusinessTab.tsx` | **US LLC & Business Formations Operations Hub**. |
| `/staff/login` | `app/staff/login/page.tsx` | Employee portal login. |
| `/staff/dashboard` | `app/staff/dashboard/page.tsx` | Staff workflow dashboard with commission tracking and ticket queues. |

---

## 5. Master Admin Operations Center (`/admin/*`)

The admin dashboard is structured into 6 major functional groups inside `components/admin/AdminShell.tsx`:

### 1. Overview & Analytics
* **Sales & Revenue (`/admin/sell`)**: Live revenue charts, wallet distributions, profit margin analytics.
* **Live Traffic (`/admin/live_traffic`)**: Real-time visitor tracking, active sessions, page hits, IP geolocation.
* **System Activity (`/admin/logs`)**: Complete internal audit trail of staff and admin actions.

### 2. Store & Client Orders
* **Orders & Deliveries (`/admin/orders`)**: Manage purchases, assign staff fulfillers, generate delivery proof tokens.
* **US LLC Formations (`/admin/business`)**: **Dedicated Hub** for managing US company formations, state parameters, missing data flags, and 1-click client outreach.
* **Services & Catalog (`/admin/catalog`)**: Create/edit marketplace services, set flash sales, configure bundles.
* **Inventory Stock (`/admin/stock`)**: Secure credential repository for digital accounts and pre-ranked assets.
* **Service Bundles (`/admin/bundles`)**: Multi-service promotional package manager.
* **Promo Codes (`/admin/coupons`)**: Discount vouchers (Percentage / Flat amount) with usage limits.

### 3. Client CRM & Support
* **Inbound Leads (`/admin/leads`)**: Inbound sales pipeline, automated AI pitch generator, Lighthouse audits.
* **Support Inbox (`/admin/support`)**: Real-time ticketing system with threaded staff replies and file attachments.
* **Reviews & Ratings (`/admin/reviews_hub`)**: Customer testimonial moderation and auto-approval tools.
* **KYC Verifications (`/admin/verification`)**: Government ID review, selfie comparison, and account verification.

### 4. Marketing & Social Hub
* **Social Media Hub (`/admin/marketing`)**: AI post generator for Twitter/LinkedIn, schedule publisher.
* **Newsletter Broadcast (`/admin/newsletter`)**: Email campaign manager for all registered newsletter subscribers.
* **Market Intelligence (`/admin/intel`)**: Competitor pricing scanner and automated market rate comparison.

### 5. Website & SEO Engine
* **Rank Math & Knowledge Panel (`/admin/rankmath`)**: Global schema generator, organization brand entities, social graph.
* **1-Click Google Indexing (`/admin/indexing`)**: Google Indexing API service account integration to instantly index URLs.
* **AI Blogs Manager (`/admin/blogs`)**: AI article generation, meta titles, focus keywords, robots tag configuration.
* **Knowledge Base (`/admin/kb`)**: FAQ editor with historical revision diffs.
* **Pages & Legal Documents (`/admin/documents`)**: Official digital invoice and contract builder.

### 6. Finance & Administration
* **Wallets & Accounts (`/admin/finance`)**: Balance tracker across Meezan, UBL, Binance, RedotPay, Skrill.
* **Payout Requests (`/admin/payouts`)**: Review and approve affiliate/seller withdrawal requests.
* **User Database (`/admin/buyers`)**: Search, edit, ban, or assign VIP membership to registered users.
* **Staff & Permissions (`/admin/hr`)**: Employee management, departmental payroll, and granular tab permissions.
* **System API Keys (`/admin/settings`)**: Corporate Tools, SMTP servers, Gemini/OpenAI API keys configuration.

---

## 6. Complete Serverless Backend APIs Encyclopedia (`app/api/*`)

```
app/api/
├── admin/
│   ├── corptools/route.ts       # Northwest / Corporate Tools API proxy (companies, offerings, schemas)
│   ├── indexing/route.ts        # Google Indexing API automation (Publish URL notifications)
│   ├── inventory/route.ts       # Stock & asset credential management
│   ├── newsletter/route.ts      # Newsletter broadcast dispatcher
│   ├── settings/route.ts        # Database settings & API keys read/write
│   ├── users/route.ts           # Admin user management & permissions
│   └── z2u/route.ts             # Z2U listing sync and bump log recorder
├── auth/
│   ├── login/route.ts           # Buyer authentication & session creation
│   ├── register/route.ts        # Account creation & referral tracking
│   ├── logout/route.ts          # Session termination
│   └── forgot-password/route.ts # Password recovery token dispatcher
├── leads/route.ts               # CRM lead creation, status updates, pitch generator
├── orders/route.ts              # Order creation, fulfillment updates, token generator
├── cart/route.ts                # Persistent shopping cart management
├── checkout/route.ts            # Payment processing & order placement
├── coupons/route.ts             # Promo code validation & redemption
├── delivery/route.ts            # Token-based secure asset delivery & access logging
├── blogs/route.ts               # Blog article CRUD & SEO metadata
├── kb/route.ts                  # Knowledge Base article CRUD & audit history
├── reviews/route.ts             # Customer review submission & moderation
├── support/route.ts             # Support ticket creation & reply threads
├── tickets/route.ts             # Client ticket submission endpoint
├── traffic/route.ts             # Live visitor analytics & session heartbeat
├── finance/route.ts             # Transaction records & wallet balancing
├── payouts/route.ts             # Affiliate withdrawal request processor
├── hr/route.ts                  # Employee roster, salaries & commissions
├── market/route.ts              # Market intelligence competitor price tracking
├── verification/route.ts        # KYC identity document upload & review
├── documents/route.ts           # Official invoices & legal contract generation
├── rank-math/route.ts           # Rank Math SEO metadata & schema endpoints
├── health/route.ts              # System health check & database heartbeat
├── upload/route.ts              # File & image upload handler
└── webhook/
    ├── cryptomus/route.ts       # Cryptomus cryptocurrency instant payment IPN
    └── g2g/route.ts             # G2G marketplace order webhooks
```

---

## 7. Major Integrations & Third-Party Engines

### 1. Northwest Registered Agent / Corporate Tools API
* **Base Endpoint**: `https://api.corporatetools.com`
* **Library**: `lib/corptools.ts` & `app/api/admin/corptools/route.ts`
* **Authentication**: Automated HMAC-SHA256 JWT signature generation (`path` + sha256 hash of query/body signed with `corptools_secret_key`).
* **Pricing Engine**:
  * **OfficialUM1 Service Fee**: **$50.00**
  * **Registered Agent Service (Included)**: **$125.00**
  * **State Fee**: Live dynamic state rate (e.g. Montana $35, Wyoming $100, Delaware $90, Texas $300)
  * **Add-ons**: EIN ($50), Operating Agreement ($40), Annual Compliance ($100), Virtual Office ($29)
* **Dynamic State Schema**: Calls `/filing-methods/schemas/:company_id` to dynamically render the exact legal questions required by that specific US State without hardcoding.
* **Operations Hub**: Admin tab `/admin/business` allows viewing full submissions and 1-click emailing clients for missing information.

### 2. 24/7 Global Outreach Daemon (Render.com)
* **Directory**: `automation/`
* **Entrypoint**: `automation/worker.py` (FastAPI Cloud Daemon)
* **Target Regions**: Dubai/UAE Tourism, African Luxury Safari, European High-Ticket Brands, US/UK Agencies.
* **Safety Mechanism**: Anti-spam rotating delays (15–25s), automatic 24-hour bounceback protection, zero-bounce blacklisting, CRM synchronization via `crm_sync.py`.
* **Live Monitoring Endpoints**:
  * `GET /status` — Service health & total sent leads
  * `POST /pause` & `POST /resume` — Emergency autopilot controls
  * `GET /test-email` — Live SMTP heartbeat test

### 3. Google Indexing API & Rank Math Engine
* **Files**: `google_index.js`, `index_all_urls.js`, `lib/rank-math-schema.ts`
* **Auth**: Google Service Account credentials (`officialum1-35bbd9bf5678.json`)
* **Features**: Submits URLs directly to Google Indexing API (`URL_UPDATED`) for rapid indexing within minutes; generates JSON-LD structured schemas (`Organization`, `Service`, `Product`, `BlogPosting`, `FAQPage`).

---

## 8. Database Architecture & Table Schemas

The database schema (`lib/db.ts`) runs automatic safe migrations on startup. Key tables include:

1. **`users`**: User accounts, hashed passwords, roles (`admin`, `staff`, `buyer`, `seller`), wallet balances, affiliate earnings, VIP tier, verification status.
2. **`products`**: Marketplace catalog, sale prices, platform tags, bundle arrays, SEO metadata.
3. **`orders`**: Client orders, payment methods, delivery tokens, fulfillment status, assigned staff.
4. **`leads`**: CRM pipeline, formation submissions, full JSON parameter payloads, personalized AI pitches.
5. **`inventory`**: Encrypted account credentials, platforms, purchase prices, stock status.
6. **`transactions`**: Financial balance history, debit/credit logs across payment gateways.
7. **`deliveries`**: Token-protected delivery portals with IP tracking, view counters, and reveal timestamps.
8. **`knowledge_base` & `kb_history`**: KB articles with full versioning and audit history.
9. **`blogs`**: SEO articles, meta titles, focus keywords, author tags, view counts.
10. **`tickets` & `ticket_replies`**: Support inbox threads with client/staff timestamps.
11. **`testimonials` & `reviews`**: Moderated customer reviews with star ratings.
12. **`coupons`**: Discount codes with flat/percentage logic and expiry controls.
13. **`payouts`**: Affiliate and seller withdrawal requests.
14. **`live_traffic`**: Active session tracker with IP and last active page.
15. **`employees`**: Staff members, positions, compensation rates, and granular tab permissions.
16. **`verification_requests`**: KYC identity submissions with document and selfie image storage.
17. **`documents`**: Invoices and legal contracts with auto-generated reference numbers.
18. **`settings`**: Dynamic key-value store for API keys, SMTP credentials, and platform toggles.

---

## 9. Environment Variables Reference

```env
# Database Credentials (MySQL)
DB_HOST=193.203.168.188
DB_USER=u815786501_site
DB_PASSWORD=your_mysql_password
DB_NAME=u815786501_officialum1sit

# Application
NEXT_PUBLIC_BASE_URL=https://officialum1.com
NODE_ENV=production

# Admin Security
ADMIN_PASSWORD=your_secure_admin_password

# SMTP Server Configuration (Titan / Hostinger)
SMTP_HOST=smtp.titan.email
SMTP_PORT=465
SMTP_USER=hello@officialum1.com
SMTP_PASS=your_email_password
SMTP_FROM="OfficialUM1 LLC <hello@officialum1.com>"
```

---

## 10. Developer Commands & Workflow

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Run TypeScript type verification
npx tsc --noEmit

# Build production bundle
npm run build

# Deploy / Push changes
git add .
git commit -m "feat: description of update"
git push origin main
```

## 11. Related Operational & Formation Handbooks

- **US LLC Formation & Corporate Tools API Guide**: [`BUSINESS_FORMATION_DOCS.md`](file:///c:/Users/Abc/Desktop/officialum1/BUSINESS_FORMATION_DOCS.md)
- **UK LTD Formation & Companies House Credit Account Guide**: [`UK_FORMATION_DOCS.md`](file:///c:/Users/Abc/Desktop/officialum1/UK_FORMATION_DOCS.md)

---
*Maintained by OfficialUM1 Engineering Team. Last updated: September 2026.*
