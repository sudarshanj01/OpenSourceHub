# 🩺 001: Doctor & Clinic Appointment Scheduling Portal

> A self-contained, self-deployable medical appointment booking portal and patient queue dashboard built for independent physicians, dentists, and neighborhood clinics.

---

## 🌟 Key Features

- **Public Patient Portal**: Direct online appointment booking with real-time 15/30-minute slot availability, instant token generation (`DOC-XXXX`), and no account creation required.
- **My Appointment Tracker**: Patients can look up their upcoming booking status using their phone number or reference token.
- **Doctor & Staff Dashboard**: 
  - Real-time patient queue metrics (Confirmed, In Consultation, Completed, Cancelled).
  - 1-click status transitions with live updates.
  - Doctor consultation notes & prescription logger.
  - Quick walk-in registration modal for front-desk receptionists.
  - Clinic settings: customize doctor bio, consultation fee, operating hours, lunch break window, slot duration (15m, 20m, 30m, 45m, 60m), and PIN.
- **Complete Data Sovereignty**: All patient records and schedules persist in your private PostgreSQL instance. Zero third-party cloud trackers.

---

## ⚡ 60-Second Quickstart

1. **Navigate to the project directory:**
   ```bash
   cd projects/001-doctor-appointment-portal
   ```

2. **Copy the default environment configuration:**
   ```bash
   cp .env.example .env
   ```

3. **Start the containers:**
   ```bash
   docker compose up -d
   ```

4. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.
   - **Default Doctor Admin PIN**: `1234`

---

## 🌐 Deploy to Production (With Custom Domain & Free SSL)

1. Point your domain's DNS `A` record (e.g. `clinic.yourdomain.com`) to your server's public IP address.
2. Edit `.env` and configure:
   ```env
   DOMAIN=clinic.yourdomain.com
   ACME_EMAIL=admin@yourdomain.com
   ```
3. Open `docker-compose.yml`, uncomment the `caddy:` reverse proxy service block at the bottom, and change `app` ports from `ports:` to `expose: - "3000"`.
4. Deploy:
   ```bash
   docker compose up -d --build
   ```
   Caddy will automatically request and renew a free Let's Encrypt TLS certificate.

---

## 🤖 AI Development Manual

For AI coding agents (Claude, Cursor, Copilot, ChatGPT, Antigravity), see [**`agent.md`**](agent.md) for database schemas, API routes, and code architecture rules.
