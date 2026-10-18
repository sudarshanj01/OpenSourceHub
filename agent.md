# 🤖 OpenSourceHub Master AI & Developer Manual (`agent.md`)

Welcome to **OpenSourceHub** — the launchpad of 100 self-contained, self-deployable open-source utility applications built for every occupation on Earth.

This document (`agent.md`) is the master operational manual, AI context definition, and design standard for the entire repository. Every project inside `projects/` must strictly comply with the guidelines defined here. Both human developers and AI coding agents (Claude, Cursor, Copilot, ChatGPT, Antigravity) can read this file to immediately understand the architecture, standards, and expansion workflows.

---

## 🎯 1. The Core Vision & Philosophy

1. **Code is Not a MOAT**: In the modern era, high-utility tools should not be gated behind monthly SaaS subscriptions. Small businesses, doctors, tutors, mechanics, and freelancers deserve free, self-sovereign software.
2. **Software for All**: Each project solves a specific, focused real-world problem for an occupation without enterprise bloat.
3. **Single Git Pull, Single Command Up**: Anyone should be able to clone the repository, navigate into any project folder, run `docker compose up -d`, and immediately have a running, production-grade application.

---

## 🛠️ 2. Official Tech Stack Standards

To guarantee maintainability, reliability, and ease of deployment, all projects adhere to the following stack rules:

### A. Database Standard
- **Always use PostgreSQL**: Every project uses PostgreSQL as its primary database.
- **Pinned Version**: Always pin to `postgres:16-alpine`. Never use `:latest`.
- **Persistence**: All database data must be mounted to a local volume (`./data/postgres` or a named volume) so data is never lost across container restarts.

### B. Frontend Standard
- **Next.js (App Router, TypeScript, Tailwind CSS)**: Modern, responsive, mobile-first interfaces with clean typography and icons (Lucide React).

### C. Backend Strategy
- **Compact & Utility Apps**: For streamlined micro-utilities, use the built-in Next.js backend (App Router Route Handlers & Server Actions with Prisma ORM or Drizzle). This delivers a single lightweight app container alongside PostgreSQL.
- **High-Concurrency & Performance Apps**: Use **Golang** (Gin / Chi) or **Java** (Spring Boot / Quarkus) when heavy concurrent worker pipelines or long-term high-throughput processing is required.
- **Specialized Library Apps**: Use **Python** (FastAPI) when the application requires specialized scientific, image manipulation, AI, or data calculation libraries.

---

## 🐳 3. Container & Docker Standards

Every project subfolder MUST include:

1. **Pinned Image Versions**:
   - Node: `node:20-alpine`
   - Python: `python:3.11-slim`
   - Golang: `golang:1.22-alpine`
   - Java: `eclipse-temurin:21-jre-alpine`
   - Database: `postgres:16-alpine`
   - Reverse Proxy: `caddy:2.8.4-alpine`
   - Storage (when needed): `minio/minio:RELEASE.2024-05-10T01-41-38Z`

2. **Zero-Friction Dev Defaults**:
   - `cp .env.example .env && docker compose up -d` must work immediately with zero manual DB configuration or migration headaches.
   - Built-in automatic database migrations or seeding on container boot.

3. **Production Domain & SSL Ready**:
   - At the bottom of every project's `docker-compose.yml`, there is a commented **Caddy reverse proxy** block.
   - By uncommenting the Caddy block and setting `DOMAIN` and `ACME_EMAIL` in `.env`, the user gets instant automatic Let's Encrypt HTTPS certificates in production.

---

## 📁 4. Project Directory Blueprint

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

## 📋 5. Required Contents of Project-Level `agent.md`

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

## 🚀 6. Next Steps & Execution Order

We build these applications systematically one by one:
- **Project #1 Selected**: `001-doctor-appointment-portal` (Healthcare & Clinics)
- Next up: `011-digital-qr-menu-board` (Food & Canteens), `041-minimalist-employee-attendance` (HR & Workplace), `042-monthly-employee-timesheets`, and `089-private-cloud-storage-vault`.
