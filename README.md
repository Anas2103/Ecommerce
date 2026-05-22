# Plateforme E-Commerce Full-Stack

> DOWFS201 — Projet de synthèse · Formateur : Khalid MZIBRA

A full-stack ecommerce platform built with **Laravel 12** (backend) and **React 19** (frontend). It supports three roles — Admin, Seller, and Client — with multilingual UI (English, French, Arabic with RTL), a shopping cart, PayPal payments, PDF invoices, and an AI-powered chatbot.

## Livrables / Documents

| Document | Fichier |
|---|---|
| Diagrammes UML (Use Case, Classes, Séquence, Composants) | `uml_ecommerce.pdf` |
| Rapport de projet (Introduction → Besoins → Conception → Réalisation → Tests → Conclusion) | `rapport_projet_ecommerce.pdf` |
| Présentation soutenance (9 slides) | `presentation_ecommerce.pptx` |

> Regénérer : `py generate_uml.py` · `py generate_rapport.py` · `py generate_ppt.py`

---

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Backend    | Laravel 12, PHP 8.2+, Sanctum, DomPDF         |
| Database   | SQLite (local dev)                             |
| Frontend   | React 19, Vite, Redux Toolkit, Tailwind CSS 4  |
| Routing    | React Router DOM 7                             |
| i18n       | i18next (EN / FR / AR + RTL)                   |
| Payment    | PayPal React SDK                               |
| Charts     | Recharts                                       |
| Animation  | Framer Motion                                  |

---

## Features

### Customer
- Browse products with search, category, price, and stock filters
- Guest cart (session-based) with auto-merge on login
- Coupon codes (percent or fixed discount)
- Multiple shipping methods
- Checkout with saved addresses
- PayPal or cash-on-delivery payment
- Order tracking with PDF invoice download
- Product reviews with star ratings
- Wishlist
- Multilingual UI (EN / FR / AR)
- AI chatbot (order tracking, returns, product search)

### Seller
- Product CRUD with multiple images, tags, and attributes
- Stock management with low-stock alerts
- Discount / compare price support
- Order management dashboard
- Document upload for seller verification

### Admin
- Revenue analytics (daily / monthly charts via Recharts)
- User management (role, active status)
- Product management
- Order status updates
- Category management (hierarchical)
- Review moderation (approve / reject)
- Sales analytics

---

## Project Structure

```
Ecommerce/
├── backend/                  # Laravel 12 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/   # 11 API controllers
│   │   │   └── Middleware/        # RoleMiddleware
│   │   └── Models/               # 14 Eloquent models
│   ├── database/
│   │   ├── migrations/           # 16 migration files
│   │   └── seeders/              # 6 seeders
│   └── routes/
│       └── api.php               # All API routes (versioned /api/v1)
└── frontend/                 # React + Vite
    └── src/
        ├── pages/               # 20+ pages (client, seller, admin)
        ├── components/          # Reusable UI components
        ├── store/               # Redux slices (auth, cart, theme, ui)
        ├── services/            # Axios API service
        └── i18n/                # EN / FR / AR translations
```

---

## Installation

### Prerequisites
- PHP 8.2+ with Composer
- Node.js 18+ with npm
- SQLite (bundled with PHP)

### Backend Setup

```bash
cd backend

# Install PHP dependencies
composer install

# Copy environment file and configure
cp .env.example .env
php artisan key:generate

# Run migrations and seed the database
php artisan migrate --seed

# Create storage symlink for file uploads
php artisan storage:link

# Start the development server
php artisan serve
```

The API will be available at `http://localhost:8000/api/v1`.

### Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start the Vite dev server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## Default Seeded Accounts

| Role   | Email                 | Password |
|--------|-----------------------|----------|
| Admin  | admin@ecommerce.com   | password |
| Seller | seller@ecommerce.com  | password |
| Client | client@ecommerce.com  | password |

---

## API Overview

All routes are prefixed with `/api/v1`.

### Public Endpoints

