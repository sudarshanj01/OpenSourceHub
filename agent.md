# 🤖 OpenSourceHub Master AI & Developer Manual (`agent.md`)

Welcome to **OpenSourceHub** — the launchpad of 100 self-contained, self-deployable open-source utility applications built for every occupation on Earth.

This document (`agent.md`) is the master operational manual, AI context definition, and design standard for the entire repository. Every project inside `projects/` must strictly comply with the guidelines defined here. Both human developers and AI coding agents (Claude, Cursor, Copilot, ChatGPT, Antigravity) can read this file to immediately understand the architecture, standards, and expansion workflows.

---

## 🎯 1. The Core Vision & Philosophy

1. **Code is Not a MOAT**: In the modern era, high-utility tools should not be gated behind monthly SaaS subscriptions. Small businesses, doctors, tutors, mechanics, and freelancers deserve free, self-sovereign software.
2. **Software for All**: Each project solves a specific, focused real-world problem for an occupation without enterprise bloat.
3. **Single Git Pull, Single Command Up**: Anyone should be able to clone the repository, navigate into any project folder, run `docker compose up -d`, and immediately have a running, production-grade application.

---

## ⚡ 2. Mandatory Latest-Stable Version Protocol (Web Search First)

Whenever an AI agent or human contributor builds, scaffolds, or upgrades any project or micro-service in OpenSourceHub:

1. **Always Use the Very Latest Stable Version**:
   - Regardless of the programming language, framework, runtime, ORM, database, or library (Node.js, Next.js, React, TypeScript, Python, Golang, Java, Rust, PostgreSQL, Prisma, Tailwind CSS, etc.), you MUST ALWAYS select the **utmost latest stable version**.
   - Never settle for older boilerplate defaults or legacy versions. If a template contains an older version, immediately upgrade it to the newest stable release.
2. **Mandatory Web Search Discovery Before Scaffolding**:
   - Before initializing any project or defining `package.json` / `go.mod` / `requirements.txt` / `pom.xml`, the agent MUST perform a **web search** (e.g. `"latest stable release <framework/language> <year>"`) to discover the exact latest stable release, its active peer requirements, and any breaking changes.
3. **Pin Container Images to Verified Latest Stable Releases**:
   - Base images in `Dockerfile` and `docker-compose.yml` must be pinned to the verified latest stable/LTS tags (never use floating `:latest`, but ensure the pinned tag is the latest stable release):
     - Node.js: `node:22-alpine` (or current active LTS/stable)
     - Next.js: Latest major/minor stable (e.g., Next.js `16.x` + React `19.x`)
     - Python: `python:3.12-slim` / `python:3.13-slim`
     - Golang: `golang:1.24-alpine` / `golang:1.23-alpine`
     - Java: `eclipse-temurin:21-jre-alpine` / `eclipse-temurin:23-jre-alpine`
     - PostgreSQL: `postgres:16-alpine` / `postgres:17-alpine`
     - Reverse Proxy: `caddy:2.9-alpine` / `caddy:2.8-alpine`
4. **Zero Vulnerability Standard**:
   - Always run vulnerability checks (`npm audit fix`, security scanners) right after dependency installation to ensure 0 vulnerabilities before verifying in Docker.

---

## 🛠️ 3. Best-Fit Tech Stack Selection & Official Standards

### A. Core Architectural Philosophy: Best-Fit Over Defaulting
- **Never Blindly Default to Next.js or Template Boilers**: Do not pick a stack simply because it is trendy, fancy, or what was used in the previous project.
- **Project-Specific Stack Discovery**: For every new project, evaluate the fundamental requirements, operational environment, concurrency, data structures, and device constraints to choose the **absolute best-fit stack**:
  - **Golang (Gin / Chi / Fiber + HTMX or lightweight frontend)**: Ideal for high-efficiency, lightweight, low-memory footprint single-binary services, hardware-constrained appliances, IoT devices, or lightning-fast microservices with zero Node runtime bloat.
  - **Java / Kotlin (Spring Boot 3 / Quarkus + Thymeleaf or React)**: Ideal for enterprise-grade data validation, strict transaction consistency, deep domain modeling, corporate compliance, or batch processing.
  - **Python (FastAPI / Django + Tailwind/HTMX)**: Ideal for data-heavy analytics, PDF/document parsing, AI/ML integrations, or scientific computations.
  - **Node.js / Next.js / Vite / React**: Ideal for rich, interactive, real-time client-heavy SPAs, touch-screen kiosks, dynamic drag-and-drop interfaces, or web-first reactive boards.
