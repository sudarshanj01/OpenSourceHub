# 📱 Live Digital QR Menu Board (`011-digital-qr-menu-board`)

> **Self-hosted, real-time digital restaurant menu with live "86/Out of Stock" toggling, instant price updates, diner table tray bill estimation, and automated printable table tent QR codes.**

Part of the **OpenSourceHub 100 Projects Catalog** — free, self-sovereign utility software for independent businesses worldwide.

---

## ✨ Key Features

- **📱 Mobile-First Diner Menu (`/` and `/?table=X`)**:
  - Blazing fast mobile interface optimized for 320px–420px screens.
  - Sticky category pills with item counts and smooth section jumping.
  - Live instant search across dish names, ingredients, and badges.
  - 1-tap dietary filter pills: **🟢 Vegetarian**, **🌱 Vegan**, **🌾 Gluten-Free**, **🌶️ Spicy**, **⭐ Chef's Picks**.
  - Dish details modal with allergens, calories, and prep time.
  - **Wi-Fi 1-Tap Copy**: Diners can copy the guest Wi-Fi password with a single tap.
  - **Table Order Tray & Bill Estimator**: Guests can stage dishes, see tax-inclusive price estimates, and flash the fullscreen **"Show Waiter My Order"** card.

- **⚡ Manager Studio (`/admin`) (PIN Protected)**:
  - **1-Tap 86 Switch**: Mark any dish out of stock or back in stock in 1 second.
  - **Inline Quick Price Edit**: Update menu prices on the fly without navigating nested forms.
  - **Category Manager**: Add, reorder, or organize sections.
  - **Dish Creator**: Full modal to add new culinary creations with dietary flags, badges, and pricing.
  - **Branding & Settings**: Customize restaurant name, tagline, currency symbol (`$`, `₹`, `€`, `£`, `¥`), sales tax %, and Wi-Fi credentials.

- **🖨️ Table QR Studio & Printable Tent Cards**:
  - Generates high-density vector QR codes configured per table (`Table 1` to `Table N`, `Bar`, `Takeaway`, `Patio`).
  - Pre-styled 4x6 inch printable table tent card template with brand header, table number, QR code, and Wi-Fi login info.
  - 1-click browser print (`Ctrl+P` / `Cmd+P` ready) and PNG download.

---

## 🚀 Quickstart (60 Seconds with Docker)

```bash
# 1. Navigate to project directory
cd projects/011-digital-qr-menu-board

# 2. Start the stack (PostgreSQL 16 + Next.js App)
docker compose up -d

# 3. Open your browser:
# Diner Menu: http://localhost:3011
# Manager Studio: http://localhost:3011/admin (Default PIN: 1234)
```

---

## 🛠️ Tech Stack & Requirements

- **Framework**: Next.js 16 (App Router, React 19, TypeScript, Turbopack)
- **Styling**: Tailwind CSS & Lucide Icons
- **Database**: PostgreSQL 16 (`postgres:16-alpine` pinned)
- **ORM**: Prisma ORM with automated migrations & seeding on boot
- **Vector QR**: `qrcode` library

---

## 🌐 Production Deployment (Custom Domain & Free SSL)

When you're ready to deploy to production with your own domain (e.g., `menu.yourbistro.com`):

1. Point your domain's DNS **A record** to your server's public IP address.
2. In `.env`, configure:
   ```env
   DOMAIN=menu.yourbistro.com
   ACME_EMAIL=admin@yourbistro.com
   ```
3. In `docker-compose.yml`, uncomment the `caddy` service block and switch `app` ports to `expose: - "3011"`.
4. Run:
   ```bash
   docker compose up -d
   ```
Caddy will automatically provision and renew a free Let's Encrypt TLS certificate.

---

## 📄 License

MIT License. Free to use, fork, customize, and commercialize.
