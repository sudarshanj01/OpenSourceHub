# ⏰ Employee Attendance & Time-Clock System (`041-minimalist-employee-attendance`)

> A self-contained, mobile-first touch attendance kiosk, live staff floor board, and monthly timesheet payroll exporter for small businesses, retail shops, clinics, workshops, and cafes.

Part of the **[OpenSourceHub](../../README.md)** 100-project initiative — self-deployable open-source utility software without subscription fees or vendor lock-in.

---

## 🌟 Key Features

- **📱 Front-Desk Touch Kiosk (`/`)**:
  - Live ticking digital clock with seconds, weekday, and date.
  - Large tactile numeric keypad with audio chime feedback on successful punch.
  - 4-digit PIN authentication for fast check-in (clock in, start/end break, clock out).
  - Configurable auto-reset countdown bar to return to standby for the next employee in line.
- **🖥️ Live Floor Board (`/board`)**:
  - High-visibility wall or tablet display of active on-duty personnel, breaks, and elapsed shift timers.
  - Automatically polls every 12 seconds.
- **📊 Manager & Payroll Portal (`/admin`)**:
  - Protected by management access PIN with browser session persistence.
  - Real-time today's attendance log with manual adjustment tools.
  - Employee directory (add/edit/delete staff, roles, departments, wages, PINs).
  - Date-range timesheet generator calculating regular hours, overtime, and estimated gross pay.
  - **1-Click CSV Export** ready for QuickBooks, Gusto, or spreadsheet accounting.
  - Printable summary timesheet reports.
- **🔒 Zero Hardcoded Data & Zero UI Leaks**:
  - 100% database-backed business profile, shifts, and policy configurations.
  - Passwords and PINs are stripped before public API responses.
- **🐳 Single Command Deployment**:
  - PostgreSQL 16 persistence mounted to local storage (`./data/postgres`).
  - Commented Caddy reverse proxy block with automated Let's Encrypt HTTPS for custom domain production.

---

## ⚡ 60-Second Quickstart

```bash
cd projects/041-minimalist-employee-attendance

# 1. Copy sample environment config
cp .env.example .env

# 2. Launch containerized application and database
docker compose up -d --build
```

The application is immediately accessible at:
- **Kiosk Mode:** `http://localhost:3041`
- **Live Floor Board:** `http://localhost:3041/board`
- **Manager Portal:** `http://localhost:3041/admin` *(Default PIN: `1234`)*

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, React 19, TypeScript)
- **Database:** PostgreSQL 16 (`postgres:16-alpine`)
- **ORM:** Prisma ORM 5.21+
- **Styling:** Tailwind CSS (Dark theme with custom keypad touch classes)
- **Audio:** Native HTML5 Web Audio API synthesizer
- **Container:** Docker (`node:22-alpine` multi-stage build)
- **Proxy:** Caddy 2.9 (production HTTPS ready)

---

## 📄 License

MIT © OpenSourceHub Contributors