- Pick what is **technically and architecturally best for the domain**, not what is easiest or familiar.

### B. Database Standard
- **Always use PostgreSQL**: Every project uses PostgreSQL as its primary database.
- **Pinned Version**: Always pin to `postgres:16-alpine` or `postgres:17-alpine`. Never use unpinned `:latest`.
- **Persistence**: All database data must be mounted to a local volume (`./data/postgres` or a named volume) so data is never lost across container restarts.

### C. Frontend Standard (Mobile-First is Priority #1)
- **Mobile-First UX**: All target users (small business owners, staff, patients, customers) primarily access software on mobile phones (320px–420px screen widths) or wall-mounted tablets. 
  - Interfaces must be mobile-first: large touch targets (minimum 44x44px for buttons), responsive modals, and clean spacing.
  - Wide data tables MUST provide a dedicated mobile card view (`block md:hidden`) alongside desktop tables (`hidden md:block`) so mobile users never suffer awkward horizontal scrolling.
  - Navigation bars must be compact and responsive with collapsible or icon-friendly tabs.

---

## 🐳 4. Container & Docker Standards

Every project subfolder MUST include:

1. **Pinned Image Versions (Always Latest Stable)**:
   - Node: `node:22-alpine`
   - Python: `python:3.12-slim` (or `3.13-slim`)
   - Golang: `golang:1.24-alpine` (or `1.23-alpine`)
   - Java: `eclipse-temurin:21-jre-alpine`
   - Database: `postgres:16-alpine` / `postgres:17-alpine`
   - Reverse Proxy: `caddy:2.9-alpine` / `caddy:2.8.4-alpine`
   - Storage (when needed): `minio/minio:RELEASE.2024-05-10T01-41-38Z`

2. **Zero-Friction Dev Defaults**:
   - `cp .env.example .env && docker compose up -d` must work immediately with zero manual DB configuration or migration headaches.
   - Built-in automatic database migrations or seeding on container boot.

3. **Production Domain & SSL Ready**:
   - At the bottom of every project's `docker-compose.yml`, there is a commented **Caddy reverse proxy** block.
   - By uncommenting the Caddy block and setting `DOMAIN` and `ACME_EMAIL` in `.env`, the user gets instant automatic Let's Encrypt HTTPS certificates in production.

---

## 🔒 5. Universal Security & Demo-Data Lifecycle Standards

Every micro-application must adhere to these product-ready security and data management rules:

1. **Zero Credential Leaks in UI (Never Print Secrets)**:
   - **Never display default passwords, PINs, or credentials in the frontend UI** (no placeholders like `"Default PIN: 1234"`, no explanatory notes revealing defaults).
   - Initial credentials must be configurable via `.env` (documented only in `.env.example`).
   - Public API endpoints (e.g. `GET /api/profile`, `GET /api/settings`) MUST explicitly strip out secret fields (`adminPin`, password hashes, tokens) before responding.
   - Authentication must use dedicated verification endpoints (e.g. `POST /api/auth/verify`) rather than comparing values in client-side code.

2. **Production-Grade Data Management**:
   - Seeding realistic sample data is helpful for immediate out-of-the-box exploration upon `docker compose up -d`.
   - When deploying to production, users must be able to delete records cleanly one-by-one from the UI with single-click delete buttons (and confirmation modals).
   - Avoid tacky demo buttons in primary navigation (e.g., do not add large "Clear Demo Data" buttons in the header toolbar; keep dashboards clean and production-styled).

3. **Session Persistence (`sessionStorage`)**:
   - Once an administrator or operator enters their access PIN/password, the session MUST persist across browser page refreshes using `sessionStorage`.
   - The user must not be kicked out when refreshing the page.
   - The session automatically terminates when the browser tab or window closes, or when the user explicitly clicks "Lock / Logout".

4. **Zero Hardcoded Display Data (100% Dynamic & Configurable)**:
   - **Never hardcode static business or professional entity data** (e.g. clinic/business names, staff names, specialties, contact phones, email addresses, physical street locations, fees, or operating hours).
   - Any data rendered in public views, customer portals, PDF slips, printouts, or receipts **MUST be backed by the database and completely editable in the Admin / Settings UI**.
   - Default seed values may be provided on first boot for instant discovery, but the administrator must always have full control to update every single field via the settings form without touching code.

