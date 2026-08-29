## OfficialUM1 Routes Audit

### All App Router Pages (`app/`)

| # | File Path | Route URL | Description | Has Layout?* |
|---|-----------|-----------|-------------|--------------|
| 1 | `app/page.tsx` | `/` | Homepage with hero, services, pricing, stats, business formation, CTA. | Root (`app/layout.tsx`) |
| 2 | `app/shop/page.tsx` | `/shop` | Main product/shop listing with filters, search, compare, wishlist, etc. | Root + `app/shop/layout.tsx` |
| 3 | `app/admin/kb/page.tsx` | `/admin/kb` | Admin UI to manage knowledge base / FAQ entries. | Root |
| 4 | `app/admin/newsletter/page.tsx` | `/admin/newsletter` | Admin UI to manage newsletter campaigns and subscribers. | Root |
| 5 | `app/admin/blogs/page.tsx` | `/admin/blogs` | Admin UI for creating and managing blog posts. | Root |
| 6 | `app/admin/payments/page.tsx` | `/admin/payments` | Admin payments overview and management. | Root |
| 7 | `app/admin/coupons/page.tsx` | `/admin/coupons` | Admin coupon/discount code management. | Root |
| 8 | `app/admin/reviews/page.tsx` | `/admin/reviews` | Admin moderation for customer reviews. | Root |
| 9 | `app/admin/payouts/page.tsx` | `/admin/payouts` | Admin payouts/withdrawals processing screen. | Root |
| 10 | `app/admin/settings/page.tsx` | `/admin/settings` | Admin global site/app configuration. | Root |
| 11 | `app/admin/users/page.tsx` | `/admin/users` | Admin user accounts listing and management. | Root |
| 12 | `app/admin/dashboard/page.tsx` | `/admin/dashboard` | Main admin dashboard with stats and shortcuts. | Root |
| 13 | `app/admin/g2g/page.tsx` | `/admin/g2g` | Admin control panel for G2G offers/integration. | Root |
| 14 | `app/admin/inventory/page.tsx` | `/admin/inventory` | Large admin inventory/catalog management UI. | Root |
| 15 | `app/services/form-business/page.tsx` | `/services/form-business` | US business formation / “US Business Hub” service flow. | Root |
| 16 | `app/store/page.tsx` | `/store` | Rentals / pre‑ranked sites “store” listing. | Root |
| 17 | `app/contact/page.tsx` | `/contact` | Contact page with hero and inquiry form plus contact info. | Root |
| 18 | `app/about/page.tsx` | `/about` | About/mission page with story, stats, and CTAs. | Root + `app/about/layout.tsx` |
| 19 | `app/faq/page.tsx` | `/faq` | FAQ / Knowledge Base list + accordions. | Root + `app/faq/layout.tsx` |
| 20 | `app/blog/page.tsx` | `/blog` | Blog index listing articles. | Root + `app/blog/layout.tsx` |
| 21 | `app/register/page.tsx` | `/register` | Buyer registration / signup form. | Root |
| 22 | `app/login/page.tsx` | `/login` | Buyer login form with forgot password link. | Root |
| 23 | `app/services/page.tsx` | `/services` | Services overview with cards, CTAs, ROI tools. | Root |
| 24 | `app/reviews/page.tsx` | `/reviews` | Public testimonials/reviews page. | Root + `app/reviews/layout.tsx` |
| 25 | `app/admin/z2u-intel/page.tsx` | `/admin/z2u-intel` | Admin analytics/intelligence for Z2U integration. | Root |
| 26 | `app/my-orders/page.tsx` | `/my-orders` | Logged‑in user order history / tracking page. | Root |
| 27 | `app/delivery/[token]/page.tsx` | `/delivery/[token]` | Delivery/fulfilment status page accessed via per‑order token link. | Root |
| 28 | `app/work/page.tsx` | `/work` | Portfolio / “Our Work” showcase. | Root |
| 29 | `app/wishlist/page.tsx` | `/wishlist` | Wishlist listing saved products with links back to shop. | Root |
| 30 | `app/verify-email/page.tsx` | `/verify-email` | Email verification confirmation/flow page. | Root |
| 31 | `app/verify/page.tsx` | `/verify` | Generic verification result page (e.g., account verification). | Root |
| 32 | `app/tools/password-generator/page.tsx` | `/tools/password-generator` | Utility page for generating secure passwords. | Root |
| 33 | `app/terms/page.tsx` | `/terms` | Terms & Conditions / legal page. | Root |
| 34 | `app/support/page.tsx` | `/support` | Support/help entry page (likely contact for issues). | Root |
| 35 | `app/staff/login/page.tsx` | `/staff/login` | Staff login portal. | Root |
| 36 | `app/staff/dashboard/page.tsx` | `/staff/dashboard` | Staff dashboard once logged in. | Root |
| 37 | `app/shop/[id]/page.tsx` | `/shop/[id]` | Individual product detail page. | Root + `app/shop/layout.tsx` |
| 38 | `app/shop/review/page.tsx` | `/shop/review` | Product review submission/overview page. | Root + `app/shop/layout.tsx` |
| 39 | `app/shop/compare/page.tsx` | `/shop/compare` | Product comparison page for selected items. | Root + `app/shop/layout.tsx` |
| 40 | `app/share-experience/page.tsx` | `/share-experience` | “Share your experience”/testimonial submission page. | Root |
| 41 | `app/dashboard/verification/page.tsx` | `/dashboard/verification` | Buyer KYC/verification flow inside user dashboard. | Root |
| 42 | `app/dashboard/seller/page.tsx` | `/dashboard/seller` | Seller dashboard (earnings, listings, shortcuts). | Root |
| 43 | `app/dashboard/page.tsx` | `/dashboard` | General buyer dashboard/home (summary, shortcuts). | Root |
| 44 | `app/refer/page.tsx` | `/refer` | Referral / “refer a friend” page. | Root |
| 45 | `app/checkout/page.tsx` | `/checkout` | Checkout flow for active cart. | Root |
| 46 | `app/bundles/page.tsx` | `/bundles` | Bundled offers/products page. | Root |
| 47 | `app/privacy/page.tsx` | `/privacy` | Privacy policy / data use page. | Root |
| 48 | `app/membership/page.tsx` | `/membership` | Membership/top‑up or subscription page (linked from dashboard). | Root |
| 49 | `app/builder/page.tsx` | `/builder` | Page builder or configuration tool (appears unused in UI). | Root |
| 50 | `app/order-success/page.tsx` | `/order-success` | Post‑checkout success/confirmation page. | Root |
| 51 | `app/blog/[slug]/page.tsx` | `/blog/[slug]` | Individual blog post page. | Root + `app/blog/layout.tsx` |
| 52 | `app/backlink-checker/page.tsx` | `/backlink-checker` | Backlink checker SEO tool. | Root |
| 53 | `app/kb/[slug]/page.tsx` | `/kb/[slug]` | Individual knowledge base article page. | Root |
| 54 | `app/kb/page.tsx` | `/kb` | KB index / listing for knowledge base. | Root |
| 55 | `app/hr/page.tsx` | `/hr` | HR/internal page (e.g., hiring/roles) referenced from admin tooling. | Root |
| 56 | `app/help/[slug]/page.tsx` | `/help/[slug]` | Individual help article in the “Help Center”. | Root |
| 57 | `app/help/page.tsx` | `/help` | Help Center index with categories and links to help articles. | Root |
| 58 | `app/forgot-password/page.tsx` | `/forgot-password` | Forgot‑password request/reset page. | Root |
| 59 | `app/admin/z2u/page.tsx` | `/admin/z2u` | Admin panel for Z2U marketplace integration. | Root |
| 60 | `app/admin/login/page.tsx` | `/admin/login` | Admin login screen. | Root |
| 61 | `app/admin/buyers/page.tsx` | `/admin/buyers` | Admin buyers/user list (different from /admin/users view). | Root |

