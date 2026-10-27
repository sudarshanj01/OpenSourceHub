# ⏱️ OpenSheets — Professional Timesheet & Project Time Tracking Platform

> **OpenSheets** is a modern, high-performance timesheet tracking and project time management system. Built with **Go (Golang)**, **Next.js 16 (React 19)**, **Tailwind CSS**, and **PostgreSQL 16**, featuring an Aceternity-inspired UI, multi-mode time logging, role-based project assignments, and instant CSV payroll exports.

---

## 🌟 Key Features

### 👤 Employee Capabilities
- **Interactive Daily Time Tracker**:
  - **Time Frame Mode**: Log exact hours worked (e.g. `10:00 AM - 11:30 AM`), with real-time duration computation.
  - **Direct Duration Mode**: Log bulk hours/minutes (e.g. `3 hours 15 mins`).
  - **Live Stopwatch**: Real-time ticking timer that can be started and stopped on the fly.
  - Quick task description, project selector with custom color swatches, and billable status indicator (`$`).
- **Weekly Matrix Grid**:
  - Complete weekly matrix table showing rows of assigned projects against columns for Mon–Sun.
  - Cell-level time logging and total hour summaries.
  - Compares logged hours against standard daily benchmarks (e.g. 8.0h).
- **Personal Hours Dashboard**:
  - Weekly distribution bar chart (Mon–Sun).
  - Allocation breakdown across active projects.
  - Today vs. Week vs. Month tracking.
- **Session Persistence**:
  - Secure JWT authentication with persistent sessions stored locally and restored across page refreshes.

### 👔 Employer / HR Administration
- **Project Management**:
  - Create client and internal projects with custom color tags, project codes, and billable rates.
  - Assign specific employees or whole teams to projects.
  - Track aggregate billable and non-billable hours logged across projects.
- **Employee & Access Management**:
  - Add employees with corporate email credentials and passwords.
  - Corporate Email Domain enforcement (e.g., restrict logins to `@yourcompany.com`).
  - Activate, deactivate, or reassign projects to team members.
- **Company & Policy Settings**:
  - Configurable Company Name.
  - Configurable Working Days (e.g. Mon–Fri vs custom shifts).
  - Daily target work hours (e.g. 8.0 hours = 40 hour work week).
- **Team-Wide Dashboard**:
  - Weekly compliance table showing all team members and their progress against weekly targets.
- **1-Click CSV Payroll & Billing Export**:
  - Filter timesheets by Date Range, Project, or Employee.
  - Generates industry-standard CSV with date, employee, client, project code, billable status, and exact time frames.

---

## 🎨 UI Aesthetic & Design Standard

- **Aceternity UI Styling**: Styled with deep dark zinc tones (`#09090b`), radial grid dot patterns, glowing accent borders, and glassmorphic card elements.
- **Mobile-First Responsive Layout**: All tables feature dedicated responsive cards (`block lg:hidden`) so mobile employees have a seamless experience.
- **Production Standard**: Crisp typography, intentional spacing, distinct interactive states, and zero credential leaks.

---

## 🚀 Quick Start (One Command Up)

### Prerequisites
- Docker Engine 24+ & Docker Compose v2+

### 1. Clone & Enter Project
```bash
cd projects/042-monthly-employee-timesheets
```

### 2. Configure Environment
```bash
cp .env.example .env
```
*(Review `.env` to configure your initial administrator email, password, and database credentials)*

### 3. Launch with Docker Compose
```bash
docker compose up -d
```

Open your browser at **`http://localhost:3042`**.

---

## 📐 Architecture & Technology Stack

```
                     ┌─────────────────────────┐
                     │   Browser (Next.js 16)  │
                     │      Port: 3042         │
                     └────────────┬────────────┘
                                  │ Rewrites /api/*
                                  ▼
                     ┌─────────────────────────┐
                     │   Go (Golang) Backend   │
                     │      Port: 8080         │
                     │  (Chi Router + JWT)     │
                     └────────────┬────────────┘
                                  │ PostgreSQL Driver
                                  ▼
                     ┌─────────────────────────┐
                     │   PostgreSQL 16 DB      │
                     │      Port: 5432         │
                     │  (Persistent Volume)    │
                     └─────────────────────────┘
```

- **Frontend**: Next.js 16, React 19, Tailwind CSS, Lucide Icons.
- **Backend**: Go 1.24, Chi v5 router, bcrypt, JWT v5.
- **Database**: PostgreSQL 16 Alpine with automatic schema migration and indexes.
- **Proxy**: Caddy 2.9 (production-ready SSL block included).

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/login` - Authenticate with email and password.
- `POST /api/auth/logout` - Clear session.
- `GET /api/auth/me` - Fetch authenticated user profile and assigned projects.

### Timesheets
- `GET /api/timesheets` - Query entries (`start_date`, `end_date`, `project_id`, `user_id`).
- `POST /api/timesheets` - Record new time entry.
- `PUT /api/timesheets/{id}` - Update time entry.
- `DELETE /api/timesheets/{id}` - Delete time entry.

### Projects & Team (Admin)
- `GET /api/projects` - List all projects (Admin) or assigned projects (Employee).
- `POST /api/projects` - Create project.
- `PUT /api/projects/{id}` - Update project details.
- `DELETE /api/projects/{id}` - Remove project.
- `GET /api/users` - List all team members and their logged hours.
- `POST /api/users` - Add employee with email domain check.
- `PUT /api/users/{id}` - Update employee access or reset password.
- `DELETE /api/users/{id}` - Delete user account.

### Analytics & Reports
- `GET /api/dashboard/stats` - Fetch weekly totals, daily bar distributions, and project allocations.
- `GET /api/reports/export` - Export timesheet logs as downloadable CSV.
- `GET /api/settings` - Read company policies.
- `PUT /api/settings` - Update company policies (Admin).

---

## 🔒 Production Deployment & SSL

To deploy with automatic Let's Encrypt SSL:
1. In `.env`, set:
   ```env
   DOMAIN=timesheets.yourdomain.com
   ACME_EMAIL=admin@yourdomain.com
   ```
2. In `docker-compose.yml`, uncomment the `caddy` service block and switch `ports` to `expose` in `frontend`.
3. Run `docker compose up -d`.

---

## 📄 License
MIT License. Open source for teams, agencies, and businesses worldwide.
