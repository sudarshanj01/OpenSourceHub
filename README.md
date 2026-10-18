# 🌐 OpenSourceHub

> **Software for All.**  
> A curated ecosystem of 100 self-contained, self-deployable open-source utility applications built for every occupation on Earth.  
> Single `git pull`. Single `docker compose up`. Zero SaaS vendor lock-in.

---

## 💡 The Philosophy

### 1. Code is Not a MOAT
In the age of modern engineering and AI, software code itself is no longer an insurmountable barrier to entry. Yet, millions of small businesses, solo doctors, teachers, mechanics, cafe owners, and freelancers are charged exorbitant monthly subscriptions for basic software utilities they could easily host themselves.

### 2. Software for Everyone
Whether you are a solo doctor needing appointment slots, a local canteen needing a dynamic QR menu card, a small team tracking attendance and timesheets, or an individual wanting private cloud storage without big-tech surveillance—**OpenSourceHub provides an immediate, free, production-ready starting point.**

### 3. Deployable Without Headaches
Every project in this repository is designed with:
- **Pinned Image Versions**: No brittle `:latest` tags that break over time.
- **Self-Contained Subfolders**: Each project lives in its own folder with its own `docker-compose.yml`, `.env.example`, and concise `README.md`.
- **Zero-Friction Dev Defaults**: Spin up locally in 30 seconds without creating accounts or setting up external cloud dependencies.
- **One-Step Production Ready**: Every `docker-compose.yml` includes a ready-to-uncomment section at the bottom for automatic HTTPS/SSL domain configuration using modern reverse proxies (Caddy/Nginx).

---

## 📂 Repository Structure

```text
OpenSourceHub/
├── README.md                          # Hub overview, guidelines, and navigation
├── PROJECTS_100.md                    # Detailed roadmap of all 100 projects
├── templates/
│   └── project-template/              # Standard archetype for new projects
│       ├── docker-compose.yml         # Pinned dev stack + commented prod SSL block
│       ├── .env.example               # Pinned environment variables
│       ├── README.md                  # Quickstart & production guide
│       └── src/                       # Application code
└── projects/
    ├── 001-doctor-appointment-portal/
    ├── 011-digital-qr-menu-board/
    ├── 021-tuition-student-fee-register/
    ├── 041-minimalist-employee-attendance/
    ├── 042-monthly-employee-timesheets/
    ├── 089-private-cloud-storage-vault/
    └── ...
```

---

## 🗺️ The 100 Projects at a Glance

Full specifications and architecture details are documented in [**PROJECTS_100.md**](PROJECTS_100.md).

| Sector / Category | Projects Range | Target Occupations |
| :--- | :--- | :--- |
| 🩺 **Healthcare & Medicine** | `001` – `010` | Doctors, Dentists, Physiotherapists, Chemists, Vets, Counselors |
| ☕ **Food, Hospitality & Dining** | `011` – `020` | Cafes, Canteens, Bakeries, Food Trucks, Restaurants, Pubs |
| 🎓 **Education, Tuition & Coaching** | `021` – `030` | Tuition Teachers, Private Tutors, Driving Schools, Music Instructors |
| ⚖️ **Professional & Legal Services** | `031` – `040` | Lawyers, CAs/CPAs, Architects, Notaries, Consultants |
| 👥 **HR, Attendance & Operations** | `041` – `050` | Small Companies, Office Admins, Shift Workers, Remote Teams |
| 🔧 **Trades, Field Services & Repair**| `051` – `060` | Auto Mechanics, Plumbers, Electricians, HVAC, Tailors, Cleaners |
| 🛍️ **Retail, Inventory & Rental** | `061` – `070` | Boutiques, Hardware Stores, Tool Rentals, Bookshops, Florists |
| ✂️ **Personal Services & Beauty** | `071` – `080` | Salons, Barbers, Gyms, Yoga Studios, Tattoo Artists, Pet Groomers |
| 🏢 **Real Estate & Property** | `081` – `088` | PG/Hostel Owners, Landlords, Realtors, Co-working Spaces |
| 🛡️ **Data Sovereignty & Personal** | `089` – `095` | Private Cloud Storage, Notes, Bookmark Archiver, Net Worth Tracker |
| 🎨 **Creative, Media & Community** | `096` – `100` | Freelancers, Photographers, Invoicing, Event Organizers, Non-Profits |

---

## ⚡ How to Run Any Project

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/OpenSourceHub.git
   cd OpenSourceHub
   ```

2. **Navigate to the desired project:**
   ```bash
   cd projects/001-doctor-appointment-portal
   ```

3. **Copy environment variables and spin up:**
   ```bash
   cp .env.example .env
   docker compose up -d
   ```

4. **Access the web app** at the local port specified in that project's `README.md` (e.g. `http://localhost:3000`).

---

## 🚀 Moving to Production (With Your Own Domain & SSL)

Every `docker-compose.yml` in this repository includes a production section at the bottom. To expose your service securely with automated HTTPS:

1. Open `docker-compose.yml` in the project folder.
2. Uncomment the reverse proxy block (Caddy or Nginx).
3. Set your domain name in `.env` (e.g. `DOMAIN=clinic.example.com`).
4. Ensure your DNS `A` record points to your server's IP address.
5. Run:
   ```bash
   docker compose up -d --build
   ```
   Caddy will automatically provision and renew a free Let's Encrypt TLS certificate.

---

## 🤝 Contributing

We welcome contributions! To build or contribute a project from the catalog:
1. Review [**PROJECTS_100.md**](PROJECTS_100.md) to pick an unassigned project ID.
2. Copy the template from `templates/project-template/` into `projects/<project-id>/`.
3. Follow the universal rules: **pinned image versions**, **zero external cloud lock-in**, and a clean, responsive UI.

---

## 📜 License

All projects in OpenSourceHub are released under the permissive [MIT License](LICENSE).
Free to use, fork, commercialize, or modify.
