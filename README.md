# 🌐 OpenSourceHub

> **Software for All.**  
> A curated ecosystem of self-contained, self-deployable open-source utility applications built for real-world occupations and businesses.  
> Single `git pull`. Single `docker compose up`. Zero SaaS vendor lock-in.

---

## 💡 The Philosophy

### 1. Code is Not the Moat — Execution, Polish & Scaling Are
In modern software engineering, raw source code is no longer an insurmountable moat. **The true moat is execution, user experience, reliability, and scaling.** Exorbitant monthly SaaS fees gatekeep basic utility tools that businesses, professionals, and teams need every single day. OpenSourceHub exists to bridge that gap with production-grade, self-sovereign applications that just work.

### 2. Software Built for Real Occupations
Every project solves a concrete, high-utility operational challenge without enterprise bloat—from medical clinics and restaurants to agency timesheets, attendance tracking, and internal tooling.

### 3. Frictionless, Reliable Self-Hosting
- **Pinned Container Versions**: Pinned, audited base images that remain stable over time.
- **Self-Contained Architecture**: Each project is an independent directory with its own container orchestration and environment definitions.
- **Zero-Friction Dev Defaults**: Immediate local spin-up without requiring proprietary cloud registrations.
- **Production SSL Ready**: Production reverse-proxy configurations ready to provision automated Let's Encrypt certificates when attached to a custom domain.

---

## 📦 Active Projects Showcase

A growing collection of production-ready applications built to professional engineering standards:

| ID | Application | Focus Area | Directory |
|:---|:---|:---|:---|
| **001** | **Doctor Appointment Portal** | Medical clinic scheduling, patient bookings, and slot management | [`projects/001-doctor-appointment-portal/`](projects/001-doctor-appointment-portal/) |
| **011** | **Digital QR Menu Board** | Restaurant menu display, category browsing, and diner order workflow | [`projects/011-digital-qr-menu-board/`](projects/011-digital-qr-menu-board/) |
| **041** | **Minimalist Employee Attendance** | PIN-based time-clock, shift verification, and staff attendance logs | [`projects/041-minimalist-employee-attendance/`](projects/041-minimalist-employee-attendance/) |
| **042** | **OpenSheets** | Enterprise-grade timesheets, weekly matrix grids, project hours & payroll exports | [`projects/042-monthly-employee-timesheets/`](projects/042-monthly-employee-timesheets/) |

---

## ⚡ How to Run Any Project

Each project in OpenSourceHub is completely self-contained. To run any application:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/OpenSourceHub.git
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
- **Diverse Stacks & Scalability**: Bring new frameworks, language ecosystems (Go, Rust, Python, Node, React/Next.js), and architectural paradigms suited to specific occupational domains.

### How to Get Involved:
1. **Explore the Roadmap**: Review planned concepts or propose a new application for an unserved profession.
2. **Fork & Branch**: Create a feature branch for your project or improvement:
   ```bash
   git checkout -b feature/your-project-name
   ```
3. **Adhere to Production Standards**:
   - Build complete, independent projects inside `projects/<project-name>`.
   - Never hardcode or display default credentials/secrets in the UI.
   - Design mobile-first with clean, high-contrast aesthetics.
   - Include automated migrations and clean Docker compose configurations.
4. **Submit a Pull Request**: Open a PR with clear documentation and verification steps.

---

## 📜 License

All projects in OpenSourceHub are released under the permissive [MIT License](LICENSE).  
Free for personal, commercial, educational, and community use.
