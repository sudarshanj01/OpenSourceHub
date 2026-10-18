# 🤖 Project Agent Manual (`agent.md`)
## `011-digital-qr-menu-board`

This document is the dedicated AI context handbook and developer specification for **`011-digital-qr-menu-board`**. AI coding assistants (Claude, Cursor, Copilot, ChatGPT, Antigravity) and human contributors should refer to this guide when extending, auditing, or maintaining this micro-application.

---

## 🎯 1. Occupational Persona & Purpose

- **Target Persona:** Small Cafes, Bistros, Diners, Food Trucks, Pop-up Food Stalls, Bars, Boutique Hotels, and Service Salons.
- **Pain Point Solved:** 
  - Physical menus are expensive to print, quickly get stained/damaged, and become obsolete every time ingredient costs fluctuate.
  - Commercial QR menu SaaS solutions gate basic real-time updates behind monthly fees ($30–$80/mo) and steal diner attention with external ads and tracking cookies.
- **Solution:** A self-contained, self-deployable digital menu system with instant 1-tap "86 / Out of Stock" toggling, fast inline price updates, table order tray estimation, and automated printable table tent QR cards.

---

## 🛠️ 2. Tech Stack & Architecture

- **Frontend & Fullstack Engine:** Next.js 14 (App Router, React 18, TypeScript, Tailwind CSS, Lucide icons).
- **QR Engine:** `qrcode` high-density SVG/Canvas vector generator.
- **Database:** PostgreSQL (`postgres:16-alpine` pinned) with Prisma ORM.
- **Container Strategy:**
  - Multi-stage Dockerfile (`node:20-alpine` base, builder, and standalone runner using non-root `nextjs` user).
  - Automated database wait, schema push, and idempotent seeding via `docker-entrypoint.sh` on container boot.
  - Pinned `postgres:16-alpine` with healthcheck and local volume persistence (`./data/postgres`).
- **Production Reverse Proxy:** `caddy:2.8.4-alpine` with automatic Let's Encrypt SSL/HTTPS.

---

## 🗄️ 3. Database Schema (`prisma/schema.prisma`)

### `RestaurantProfile`
| Field | Type | Default / Description |
| :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key |
| `name` | String | Cafe / Restaurant name (e.g. "The Rustic Skillet Bistro") |
| `tagline` | String | Subtitle / slogan |
| `description` | String | Brand story or concept |
| `currencySymbol` | String | Default `$` (supports any currency: `₹`, `€`, `£`, `¥`, `AED`, etc.) |
| `currencyCode` | String | Default `USD` |
| `taxPercentage` | Float | Sales tax percentage (e.g. `8.5`) |
| `serviceChargePercentage` | Float | Service fee percentage (e.g. `0.0`) |
| `address` | String | Physical storefront location |
| `phone` | String | Contact phone |
| `email` | String | Contact email |
| `wifiSsid` | String | Guest Wi-Fi Network Name |
| `wifiPassword` | String | Guest Wi-Fi Password (1-tap copyable on mobile) |
| `openingHours` | String | Operating schedule |
| `tableCount` | Int | Number of tables for QR code generation (Default `16`) |
| `adminPin` | String | Manager Studio security PIN (Default: `"1234"`) |
| `bannerUrl` | String? | Optional background hero image URL |

### `Category`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key |
| `name` | String | Category label (e.g. "Starters", "Wood-Fired Pizzas", "Beverages") |
| `description` | String? | Subtitle for category |
| `sortOrder` | Int | Display order sequence |
| `isActive` | Boolean | Visibility toggle |
| `items` | MenuItem[] | One-to-many relationship |

### `MenuItem`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key |
| `categoryId` | String | Foreign key to Category |
| `name` | String | Dish / drink title |
| `description` | String | Ingredients, allergen notes, cooking style |
| `price` | Float | Item price |
| `isAvailable` | Boolean | Real-time stock status (True = In Stock, False = "86'd / Sold Out") |
| `isVegetarian` | Boolean | 🟢 Vegetarian flag |
| `isVegan` | Boolean | 🌱 Vegan flag |
| `isGlutenFree` | Boolean | 🌾 Gluten-free flag |
| `isSpicy` | Boolean | 🌶️ Spicy flag |
| `isChefSpecial` | Boolean | ⭐ Chef's Special flag |
| `calories` | Int? | Nutritional calorie estimate |
| `prepTimeMinutes`| Int? | Kitchen preparation time estimate |
| `badge` | String? | Highlight tag (e.g. "Bestseller", "New", "Must Try") |
| `sortOrder` | Int | Sorting priority |

---

## 📱 4. Key UX & Mobile-First Principles

1. **Guest Diner Experience (`/` and `/?table=X`)**:
   - Zero-clutter, lightning fast load time.
   - Sticky category navigation with item counts.
   - Instant search across dish names, ingredients, and badges.
   - Dietary filter pills: All, Veg, Vegan, Gluten-Free, Spicy, Chef's Picks.
   - 1-tap Wi-Fi copy button.
   - Table Tray / Bill Estimator: Allows guests to add items, view subtotal + estimated tax, and open a fullscreen high-contrast **"Show Waiter My Order"** screen.
2. **Manager Studio (`/admin`)**:
   - Protected by 4-digit PIN (default `1234`).
   - **The 86 Matrix**: 1-tap instant switch to toggle items in/out of stock in real time.
   - Inline quick price editing (type new price, blur to save).
   - Full dish editor & category management.
   - **Table QR Studio**: Instant preview and 1-click printable 4x6 tent cards for Table 1..N.
   - Store settings editor for currency, taxes, and Wi-Fi credentials.

---

## 🚢 5. Deployment Commands

```bash
# 1. Start application with PostgreSQL in Docker:
docker compose up -d

# 2. View container logs:
docker compose logs -f app

# 3. Access diner menu:
http://localhost:3011

# 4. Access manager dashboard:
http://localhost:3011/admin  (Default PIN: 1234)
```