---

## 📊 6. Master Progress Tracker & Human Verification Protocol (MANDATORY)

The root [`TRACKER.md`](TRACKER.md) is the single source of truth for project completion state across all chat sessions.

### 🚫 The "Never Mark DONE Autonomously" Rule:
1. **AI Agents MUST NOT Mark a Project `✅ DONE` Without Explicit Human Verification**:
   - An agent can NEVER decide on its own that a project is `✅ DONE`.
   - When a project is built and running in Docker, the agent must keep the status as `🔄 IN_PROGRESS` in [`TRACKER.md`](TRACKER.md).
   - The agent's responsibility is solely to present the local test URLs (e.g. `http://localhost:<port>` and `http://localhost:<port>/admin`) so the repo owner can personally test and inspect the running app.
2. **STRICT Anti-Nagging Rule (Do NOT Ask "Are We Done? Can We Move Next?"):**
   - **Never pester the owner** with questions like *"Is it done?"*, *"Can we mark completed?"*, or *"Can we move to the next project?"*. Repeatedly asking "done? done? done?" is strictly prohibited.
   - The owner is mature and experienced. They will thoroughly test the application, request multiple rounds of modifications, refinements, or feature adjustments over several turns.
   - When the owner is fully satisfied with the feature set and UX, **they will tell the agent on their own accord** (e.g., *"It's good, mark as completed and push"*).
   - **Only after** the owner gives that explicit green light does the agent mark `✅ DONE` in [`TRACKER.md`](TRACKER.md), finalize git commits, and request push confirmation.

---

## 🛑 7. Strict Git Push Protocol (MANDATORY RULE)

Every AI coding assistant (Antigravity, Cursor, Claude, Copilot, ChatGPT) working in this repository MUST strictly follow this mandatory rule:
1. **Never Run `git push` Autonomously**:
   - Under NO circumstances may an AI agent execute `git push` automatically or without direct explicit human authorization.
   - The agent MUST explicitly prompt the user first:  
     > *"I am going to execute `git push origin <branch>`. Shall I proceed?"*
   - ONLY when the user (Sudarshan / repo owner) explicitly responds with a confirmation (e.g. *"yes"*) is the agent permitted to execute `git push`.
2. **Prerequisites Before Requesting Push**:
   - The project MUST be verified, healthy in Docker, and the owner has explicitly signaled satisfaction and instructed the agent to mark it as `✅ DONE` in [`TRACKER.md`](TRACKER.md).
   - All code, schemas, and documentation must be committed cleanly to the local git branch.

---

## 📁 8. Project Directory Blueprint

Each project inside `projects/<project-id>/` must follow this layout:

```text
projects/<project-id>/
├── agent.md                 # Project-specific AI & developer manual, stack details & operational guide
├── README.md                # 60-second quickstart overview
├── docker-compose.yml       # Pinned services + commented Caddy reverse proxy
├── .env.example             # Clean environment variable defaults
├── Dockerfile               # Production multi-stage build container
└── src/ (or app/)           # Source code
```

---

## 📋 9. Required Contents of Project-Level `agent.md`

Every project must maintain its own `agent.md` containing:
1. **Project Name & Occupational Persona**: Who uses it and what real-world pain it solves.
2. **Exact Tech Stack & Architecture**: Pinned container tags, libraries, and communication flows.
3. **Database Schema & Data Model**: Tables, fields, relationships, and indices.
4. **Environment Variables Reference**: Explanation of every key in `.env`.
5. **Local Deployment Steps**: 1-minute quickstart commands.
6. **Production Deployment Steps**: Domain mapping, SSL setup, and reverse proxy activation.
7. **Troubleshooting & Backup**: How to dump and restore the PostgreSQL database, and inspect logs.
8. **AI Prompt Extension Notes**: Context instructions for AI agents on how to safely add features to that specific project.

---

## 🚀 10. Next Steps & Execution Order

We build these applications systematically one by one:
- **Project #1 Selected**: `001-doctor-appointment-portal` (Healthcare & Clinics)
- Next up: `011-digital-qr-menu-board` (Food & Canteens), `041-minimalist-employee-attendance` (HR & Workplace), `042-monthly-employee-timesheets`, and `089-private-cloud-storage-vault`.
