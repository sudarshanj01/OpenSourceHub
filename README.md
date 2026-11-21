# 🌐 OpenSourceHub — 100 Sovereign Open-Source SaaS Alternatives

> **Software for All.**  
> A curated ecosystem of self-contained, self-deployable open-source utility applications built for real-world occupations and businesses.  
> Single `git pull`. Single `docker compose up`. Zero SaaS vendor lock-in.

---

## 💡 The Philosophy

### 1. Code is Not the Moat — Execution, Polish & Scaling Are
In modern software engineering, raw source code is no longer an insurmountable moat. **The true moat is execution, user experience, reliability, and scaling.** Exorbitant monthly SaaS fees gatekeep basic utility tools that businesses, professionals, and teams need every single day. OpenSourceHub exists to bridge that gap with production-grade, self-sovereign applications that just work.

### 2. Software Built for Real Occupations
Every project solves a concrete, high-utility operational challenge without enterprise bloat—from medical clinics and restaurants to agency timesheets, attendance tracking, database disaster recovery, and internal tooling.

### 3. Frictionless, Reliable Self-Hosting
- **Pinned Container Versions**: Pinned, audited base images that remain stable over time (`postgres:16-alpine`, `node:22-alpine`, `caddy:2.9-alpine`).
- **Self-Contained Architecture**: Each project is an independent directory with its own container orchestration and environment definitions.
- **Zero-Friction Dev Defaults**: Immediate local spin-up without requiring proprietary cloud registrations.
- **Production SSL Ready**: Production reverse-proxy configurations ready to provision automated Let's Encrypt certificates when attached to a custom domain.

---

## 🌟 Featured Live Products

Production-grade applications deployed live on the web and ready for immediate public use:

<div style="overflow-x: auto; max-height: 400px; overflow-y: auto;">