| Method | Endpoint                         | Description                    |
|--------|----------------------------------|--------------------------------|
| POST   | `/register`                      | Register a new user            |
| POST   | `/login`                         | Login and receive API token    |
| POST   | `/forgot-password`               | Request password reset email   |
| POST   | `/reset-password`                | Reset password with token      |
| GET    | `/products`                      | List products (with filters)   |
| GET    | `/products/featured`             | Featured products              |
| GET    | `/products/{slug}`               | Product detail                 |
| GET    | `/categories`                    | List categories                |
| GET    | `/shipping-methods`              | Available shipping methods     |
| GET    | `/cart`                          | View cart (guest or auth)      |
| POST   | `/cart/add`                      | Add item to cart               |
| PUT    | `/cart/items/{item}`             | Update cart item quantity      |
| DELETE | `/cart/items/{item}`             | Remove cart item               |
| DELETE | `/cart/clear`                    | Clear cart                     |
| POST   | `/cart/coupon`                   | Apply coupon code              |
| POST   | `/chatbot`                       | Chat with the AI assistant     |
| GET    | `/recommendations/trending`      | Trending products              |

### Authenticated Endpoints (Bearer Token)

| Method | Endpoint                         | Description                    |
|--------|----------------------------------|--------------------------------|
| POST   | `/logout`                        | Revoke token                   |
| GET    | `/me`                            | Current user profile           |
| POST   | `/profile`                       | Update profile / avatar        |
| PUT    | `/change-password`               | Change password                |
| GET    | `/addresses`                     | List saved addresses           |
| POST   | `/addresses`                     | Create address                 |
| PUT    | `/addresses/{id}`                | Update address                 |
| DELETE | `/addresses/{id}`                | Delete address                 |
| POST   | `/orders`                        | Place an order                 |
| GET    | `/orders`                        | List user orders               |
| GET    | `/orders/{id}`                   | Order detail                   |
| POST   | `/orders/{id}/cancel`            | Cancel an order                |
| GET    | `/orders/{id}/invoice`           | Download PDF invoice           |
| POST   | `/reviews`                       | Submit a product review        |
| GET    | `/wishlist`                      | View wishlist                  |
| POST   | `/wishlist/toggle`               | Toggle product in wishlist     |

### Seller Endpoints (role: seller or admin)

| Method | Endpoint                         | Description                    |
|--------|----------------------------------|--------------------------------|
| GET    | `/seller/products`               | List seller's products         |
| POST   | `/products`                      | Create product                 |
| PUT    | `/products/{id}`                 | Update product                 |
| DELETE | `/products/{id}`                 | Delete product                 |
| GET    | `/seller/orders`                 | Seller's orders                |

### Admin Endpoints (role: admin)

| Method | Endpoint                         | Description                    |
|--------|----------------------------------|--------------------------------|
| GET    | `/admin/dashboard`               | Dashboard stats + charts       |
| GET    | `/admin/users`                   | List all users                 |
| PUT    | `/admin/users/{id}`              | Update user role/status        |
| DELETE | `/admin/users/{id}`              | Delete user                    |
| GET    | `/admin/orders`                  | List all orders                |
| PUT    | `/admin/orders/{id}/status`      | Update order status            |
| GET    | `/admin/categories/all`          | List all categories            |
| POST   | `/admin/categories`              | Create category                |
| PUT    | `/admin/categories/{id}`         | Update category                |
| DELETE | `/admin/categories/{id}`         | Delete category                |
| GET    | `/admin/reviews`                 | List all reviews               |
| PUT    | `/admin/reviews/{id}/approve`    | Approve / reject review        |
| GET    | `/admin/analytics/sales`         | Sales analytics data           |

---

## Database Models

| Model          | Description                                          |
|----------------|------------------------------------------------------|
| User           | Role-based (admin / seller / client)                 |
| Product        | With images, tags, soft delete, bilingual fields     |
| Category       | Hierarchical (self-referential parent_id)            |
| Cart           | Guest (session) or authenticated user               |
| CartItem       | Individual line items in a cart                     |
| Order          | Full order lifecycle with invoice generation         |
| OrderItem      | Snapshot of product at time of purchase             |
| Address        | Multiple addresses per user with default flag        |
| Review         | Star ratings with admin approval workflow            |
| Wishlist       | User's saved products                               |
| Coupon         | Percent / fixed discounts with expiry and limits     |
| ShippingMethod | Available shipping options with estimated days       |
| ProductImage   | Multiple images per product with primary flag        |
| SellerDocument | Seller verification documents                       |

---

## Environment Variables (Backend)

Key variables in `backend/.env`:

```env
APP_NAME=Ecommerce
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite

FRONTEND_URL=http://localhost:5173

# Mail (for password reset)
MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

---

## Running Tests

```bash
cd backend
php artisan test
```

---

## License

MIT
