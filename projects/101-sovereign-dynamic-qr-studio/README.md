# 🛡️ Project 101: QRShield — Sovereign Dynamic QR & Anti-Ransom Campaign Studio

> **"Code is not a MOAT anymore. Software should be free, accessible, and self-sovereign for every occupation on Earth."**  
> *A self-contained, production-ready open-source utility by OpenSourceHub.*

---

## 🎯 The Problem: The "Dynamic QR Code Hostage" Scam
Every month, thousands of small business owners, restaurants, weddings, and event organizers fall into the predatory **Dynamic QR Code Trap**:
1. You search Google for a "free QR code generator" and pick a slick top-ranking site (e.g. `qr-code-generator.com`, `Scanova`, `QR Tiger`).
2. You create a "dynamic QR code" and print it on **1,000 physical flyers, restaurant menus, storefront window vinyl, or business cards**.
3. Two weeks later, their "14-day free trial" secretly ends.
4. When customers scan your printed materials, they get a blank error page or an aggressive paywall demanding **$20 to $50 per month ($240–$600/year) ransom** to keep your printed paper working!

**QRShield solves this permanently.** Because you own and host the application, your dynamic short links (`/r/:slug`) live on your own server. Nobody can ever hold your printed codes hostage, display advertisements, or force monthly subscription fees.

---

## ✨ Features

- **⚡ Sovereign Dynamic Mode (Anti-Hostage Engine):**
  - Generates permanent short redirects (`/r/:slug`) on your domain.
  - Update where your printed QR code leads anytime without reprinting your flyers, acrylic stands, or menus.
  - Optional Passcode / PIN protection before unlocking the destination.
  - Temporary pause/reactivate toggle with polite "Campaign Inactive" screens.

- **🔒 100% Serverless Static Mode:**
  - Encodes website URLs, Wi-Fi keys (`WIFI:S:SSID;T:WPA;P:password;;`), digital vCard contact cards, and plain text directly into the QR matrix.
  - Works offline forever without any server dependency.

- **🎨 Studio-Grade Visual Styler (UI-SDK Powered):**
  - **Dot Patterns:** `rounded`, `circles/dots`, `classy`, `modern`, `soft extra-rounded`, `classic square`.
  - **Corner Customization:** Independent shapes for corner squares and inner corner dots.
  - **Linear Gradient Engine:** Multi-color linear gradients with custom rotation angles (0°, 45°, 90°, 135°) or solid colors.
  - **Center Logo Embed:** High error correction level ("Q") automatically preserves scannability with embedded logos.
  - **Callout Frames & Badges:** Branded frames ("SCAN ME", "VISIT MENU", "CONNECT WI-FI", "SAVE CONTACT").
  - **Export Formats:** High-resolution 300 DPI PNG (digital/screens) and infinite-resolution Vector SVG (commercial print shops & vinyl banners).

- **📊 Privacy-First Scan Intelligence:**
  - Real-time scan counts, smartphone vs desktop distribution, top operating systems (iOS, Android, macOS, Windows), and browsers.
  - Zero third-party trackers, zero Google Analytics cookies, and zero external telemetry.

---

## 🛠️ Tech Stack & Architecture

- **UI Framework:** Next.js 16.4.6 (`app` router) + React 19 + TypeScript.
- **Component Primitives:** Vercel Labs `@ui-sdk/react` & `@ui-sdk/core` (`Tabs`, `Switch`, `Button`, `Input`, `Textarea`, `Field`, `Dialog`, `Tooltip`).
- **QR Engine:** `qr-code-styling` (Client-side Canvas & Vector SVG renderer).
- **ORM & Database:** Prisma ORM 5.22 + PostgreSQL 16 Alpine (`postgres:16-alpine`).
- **Containerization:** Multi-stage Alpine Dockerfile (<120MB image) with pinned `node:22-alpine`.
- **Default Port:** `3101`.

---

## 🚀 Quick Start (60 Seconds)

### Option 1: Docker Compose (Recommended)

```bash
# 1. Navigate to the project directory
cd projects/101-sovereign-dynamic-qr-studio

# 2. Start the database and application
docker compose up -d

# 3. Open in your browser
# Studio & Campaigns: http://localhost:3101
# Dynamic Redirect:   http://localhost:3101/r/summer-menu
```

### Option 2: Local Node.js Development

```bash
cd projects/101-sovereign-dynamic-qr-studio
npm install
npx prisma generate
npm run dev
# Open http://localhost:3101
```

---

## 🌐 Production Deployment with Custom Domain & Free SSL

When deploying to a custom domain (e.g. `qr.mybusiness.com`):

1. Point your domain's DNS `A` record to your server's public IP address.
2. In `.env`, configure:
   ```env
   DOMAIN=qr.mybusiness.com
   ACME_EMAIL=admin@mybusiness.com
   ```
3. In `docker-compose.yml`, uncomment the `caddy` reverse-proxy service.
4. Run `docker compose up -d`. Caddy will automatically provision and renew Let's Encrypt SSL certificates.

---

## 📜 License
MIT © OpenSourceHub
