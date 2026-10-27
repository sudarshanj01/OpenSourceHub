# 🤖 Project Manual: 041-minimalist-employee-attendance (`agent.md`)

> **Employee Attendance & Time-Clock System**  
> Self-hosted, mobile-first touch attendance kiosk, real-time staff floor board, and 1-click monthly timesheet payroll exporter.

---

## 🎯 1. Overview & Problem Solved

Every retail store, clinic, workshop, cafe, repair garage, and small business with 3–50 employees struggles with attendance tracking:
- Traditional paper registers are prone to time theft, missed entries, and hours of tedious manual calculations at the end of each month.
- Commercial HR SaaS (Gusto, BambooHR, Deputy, When I Work, Keka) charge steep monthly per-employee subscription fees (\$4–\$10/user/mo).
- This application provides an instantaneous, self-hosted, touch-friendly front-desk tablet punch clock, live floor roster matrix, and instant CSV payroll export for accounting systems with zero monthly recurring fees.

---

## 🛠️ 2. Architecture & Technology Stack

- **Runtime & Framework:** Next.js 16 (App Router, React 19, TypeScript)
- **Database:** PostgreSQL 16 (`postgres:16-alpine`)
- **ORM:** Prisma ORM 5.21+ (`@prisma/client`)
- **Styling:** Tailwind CSS (Dark-slate theme, custom touch numeric keypad styling)
- **Audio:** Native HTML5 Web Audio API dual-tone synthesizer (zero external sound file dependencies)
- **Containerization:** Multi-stage Docker build (`node:22-alpine` & `postgres:16-alpine`)
- **Reverse Proxy Ready:** Caddy 2.9 with automated Let's Encrypt SSL

---

## 📱 3. Core Capabilities & Routes

1. **Touch Kiosk Punch Interface (`/`)**:
   - Live digital clock with current seconds, day, and date.
   - Live headcount metrics (`Clocked In`, `On Break`, `Not In Yet`, `Shift Finished`).
   - Department filter pills and real-time staff search bar.
   - Staff cards with touch-to-punch modal.
   - Full tactile numeric keypad (1–9, C, 0, ⌫) for 4-digit PIN check-in.
   - Contextual punch buttons: **Clock In**, **Start Break**, **End Break**, **Clock Out**.
   - Immediate audio synthesizer chime and auto-reset countdown bar to return to standby for the next colleague in line.

2. **Live Floor Board (`/board`)**:
   - Designed for supervisor's wall screen or tablet.
   - Real-time headcount summary cards.
   - Live matrix of staff cards showing current on-duty status, active duration timers ticking live, and break times.
   - Auto-refreshes every 12 seconds.

3. **Management & Timesheet Portal (`/admin`)**:
   - Protected by Manager Access PIN (stored in database/`.env`, verified server-side, persisted in `sessionStorage`).
   - Zero credential leaks in UI.
   - **Today's Ledger:** Live audit table and mobile cards with single-click manual punch adjustment.
   - **Staff Directory:** Add/Edit staff, departments, roles, hourly wages, and PINs. Single-click Delete with confirmation modal.
   - **Timesheets & Payroll:** Date-range selector, estimated gross payroll calculation, overtime calculation, 1-click **Download CSV Export** for Excel / QuickBooks, and printable report view.
   - **Settings & Shifts:** Configurable business name, tagline, timezone, currency symbol, reset countdown, sound toggle, shift schedule (start/end time, grace period), and manager PIN update.

---

## 🔒 4. Environment Variables (`.env`)

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=attendancedb
DATABASE_URL=postgresql://postgres:postgres@db:5432/attendancedb?schema=public

PORT=3041
NODE_ENV=production
ADMIN_PIN=1234
```

---

## 🚀 5. Quickstart & Testing

```bash
cd projects/041-minimalist-employee-attendance
cp .env.example .env
docker compose up -d --build
```

Access:
- **Kiosk:** `http://localhost:3041`
- **Live Floor Board:** `http://localhost:3041/board`
- **Manager Admin:** `http://localhost:3041/admin` (Initial PIN: `1234`)
