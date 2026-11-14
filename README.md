# Ecommerce — Full-Stack Marketplace

[![CI](https://github.com/Anas2103/Ecommerce/actions/workflows/ci.yml/badge.svg)](https://github.com/Anas2103/Ecommerce/actions/workflows/ci.yml)
![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?logo=php&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

A multi-vendor online store built with **Laravel 12** (REST API) and **React 19** (SPA).
Customers shop and check out with **Stripe** or **PayPal** support, sellers run their own shops, and admins moderate the marketplace — in **English, French and Arabic** (right-to-left).

**🔗 Live demo:** [anas2103-ecommerce.vercel.app](https://anas2103-ecommerce.vercel.app) · **Demo logins:** see [Demo accounts](#demo-accounts--data)

> **About the live demo:** it runs on free hosting, so the first load can take up to a minute while the server wakes up. No payment keys are configured there, so checkout runs in **demo mode** (orders are created with payment *pending*) and emails are not sent. Use the seller and client demo accounts; the admin account has a private password.

![Storefront](docs/screenshots/home.jpg)

---

## Highlights

- **Real payments, verified server-side** — Stripe card payments (PaymentIntents, 3-D Secure) and PayPal. The server never trusts the browser: every payment is checked with the provider (status, exact amount, currency, owner) and can only be used once.
- **Three roles, one platform** — customers, sellers (own catalogue, orders, returns, verification) and admins (analytics, users, moderation).
- **Security work with tests** — ownership checks on every resource, private invoices and ID documents, atomic stock (no overselling), rate limiting, token expiry & revocation. [→ Security](#security)
- **Performance** — product listings run 5 SQL queries regardless of page size (was 53), route-level code splitting (initial JS −70 %), debounced searches.
- **Tested end to end** — 26 backend tests (unit + feature, run on both SQLite and PostgreSQL), 14 frontend unit/component tests and 10 Playwright browser tests, run by GitHub Actions on every push.
- **Fully localized** — the UI, API messages and emails follow the user's language (EN / FR / AR); PDF invoices are generated in English or French.

---

## Screenshots

| Catalogue | Quick view |
|---|---|
| ![Catalogue](docs/screenshots/catalogue.jpg) | ![Quick view](docs/screenshots/quick-view.jpg) |
| **Product page** | **Checkout** |
| ![Product page](docs/screenshots/product-page.jpg) | ![Checkout](docs/screenshots/checkout.jpg) |
| **Order tracking & returns** | **Admin dashboard (dark mode)** |
| ![Order detail](docs/screenshots/order-detail.jpg) | ![Admin dashboard](docs/screenshots/admin-dashboard.jpg) |
| **Review moderation** | **Seller dashboard** |
| ![Review moderation](docs/screenshots/admin-reviews.jpg) | ![Seller dashboard](docs/screenshots/seller-dashboard.jpg) |

<p align="center"><img src="docs/screenshots/mobile-arabic.jpg" alt="Mobile, Arabic (RTL)" width="280"><br><em>Mobile · Arabic (right-to-left)</em></p>

---

## Contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Architecture](#architecture)
4. [Quick start (local)](#quick-start-local)
5. [Demo accounts & data](#demo-accounts--data)
6. [Configuration](#configuration)
7. [Testing & CI](#testing--ci)
8. [Deployment](#deployment)
9. [Security](#security)
10. [API reference](#api-reference)
11. [Project structure](#project-structure)
12. [Known limitations / roadmap](#known-limitations--roadmap)

---

## Features

### Customers
- Catalogue with search, category, price, stock and "featured" filters, five sort orders and pagination
- **Quick view** (click a product image) and full product pages (click the name) with gallery & zoom, rating breakdown, reviews, related and "customers also bought" products
- Product comparison, recently viewed items, wishlist
- **Guest cart** that is merged into the account on login
- Three-step checkout (address → shipping → payment) with **coupon codes** validated by the server
- **Stripe** card payment or **PayPal** — both verified server-side
- Order history and tracking, cancellation, **PDF invoices**, **return requests** with status tracking
- Profile and avatar, saved addresses, password change, **password reset by email**
- Rule-based help **chatbot** (order tracking, shipping, returns, product search…)

### Sellers
- Dashboard with sales charts
- Products: create/edit with multiple images (drag & drop), tags, discounts, low-stock alerts, **CSV import/export**
- Orders containing their products; **return requests** for their products (approve / reject)
- **Verification**: upload business / ID documents and follow their review status
- Public storefront page (`/sellers/:id`)

### Admins
- Dashboard: revenue (daily / monthly), orders by status, top products, user growth
- Users (role, activation — deactivating someone logs them out everywhere), products, orders, hierarchical categories, CSV exports
- **Review moderation** — new reviews stay hidden until published
- **Returns** across the marketplace and **seller verification** (approve / reject documents)

### Platform
- English / French / Arabic with right-to-left layout — UI, API messages and emails (invoices in English or French)
- Light / dark mode, two colour palettes, responsive down to small phones
- Animated, accessible popups (Escape to close, focus return, scroll lock, reduced-motion support)

---

## Tech stack

| Layer | Technology |
|---|---|
| API | Laravel 12 · PHP 8.2 · Laravel Sanctum (Bearer tokens) |
| Database | SQLite locally · PostgreSQL in production (Neon) — MySQL also works |
| Payments | Stripe (PaymentIntents, Stripe.js) · PayPal (JS SDK + Orders API) |
| PDF / email | barryvdh/laravel-dompdf · Laravel Mail (localized templates) |
| Frontend | React 19 · Vite 8 · React Router 7 · Redux Toolkit |
| Styling | Tailwind CSS 4 + CSS variables (themes) |
| i18n | i18next (frontend) · Laravel JSON translations (backend) |
| Charts | Recharts |
| Testing | PHPUnit · Vitest + React Testing Library · Playwright |
| CI / hosting | GitHub Actions · Docker on Render (API) · Vercel (frontend) · Neon (PostgreSQL) |

---

## Architecture

```mermaid
flowchart LR
    B[Browser<br/>React SPA] -- "JSON over HTTPS<br/>Authorization: Bearer token" --> A[Laravel API<br/>/api/v1]
    B -- "card details (Stripe.js)" --> ST[(Stripe)]
    B -- "PayPal JS SDK" --> P[(PayPal)]
    A -- "create & verify PaymentIntent" --> ST
    A -- "verify captured order" --> P
    A --> D[(PostgreSQL / SQLite)]
    A --> S1[storage/app/public<br/>product images]
    A --> S2[storage/app/private<br/>invoices · seller documents]
    A -- "order emails, reset links" --> M[Mail]
```

**Card payment flow:** the API computes the order total (one shared `CheckoutPricing` service) and creates a Stripe PaymentIntent → the browser confirms the card with Stripe.js (card data never reaches our server) → the order is placed with the PaymentIntent id → the API re-fetches it from Stripe and only marks the order **paid** if status, amount, currency and owner all match.

- The SPA talks only to the versioned API (`/api/v1`). The token is sent as a Bearer header; guests get a cart through an `X-Session-ID` header.
- Every request carries `Accept-Language`, so API messages come back in the user's language.

---

## Quick start (local)

### Prerequisites

| Tool | Version |
|---|---|
| PHP | 8.2+, extensions `pdo_sqlite`, `mbstring`, `openssl`, `fileinfo`, `gd`, `zip`, `curl` |
| Composer | 2.x |
| Node.js | 20.19+ or 22.12+ (with npm) |

> **Windows:** `winget install PHP.PHP.8.2`, enable the extensions above in `php.ini`, and install Composer from [getcomposer.org](https://getcomposer.org/download/).

### 1. Clone

```bash
git clone https://github.com/Anas2103/Ecommerce.git
cd Ecommerce
```

### 2. Backend — API on http://localhost:8000

```bash
cd backend
composer install
cp .env.example .env            # Windows PowerShell: Copy-Item .env.example .env
php artisan key:generate
php artisan migrate --seed      # creates database/database.sqlite (answer "yes") and fills it with demo data
php artisan storage:link        # serves product images at /storage
php artisan serve
```

### 3. Frontend — app on http://localhost:3000

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_STORAGE_URL=http://localhost:8000/storage
# Optional — real payments (test keys are fine). Without them checkout runs in demo mode.
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_PAYPAL_CLIENT_ID=
```

```bash
npm run dev
```

Open **http://localhost:3000**.

### Reset or update demo data

```bash
cd backend
php artisan migrate:fresh --seed                          # rebuild everything
php artisan db:seed --class=ProductDescriptionSeeder      # re-apply product descriptions only
```

Product descriptions (English + French) live in `backend/database/seeders/data/product_descriptions.json`.

---

## Demo accounts & data

| Role | Email | Password |
|---|---|---|
| Admin | `admin@ecommerce.com` | `password` locally — on a deployed site it is the private `ADMIN_PASSWORD` |
| Seller | `seller@ecommerce.com` · `maison@ecommerce.com` · `mode@ecommerce.com` · `sport@ecommerce.com` | `password` |
| Client | `client@ecommerce.com` (orders, wishlist and a filled cart) | `password` |

Eleven more clients (`firstname.lastname@example.com`, same password) are created too.

**Seeded data:** 22 categories (8 main + 14 sub-categories) · 67 products with images and EN/FR descriptions · 4 sellers · 12 clients · 64 orders over the last 6 months in every status · reviews (some awaiting moderation) · return requests · wishlists · coupons `WELCOME10`, `SAVE50`, `SUMMER20` · 3 shipping methods · seller verification documents.

**Test payments** (once Stripe test keys are set): card `4242 4242 4242 4242`, any future date, any CVC. Use `4000 0027 6000 3184` to see 3-D Secure.

> Outside `local`/`testing`, the admin password comes from `ADMIN_PASSWORD`. If it is not set, a random one is generated and printed once in the seeding output — `password` never applies to a deployed site.

---

## Configuration

### Backend — `backend/.env`

| Variable | Purpose | Default |
|---|---|---|
| `APP_ENV` / `APP_DEBUG` | **Always `production` / `false` when deployed** | `local` / `true` |
| `APP_URL` | Public URL of the API | `http://localhost:8000` |
| `FRONTEND_URL` | React app URL — CORS and links in emails | `http://localhost:3000` |
| `DB_CONNECTION` | `sqlite` locally, `pgsql` in production (`mysql` also works) | `sqlite` |
| `DB_URL` | Full connection string for a hosted database, e.g. Neon: `postgresql://user:pass@host/db?sslmode=require` | — |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin account created by the seeder | — |
| `SANCTUM_EXPIRATION` | API token lifetime (minutes) | `10080` |
| `STRIPE_SECRET` | Stripe secret key (`sk_test_…`). Without it, card checkout is a demo and orders stay `pending` | — |
| `STRIPE_CURRENCY` | Charge currency | `mad` |
| `PAYPAL_CLIENT_ID` / `PAYPAL_SECRET` | Server-side PayPal verification. Without them, PayPal orders stay `pending` | — |
| `PAYPAL_MODE` / `PAYPAL_MAD_TO_USD` | `sandbox`/`live` · MAD→USD rate used for PayPal | `sandbox` · `10` |
| `MAIL_MAILER` … | `log` writes emails to `storage/logs/laravel.log`. Use SMTP in production (see below) | `log` |
| `SEED_ON_BOOT` | Docker only: seed demo data on start-up if the database is empty | `false` (set to `true` on Render) |

**Sending real emails** (order confirmation, status updates, password reset): any SMTP provider works — e.g. [Resend](https://resend.com), [Brevo](https://www.brevo.com) or [Mailtrap](https://mailtrap.io) for testing:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.your-provider.com
MAIL_PORT=587
MAIL_USERNAME=…
MAIL_PASSWORD=…
MAIL_FROM_ADDRESS="shop@your-domain.com"
```

### Frontend — `frontend/.env`

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | API base URL, e.g. `https://your-api.onrender.com/api/v1` |
| `VITE_STORAGE_URL` | Public storage URL, e.g. `https://your-api.onrender.com/storage` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe **publishable** key (`pk_test_…`). Empty → demo card mode |
| `VITE_PAYPAL_CLIENT_ID` | PayPal **client ID** (public). Empty → PayPal option hidden |

> `.env` files are git-ignored. Never commit secrets (`APP_KEY`, `STRIPE_SECRET`, `PAYPAL_SECRET`, `ADMIN_PASSWORD`, mail credentials).

---

## Testing & CI

```bash
# Backend — 26 tests: pricing rules (unit) + cart ownership, Stripe & PayPal verification,
# coupons, private invoices, role permissions, password reset, translations, query counts…
cd backend && php artisan test

# Frontend — lint, 14 unit/component tests (Vitest + Testing Library), build
cd frontend && npm run lint && npm test && npm run build

# End to end — 10 Playwright tests in a real browser (needs the API running with demo data)
cd frontend && npx playwright install chromium && npm run test:e2e
```

[GitHub Actions](.github/workflows/ci.yml) runs all three on every push and pull request: backend tests on **SQLite and PostgreSQL** + `composer audit`, frontend lint/tests/build + `npm audit`, then the Playwright suite against a freshly seeded API.

---

## Deployment

Production setup, all on free plans: **Neon** (PostgreSQL database) + **Render** (API, Docker) + **Vercel** (frontend).

### 1. Database on Neon

1. Create a free account at [neon.com](https://neon.com) → **New project** (PostgreSQL, region close to your Render region).
2. On the project dashboard click **Connect**, turn **Connection pooling off**, and copy the connection string — it looks like `postgresql://user:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require`.

The tables and demo data are created automatically by the API on its first start — there is nothing to import.

### 2. API on Render

1. **New → Web Service** → connect the repository.
2. **Language:** Docker · **Root Directory:** `backend` · **Dockerfile path:** `./Dockerfile` · **Instance:** Free · **Health check path:** `/up`.
3. Add the environment variables from [`backend/render.yaml`](backend/render.yaml) — in particular:
   - `APP_KEY` — output of `php artisan key:generate --show`
   - `DB_CONNECTION=pgsql` and `DB_URL` — the Neon connection string
   - `APP_URL` — your Render URL · `FRONTEND_URL` — your Vercel URL
   - `ADMIN_PASSWORD` — and optionally Stripe / PayPal keys
4. Deploy. On start the container runs the migrations, seeds the demo data **only if the database is empty**, links storage and caches config/routes/views. Data then persists in Neon across restarts and redeploys.

> ⚠️ The free Render instance sleeps after ~15 minutes without traffic (the next request takes up to a minute), and its disk is temporary: **files uploaded at runtime** (new product photos, avatars, seller documents) are lost on redeploy. The database and the bundled product images are not affected.

### 3. Frontend on Vercel

1. **New Project** → import the repository → **Root Directory** `frontend` (framework: Vite).
2. Add `VITE_API_URL`, `VITE_STORAGE_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_PAYPAL_CLIENT_ID`.
3. Deploy. `vercel.json` handles SPA routing, security headers and asset caching.

### Production checklist

- [ ] `APP_ENV=production`, `APP_DEBUG=false`
- [ ] `ADMIN_PASSWORD` set
- [ ] `FRONTEND_URL` matches the deployed frontend exactly
- [ ] Stripe / PayPal keys set (test keys for a demo, live keys + `PAYPAL_MODE=live` for real money)
- [ ] SMTP configured so emails and password resets are delivered
- [ ] `DB_CONNECTION=pgsql` + `DB_URL` point to your hosted database
- [ ] Persistent file storage (e.g. an S3 bucket) if runtime uploads must survive redeploys

---

## Security

- **Authentication:** Sanctum Bearer tokens with expiry; revoked on logout, password change/reset, deactivation or role change.
- **Authorization:** role middleware (`admin`, `seller`, `client`) plus ownership checks on carts, addresses, orders, invoices, reviews, returns and seller documents. Sellers only see their own line items and returns.
- **Payments:** Stripe and PayPal payments are verified with the provider (status, exact amount, currency, owner); a payment reference can only be used once. Card data is handled by Stripe.js and never touches the server.
- **Data integrity:** atomic stock decrement (no overselling), totals and coupon discounts computed server-side, edited reviews go back to moderation.
- **Private files:** invoices and identity documents are stored outside the public web root and served only to their owner or an admin.
- **Abuse protection:** rate limits on auth endpoints (10/min), payment creation (20/min) and the chatbot (30/min).
- **Hardening:** validation on every endpoint, no internal errors leaked to clients, security headers (API + frontend), proxy-aware HTTPS, `.dockerignore` keeps local secrets out of images, dependency audits in CI.

Found a vulnerability? Please open a private security advisory rather than a public issue.

---

## API reference

All routes are prefixed with **`/api/v1`**. Authenticated routes need `Authorization: Bearer <token>`. Send `Accept-Language: en|fr|ar` to get messages in that language.

<details>
<summary><b>Public</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` · `/login` | Create an account / sign in (returns a token) |
| POST | `/forgot-password` · `/reset-password` | Password reset by email |
| GET | `/products` | List — `search`, `category_id`, `min_price`, `max_price`, `in_stock`, `featured`, `sort`, `page`, `per_page` |
| GET | `/products/featured` · `/products/{slug}` · `/products/{id}/reviews` | Featured, detail, reviews |
| GET | `/categories` · `/shipping-methods` | Catalogue data |
| GET | `/sellers/{id}` | Public seller profile |
| GET | `/recommendations/trending` · `/recommendations/also-viewed/{id}` | Recommendations |
| GET/POST/PUT/DELETE | `/cart`, `/cart/add`, `/cart/items/{id}`, `/cart/clear` | Cart (guest via `X-Session-ID`, or user) |
| POST | `/cart/coupon` | Validate a coupon and get the discount |
| POST | `/chatbot` | Help assistant |
</details>

<details>
<summary><b>Authenticated (any role)</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/me` · `/profile` · `/logout` | Account |
| PUT | `/change-password` | Change password |
| CRUD | `/addresses` (+ `POST /addresses/{id}/set-default`) | Saved addresses |
| POST | `/checkout/stripe-intent` | Create a Stripe PaymentIntent for the current cart |
| GET/POST | `/orders` · `/orders/{id}` · `/orders/{id}/cancel` · `/orders/{id}/invoice` | Orders and PDF invoice |
| POST/PUT/DELETE | `/reviews` · `/reviews/{id}` | Reviews (moderated) |
| GET/POST | `/wishlist` · `/wishlist/toggle` | Wishlist |
| GET/POST | `/returns` | Return requests |
| GET | `/recommendations` | Personalized recommendations |
</details>

<details>
<summary><b>Seller (seller or admin)</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| POST/PUT/DELETE | `/products` · `/products/{id}` | Create / update / delete own products |
| PUT/DELETE | `/product-images/{id}/primary` · `/product-images/{id}` | Manage images |
| GET | `/seller/products` · `/seller/products/{id}` · `/seller/orders` | Own catalogue and orders |
| GET/PATCH | `/seller/returns` · `/seller/returns/{id}` | Returns for own products |
| GET/POST | `/seller/documents` · `/seller/documents/{id}/download` | Verification documents |
</details>

<details>
<summary><b>Admin</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/dashboard` · `/admin/analytics/sales` | Statistics |
| GET/PUT/DELETE | `/admin/users` · `/admin/users/{id}` | Users |
| GET | `/admin/products` · `/admin/orders` | All products / orders |
| PUT | `/admin/orders/{id}/status` | Update order status (restocks on cancel) |
| GET/POST/PUT/DELETE | `/admin/categories/all` · `/admin/categories` · `/admin/categories/{id}` | Categories |
| GET/PUT | `/admin/reviews` · `/admin/reviews/{id}/approve` | Review moderation |
| GET/PUT | `/admin/seller-documents` · `…/{id}/approve` · `…/{id}/reject` | Seller verification |
| GET/PATCH | `/admin/returns` · `/admin/returns/{id}` | All returns |
</details>

---

## Project structure

```
.
├── .github/workflows/ci.yml         Backend tests · frontend lint/tests/build · Playwright
├── backend/                         Laravel 12 API
│   ├── app/
│   │   ├── Http/Controllers/Api/    REST controllers
│   │   ├── Http/Middleware/         Roles, locale, security headers
│   │   ├── Models/                  Eloquent models
│   │   └── Services/                CheckoutPricing · StripeGateway · PayPalVerifier
│   ├── database/seeders/            Catalogue, descriptions (data/*.json), DemoDataSeeder
│   ├── lang/                        fr.json · ar.json (API messages, emails, invoices)
│   ├── resources/views/             Email and invoice templates
│   ├── tests/                       PHPUnit unit + feature tests
│   └── Dockerfile · docker-entrypoint.sh · render.yaml
├── frontend/                        React 19 SPA
│   ├── src/
│   │   ├── pages/                   Storefront, client, seller/ and admin/ pages
│   │   ├── components/              Product card, quick view, cart drawer, Stripe form…
│   │   ├── hooks/                   usePopup (animated accessible popups), useDebounce
│   │   ├── store/                   Redux slices (auth, cart, compare, theme, ui)
│   │   ├── services/                Axios instance, authenticated downloads
│   │   ├── i18n/                    EN / FR / AR translations
│   │   └── **/*.test.js(x)          Vitest unit / component tests
│   ├── e2e/                         Playwright end-to-end tests
│   └── vercel.json
└── docs/screenshots/                Images used in this README
```

---

## Known limitations / roadmap

- Prices are in **MAD**; PayPal charges USD using a fixed rate (`PAYPAL_MAD_TO_USD`). Stripe charges MAD directly.
- On free Render hosting, files uploaded at runtime are not kept across redeploys (see [Deployment](#deployment)).
- Arabic invoices fall back to English (the PDF engine can't shape Arabic script).
- Roadmap ideas: TypeScript migration, real-time order notifications, offline support (service worker).

---

## License

[MIT](https://opensource.org/licenses/MIT)

---

## More projects

- [**CarsRental**](https://github.com/Anas2103/CarsRental) — car rental manager with roles and PayPal (Laravel · React)
- [**HireMatch**](https://github.com/Anas2103/AiJobBoard) — AI job board that scores CVs against jobs (Laravel · React · OpenAI)
- [**Relay**](https://github.com/Anas2103/Relay) — Telegram-style chat with E2EE secret chats and calls (Cloudflare Workers · React) · [live demo](https://relay-chat.bunbunchat.workers.dev)
- [**SmartCourse**](https://github.com/Anas2103/SmartCoursePlatform) — online course platform with Stripe and certificates (Laravel · React)
- [**Student & Course Manager**](https://github.com/Anas2103/StudentsCourseManager) — school management with 4 roles (Laravel · React)

More about me on my [GitHub profile](https://github.com/Anas2103).
