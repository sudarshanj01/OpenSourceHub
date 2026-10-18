# 🤖 Project Agent Manual (`agent.md`)

This file is the dedicated context guide for AI coding assistants (Claude, Cursor, Copilot, ChatGPT, Antigravity) and human developers working on this micro-app.

---

## 🎯 1. Occupational Persona & Purpose
- **Target Persona:** [e.g. Solo Clinic Doctor, Dentist, Small Shop Owner]
- **Real-World Problem:** [e.g. Booking patient appointments without paying $100/mo to SaaS platforms]
- **Core Value:** [e.g. 1-click slot booking, doctor calendar dashboard, patient queue]

---

## 🛠️ 2. Tech Stack & Architecture
- **Frontend:** Next.js (TypeScript, App Router, Tailwind CSS, Lucide icons)
- **Backend:** Next.js Server Actions / Route Handlers (or Go/Java/Python if specified)
- **Database:** PostgreSQL (`postgres:16-alpine` pinned) via Prisma ORM
- **Containerization:** Multi-stage Dockerfile + Docker Compose

---

## 🗄️ 3. Database Schema Overview
*List your tables, relationships, and key indices here.*

---

## ⚙️ 4. Environment Variables Reference
- `DATABASE_URL`: PostgreSQL connection string (`postgresql://postgres:postgres@db:5432/appdb?schema=public`)
- `PORT`: Service port (default `3000`)
- `NODE_ENV`: `production` or `development`
- `DOMAIN`: (Production) Domain name for automatic Caddy SSL
- `ACME_EMAIL`: (Production) Email for Let's Encrypt certificates

---

## 🚀 5. Local Quickstart (Zero-Config)
```bash
cp .env.example .env
docker compose up -d
```
Open `http://localhost:3000`.

---

## 🌐 6. Production Deployment (Custom Domain + Auto HTTPS)
1. Point DNS `A` record to server IP.
2. Set `DOMAIN` and `ACME_EMAIL` in `.env`.
3. Uncomment the `caddy:` service in `docker-compose.yml`.
4. Run `docker compose up -d --build`.

---

## 🔒 7. Security, Session & Mobile UX Standards
- **Mobile-First UX Priority**: All apps must be fully responsive for mobile devices (320px–420px width). Large touch targets (>= 44px), mobile-friendly tab navigation, and responsive card views for tables (`block md:hidden`).
- **Zero Credential Leaks in UI**: Never show default passwords/PINs in UI placeholders or error messages. Passwords must be verified on the backend (`POST /api/auth/verify`) and never returned in public GET responses.
- **Session Persistence**: Protect admin sessions across browser refreshes via `sessionStorage`. Session terminates on browser/tab close or explicit logout.
- **Clean Record Deletion**: Provide individual delete buttons on all records with confirmation modals so users can manage and clean data from the UI.

---

## 🤖 8. AI Instructions for Extending This App
When an AI agent is asked to add features to this project:
- Preserve PostgreSQL compatibility and update `prisma/schema.prisma` followed by `npx prisma db push` or migrations.
- Maintain responsive, mobile-first design with Tailwind CSS (always test 320px–420px mobile layout).
- Do NOT introduce external third-party closed SaaS dependencies.
- Follow the Zero Credential Leak and Session Persistence principles for all newly generated forms and views.