\*All App Router pages use the root `app/layout.tsx`. Where a section‑specific layout exists (e.g. `app/blog/layout.tsx`), it is noted as `Root + ...`.

---

### Totals

- **Total App Router pages found:** 61  
- **Pages Router (`/pages`, `/src/pages`):** 0  
- **Other roots (`src/app`):** 0  

---

### Routes Referenced in UI but Missing Page Files

These routes are referenced in source (e.g. in dashboard/seller) but have **no corresponding `app/.../page.tsx` file**:

- `/seller/products/new`
- `/seller/products`
- `/seller/orders`
- `/seller/settings`
- `/withdraw`

All navbar and footer routes have backing pages:

- Navbar: `/services`, `/shop`, `/my-orders`, `/reviews`, `/store`, `/blog`, `/faq`, `/about`, `/services/form-business`, `/wishlist`.
- Footer: `/services`, `/store`, `/about`, `/work`, `/reviews`, `/contact`, `/help`, `/tools/password-generator`, `/blog`, `/backlink-checker`, `/terms`, `/privacy`.

---

### Orphan Pages (Existing but Not Linked in Source UI)

Pages that exist but are not linked anywhere in the current **source** (ignoring compiled `.next` output):

- **`/builder`** (`app/builder/page.tsx`)  
  - No `href="/builder"` or `Link href="/builder"` in source; appears to be a standalone/prototype tool.
- **`/share-experience`** (`app/share-experience/page.tsx`)  
  - Only visible in compiled `.next` artifacts; no current source‑level links, so effectively not reachable from navigation.

Some routes are “system/utility” or internal and expected not to be in the main nav, but are linked from flows:

- `/delivery/[token]` – used in delivery emails/support flows.
- `/order-success` – used as post‑checkout target.
- `/staff/login`, `/staff/dashboard`, `/hr` – staff/HR/internal entry points referenced from admin tooling or middleware.

