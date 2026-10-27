# 🤖 Agent Operational Manual (`agent.md`) — Project 042: OpenSheets

This document specifies the operational rules, tech stack decisions, and extension guides for **OpenSheets** (`042-monthly-employee-timesheets`).

---

## 🎯 Project Identity & Scope
- **Project Number**: 042
- **Name**: OpenSheets
- **Repository Directory**: `projects/042-monthly-employee-timesheets`
- **Port**: `3042`
- **Domain**: Human Resources, Timesheets, Project Time Tracking

---

## 🛠️ Stack & Architecture Standards
1. **Frontend**:
   - Next.js 16 (`app` router) with React 19 and Tailwind CSS.
   - Aceternity-inspired UI styling: `#09090b` dark background, glowing borders, radial dot patterns, glassmorphic cards.
   - Mobile-First design: Desktop matrix table + mobile responsive cards.
   - Client proxy: Rewrites `/api/:path*` to `BACKEND_URL` (`http://backend:8080`), eliminating multi-port CORS overhead.
2. **Backend**:
   - Go 1.24 with `chi` router and `database/sql`.
   - Lightweight, multi-stage alpine build (< 25MB container).
   - JWT authentication with 7-day token persistence.
   - Bcrypt password encryption.
3. **Database**:
   - PostgreSQL 16 Alpine (`postgres:16-alpine`).
   - Tables: `company_settings`, `users`, `projects`, `project_members`, `time_entries`.
   - Automatic migrations & initial starter data on container boot.
   - Mounted to `./data/postgres` for persistence across container restarts.

---

## 🔑 Security & Session Guidelines
- Zero secrets printed or hardcoded in client code.
- 7-day session persistence stored in `localStorage` and `opensheets_token` cookie.
- Domain restriction configurable via Admin Settings: restricts employee email creation to corporate domain (e.g. `@acme.com`).
- Single-click delete buttons with confirmation modals for full data lifecycle management.
- All company details (name, domain, work days, daily target hours) backed by DB and editable via Admin UI.