| Product | Live Production URL | Primary Use Case & Capabilities | Technology Stack | Source Code |
| :--- | :--- | :--- | :--- | :--- |
| **VaultEngine** | [https://vaultengine-pitr.vercel.app](https://vaultengine-pitr.vercel.app) | **AWS RDS Alternative**: Sovereign continuous database transaction archiving & second-precision Point-in-Time Recovery (PITR) to Amazon S3 for PostgreSQL and MySQL on raw EC2. Features zero-secret AWS IMDSv2 IAM auto-discovery, in-memory AES-256 encryption, and a 1-line shell installer. | Rust (CLI/Daemon), Next.js 16, Three.js, Tailwind CSS | [`projects/103-sovereign-db-vault/`](projects/103-sovereign-db-vault/) |

</div>

---

## 🔍 Open-Source SaaS Replacement Index

Looking for a self-hosted, sovereign replacement for expensive monthly SaaS tools? OpenSourceHub provides drop-in open-source utilities:

<div style="overflow-x: auto; max-height: 480px; overflow-y: auto;">

| Commercial SaaS Gated Behind Paywalls | OpenSourceHub Sovereign Alternative | Occupational Domain | Status & Source |
| :--- | :--- | :--- | :--- |
| **AWS RDS** ($200–$800+/mo compute & storage tax) | **VaultEngine** (Continuous S3 PITR on Raw EC2) | DevOps, DBAs, Cloud Engineers | [Live](https://vaultengine-pitr.vercel.app) • [`projects/103-sovereign-db-vault/`](projects/103-sovereign-db-vault/) |
| **Loom / Vidyard** (Watermark-locked 1080p, seat fees) | **CapFlow** (Screen & Camera Bubble Studio) | Developers, Creators, Async Teams | [`projects/102-screen-recording-studio/`](projects/102-screen-recording-studio/) |
| **Bitly / QR Code Pro** ($35/mo dynamic redirect lock) | **QRShield** (Anti-Ransom Dynamic QR Studio) | Marketing, Hospitality, Campaigns | [`projects/101-sovereign-dynamic-qr-studio/`](projects/101-sovereign-dynamic-qr-studio/) |
| **Harvest / Toggl Track** ($12/user/mo timesheets) | **OpenSheets** (Timesheets & Project Time Tracker) | Agencies, Freelancers, HR Admins | [`projects/042-monthly-employee-timesheets/`](projects/042-monthly-employee-timesheets/) |
| **When I Work / Deputy** (Per-employee attendance fees) | **Minimalist Employee Attendance** (PIN Time-Clock) | Retail Stores, Small Businesses | [`projects/041-minimalist-employee-attendance/`](projects/041-minimalist-employee-attendance/) |
| **Toast / Mr Yum** ($50–$150/mo digital menu fees) | **Digital QR Menu Board** (Live Contactless Menu) | Cafes, Diners, Food Trucks | [`projects/011-digital-qr-menu-board/`](projects/011-digital-qr-menu-board/) |
| **Zocdoc / Calendly** ($30–$300/mo booking fees) | **Doctor Appointment Portal** (Clinic Slot Booker) | Clinics, Doctors, Private Practices | [`projects/001-doctor-appointment-portal/`](projects/001-doctor-appointment-portal/) |

</div>

---

## 📦 Active Projects Showcase

A growing collection of production-ready applications built to professional engineering standards:

<div style="overflow-x: auto; max-height: 480px; overflow-y: auto;">

| ID | Application | Focus Area & SEO Keywords | Directory |
|:---|:---|:---|:---|
| **001** | **Doctor Appointment Portal** | Medical clinic scheduling, EHR/EMR patient bookings, and slot management | [`projects/001-doctor-appointment-portal/`](projects/001-doctor-appointment-portal/) |
| **011** | **Digital QR Menu Board** | Restaurant menu display, contactless dining, cafe food ordering workflow | [`projects/011-digital-qr-menu-board/`](projects/011-digital-qr-menu-board/) |
| **041** | **Minimalist Employee Attendance** | PIN-based time-clock, shift verification, staff biometric/attendance logs | [`projects/041-minimalist-employee-attendance/`](projects/041-minimalist-employee-attendance/) |
| **042** | **OpenSheets** | Enterprise-grade timesheets, weekly matrix grids, project hours & payroll exports | [`projects/042-monthly-employee-timesheets/`](projects/042-monthly-employee-timesheets/) |
| **101** | **QRShield (Anti-Ransom Dynamic QR Studio)** | Sovereign dynamic QR codes, UTM campaign tracking, editable redirects & SVG exports | [`projects/101-sovereign-dynamic-qr-studio/`](projects/101-sovereign-dynamic-qr-studio/) |
| **102** | **CapFlow (Sovereign Screen & Cam Studio)** | Browser screen & camera bubble recording, real-time compositor & video trimming | [`projects/102-screen-recording-studio/`](projects/102-screen-recording-studio/) |
| **103** | **VaultEngine (Sovereign Database PITR Engine)** | PostgreSQL WAL & MySQL binlog continuous S3 streaming, second-precision restore | [`projects/103-sovereign-db-vault/`](projects/103-sovereign-db-vault/) |

</div>

---

## ⚡ How to Run Any Project

Each project in OpenSourceHub is completely self-contained. To run any application:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sudarshanj01/OpenSourceHub.git
   cd OpenSourceHub
   ```

2. **Navigate into the desired project directory:**
   ```bash
   cd projects/<project-folder-name>
   ```

3. **Initialize environment variables and start:**
   ```bash
   cp .env.example .env
   docker compose up -d
   ```

4. **Access the application:**  
   Open your browser at `http://localhost:<PORT>` (refer to the project's individual `.env.example` or documentation for the exact port assignment).

---

## 🚀 Moving to Production (Custom Domain & SSL)

Every project contains a production-ready reverse proxy configuration block. To deploy publicly with automated HTTPS:

1. In the project's `.env`, configure your domain:
   ```env
   DOMAIN=app.yourdomain.com
   ACME_EMAIL=admin@yourdomain.com
   ```
2. In `docker-compose.yml`, uncomment the reverse-proxy service block (Caddy) and map ports `80` and `443`.
3. Point your DNS `A` record to your server's public IP address.
4. Run:
   ```bash
   docker compose up -d
   ```

---

## 🤝 Open-Source Community & Contributing

OpenSourceHub is built by and for the open-source community. We welcome contributions from developers, designers, indie hackers, and students worldwide!

### Why Contribute?
- **Build Real Products, Not Toy Demos**: Contribute to standalone, fully functional tools that solve real operational problems.
- **Learn Modern Engineering**: Practice Git collaboration, branching workflows, pull requests, Docker multi-stage builds, database migrations, and clean architectural patterns.
- **Diverse Stacks & Scalability**: Bring new frameworks, language ecosystems (Rust, Go, Python, Node, React/Next.js), and architectural paradigms suited to specific occupational domains.

### How to Get Involved:
1. **Explore the Roadmap**: Review planned concepts in [`TRACKER.md`](TRACKER.md) or [`PROJECTS_100.md`](PROJECTS_100.md).
2. **Fork & Branch**: Create a feature branch for your project or improvement:
   ```bash
   git checkout -b feature/your-project-name
   ```
3. **Adhere to Production Standards**:
   - Perform web search discovery & architectural brainstorming before scaffolding.
   - Build complete, independent projects inside `projects/<project-name>`.
   - Never hardcode or display default credentials/secrets in the UI.
   - Design mobile-first with clean, high-contrast aesthetics.
   - Include automated migrations and clean Docker compose configurations.
4. **Submit a Pull Request**: Open a PR with clear documentation and verification steps.

---

## 🏷️ Search Topics & Index Keywords

`self-hosted` • `open-source-saas` • `aws-rds-alternative` • `postgresql-backup` • `mysql-binlog-backup` • `point-in-time-recovery` • `loom-alternative` • `screen-recorder` • `dynamic-qr-code` • `timesheet-management` • `employee-attendance` • `doctor-appointment-portal` • `digital-menu-board` • `docker-compose` • `rust-cli` • `nextjs-16`

---

## 📜 License

All projects in OpenSourceHub are released under the permissive [MIT License](LICENSE).  
Free for personal, commercial, educational, and community use.
