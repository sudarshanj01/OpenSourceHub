# 🤖 Agent Operational Manual (`agent.md`) — Project 101: QRShield

This document specifies the architecture, tech decisions, and extension standards for **QRShield** (`101-sovereign-dynamic-qr-studio`).

---

## 🎯 Project Identity & Scope
- **Project Number:** 101
- **Project Name:** QRShield — Sovereign Dynamic QR & Anti-Ransom Campaign Studio
- **Directory:** `projects/101-sovereign-dynamic-qr-studio`
- **Port:** `3101`
- **Domain:** Marketing, Hospitality, Print Media, Campaign Tracking, Identity
- **Anti-Pattern Solved:** The "Dynamic QR Code Hostage" SaaS trap where third-party generators disable printed QR codes after 14 days and demand $20–$50/month subscriptions.

---

## 🛠️ Stack & Standards

1. **Frontend:**
   - Next.js 16.4.6 (`app` router) with React 19.3.1.
   - Vercel Labs `@ui-sdk/react` + `@ui-sdk/core` (`0.1.0-beta.13`) for all accessible UI primitives (`Tabs`, `Switch`, `Button`, `Input`, `Textarea`, `Field`, `Dialog`, `Tooltip`).
   - Tailwind CSS 3.4.14 with sleek dark palette (`#060910` canvas, `#0f172a` surfaces, `#0284c7` primary accents).
   - `qr-code-styling` 1.9.2 for client-side rendering with SVG/PNG downloads.

2. **Backend & Redirect Engine:**
   - Next.js API Route Handlers in `src/app/api/campaigns/`.
   - Dynamic short link redirector in `src/app/r/[slug]/route.ts`.
   - Passcode protection handler at `src/app/r/[slug]/unlock/page.tsx`.
   - Asynchronous privacy-friendly scan telemetry parser (`parseUserAgent` in `src/lib/user-agent.ts`).

3. **Database & Storage:**
   - PostgreSQL 16 Alpine (`postgres:16-alpine`).
   - Prisma ORM 5.22.0.
   - Models: `Campaign` (meta, slug, destinationUrl, type, qrType, stylingConfig, totalScans) and `Scan` (device, os, browser, ipHash, scannedAt).
   - Local directory volume mount `./data/postgres` for zero data loss across container teardowns.

4. **Production Deployment:**
   - Multi-stage Alpine Dockerfile pinned to `node:22-alpine`.
   - Caddy 2.9 reverse proxy ready for automated Let's Encrypt TLS.
