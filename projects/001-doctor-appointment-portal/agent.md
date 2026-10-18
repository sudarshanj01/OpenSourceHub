# 🤖 Project Agent Manual (`agent.md`)
## `001-doctor-appointment-portal`

This document is the dedicated AI context handbook and developer specification for **`001-doctor-appointment-portal`**. AI coding assistants (Claude, Cursor, Copilot, ChatGPT, Antigravity) and human contributors should refer to this guide when extending or operating this micro-application.

---

## 🎯 1. Occupational Persona & Purpose

- **Target Persona:** Solo General Physicians, Pediatricians, Dentists, Physiotherapists, and Independent Neighborhood Clinics.
- **Pain Point Solved:** Commercial platforms (Zocdoc, Practo, Calendly) charge high monthly recurring fees, siphon patient demographic data, and promote rival doctors to patients.
- **Solution:** A self-contained, self-deployable medical slot booking portal with real-time patient queue management, customizable operating hours, and doctor consultation notes.

---

## 🛠️ 2. Tech Stack & Architecture

- **Frontend & Fullstack Engine:** Next.js 14 (App Router, React 18, TypeScript, Tailwind CSS, Lucide icons).
- **Database:** PostgreSQL (`postgres:16-alpine` pinned) with Prisma ORM.
- **Container Strategy:**
  - Multi-stage Dockerfile (`node:20-alpine` base, builder, and standalone runner using non-root `nextjs` user).
  - Automated schema push and seeding via `docker-entrypoint.sh` on container boot.
  - Pinned `postgres:16-alpine` with healthchecks and local volume persistence (`./data/postgres`).
- **Production Reverse Proxy:** `caddy:2.8.4-alpine` with automatic Let's Encrypt SSL/HTTPS.

---

## 🗄️ 3. Database Schema (`prisma/schema.prisma`)

### `DoctorProfile`
| Field | Type | Default / Description |
| :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key |
| `clinicName` | String | e.g. "CarePlus Family Health Clinic" |
| `doctorName` | String | e.g. "Dr. Sarah Jenkins, MD" |
| `specialty` | String | e.g. "Family Medicine & General Physician" |
| `bio` | String | Professional biography |
| `phone` | String | Clinic contact telephone |
| `email` | String | Clinic administrative email |
| `address` | String | Physical clinic location |
| `consultationFee` | String | e.g. "$60" or "₹500" |
| `slotDurationMinutes` | Int | Default `30` (Options: 15, 20, 30, 45, 60) |
| `workStartHour` | String | e.g. "09:00" |
| `workEndHour` | String | e.g. "17:00" |
| `breakStartHour` | String | e.g. "13:00" |
| `breakEndHour` | String | e.g. "14:00" |
| `activeDays` | String | Comma-separated: "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday" |
| `adminPin` | String | Default: `"1234"` |

### `Appointment`
| Field | Type | Default / Description |
| :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key |
| `bookingRef` | String (Unique) | Unique patient token, e.g. `"DOC-1002"` |
| `patientName` | String | Patient full name |
| `patientPhone` | String | Patient contact phone |
| `patientEmail` | String? | Optional confirmation email |
| `reason` | String | Symptoms / consultation reason |
| `appointmentDate` | String | Date in `YYYY-MM-DD` |
| `appointmentTime` | String | Time slot in `HH:mm` (e.g. "09:30") |
| `status` | String | `CONFIRMED`, `IN_CONSULTATION`, `COMPLETED`, `CANCELLED`, `NO_SHOW` |
| `doctorNotes` | String? | Doctor's private clinical diagnosis & prescription notes |

---

## 🔌 4. API Endpoints

- `GET /api/profile` - Fetch clinic profile and operating hours (sensitive fields like `adminPin` are automatically stripped).
- `PUT /api/profile` - Update doctor profile, working hours, slot duration, and PIN (PIN is only updated if non-empty).
- `POST /api/auth/verify` - Secure backend PIN verification endpoint (`{ "pin": "..." }`).
- `GET /api/slots?date=YYYY-MM-DD` - Generate active slots, taking into account lunch breaks and existing bookings.
- `GET /api/appointments?date=...&status=...&query=...` - Query appointments with search filters.
- `POST /api/appointments` - Book a slot and issue a unique `DOC-XXXX` token.
- `PATCH /api/appointments/[id]` - Update appointment status or doctor clinical notes.
- `DELETE /api/appointments/[id]` - Remove an individual appointment.
- `DELETE /api/appointments` - Purge all appointments or filtered by date (used by "Clear Demo Data").

---

## 🔒 5. Security & Demo Data Management
- **Zero Credential Leaks in UI**: The clinic PIN is never printed in UI placeholders, error messages, or demo hints. Initial access is configured in `.env` via `ADMIN_PIN=1234`.
- **Clean Slate Guarantee**: Users can delete any individual appointment row or click "Clear Demo Data" in the doctor dashboard to wipe all test records with one click before launching live.

---

## 🚀 5. Local Quickstart (Zero-Config)

```bash
cd projects/001-doctor-appointment-portal
cp .env.example .env
docker compose up -d
```
Open **`http://localhost:3000`** in your browser.
Default Administrator PIN: **`1234`**

---

## 🌐 6. Production Domain & SSL Setup

1. Point your domain's DNS `A` record (e.g. `clinic.mydomain.com`) to your server IP.
2. In `.env`, set:
   ```env
   DOMAIN=clinic.mydomain.com
   ACME_EMAIL=admin@mydomain.com
   ```
3. In `docker-compose.yml`, uncomment the `caddy:` block and change `app` ports to `expose: - "3000"`.
4. Run:
   ```bash
   docker compose up -d --build
   ```

---

## 🤖 7. AI Extension Instructions

When asking an AI coding assistant to modify or extend this portal:
1. **Adding Notifications (WhatsApp / SMS / Email):**
   - Add a webhook trigger inside `POST /api/appointments` using standard HTTP requests.
   - Do NOT force proprietary SaaS SDKs; prefer generic REST webhook URLs configured via `.env`.
2. **Multi-Doctor Support:**
   - Add a `Doctor` model in `prisma/schema.prisma` and link `Appointment` with a `doctorId` foreign key.
   - Run `npx prisma db push` to synchronize.
3. **Prescription PDF Generator:**
   - Use browser `window.print()` or server-side `@react-pdf/renderer` inside a new route `/appointments/[id]/prescription`.
