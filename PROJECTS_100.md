# 🚀 OpenSourceHub: The 100 Self-Deployable Utility Projects Catalog

> **Manifesto & Vision:**  
> *"Code is not a MOAT anymore. Everyone is building tools for everyone. Software should be free, accessible, and self-sovereign for every occupation on Earth. OpenSourceHub is the launchpad: single `git pull`, single `docker compose up`, pinned container versions, zero hidden SaaS vendor lock-in, ready to fork and customize."*

---

## 🏛️ Architectural Blueprint for Every Project

Every project in this repository follows an identical, reproducible standard:

```text
projects/<project-id>/
├── docker-compose.yml       # Pinned versions, local persistence, commented prod SSL/Domain block
├── .env.example             # Documented defaults (ports, secret keys, db credentials)
├── README.md                # 60-second quickstart guide, architecture notes, production guide
└── src/ (or app/)           # Clean, unbloated, modern codebase (lightweight, easily AI-extensible)
```

### Universal Rules:
1. **Pinned Image Versions (Always Verified Latest Stable)**: Never use unpinned `:latest`. Always perform a web search before scaffolding to identify and pin the current utmost latest stable release (e.g., `node:22-alpine`, `postgres:16-alpine` / `postgres:17-alpine`, `python:3.12-slim`, `golang:1.24-alpine`, `caddy:2.9-alpine`, `redis:7.4-alpine`).
2. **Zero-Config Dev Defaults**: Running `docker compose up -d` immediately gives a functional UI without manual database migrations or API keys.
3. **Storage Strategy**: If the app stores files/media (images, PDFs, documents), use embedded SQLite/local volume or lightweight MinIO S3-compatible service.
4. **Production Ready**: Every `docker-compose.yml` includes a ready-to-uncomment Caddy or Nginx reverse proxy section with Let's Encrypt SSL and domain binding.

---

## 📋 Comprehensive Catalog: 100 Projects by Sector

---

### Category 1: Healthcare, Medicine & Wellness

#### 001. `001-doctor-appointment-portal`
- **Target Persona:** Solo General Physicians, Clinics, Dentists, Physiotherapists.
- **Problem Solved:** Overreliance on expensive appointment SaaS platforms; patients need a direct link to check real-time available time slots and book without calling receptionist.
- **Core Features:** Doctor calendar dashboard, slot duration configuration (15m, 30m), patient name/phone intake, email/WhatsApp confirmation template, daily appointment queue list.
- **Stack:** Node.js (Fastify/Express) + SQLite/PostgreSQL + Tailwind CSS.
- **Docker Services:** `app` (`node:20-alpine`), `db` (`postgres:16-alpine` or embedded SQLite).

#### 002. `002-dental-history-tracker`
- **Target Persona:** Independent Dentists and Orthodontists.
- **Problem Solved:** Tracking multi-visit tooth procedures, quadrant charts, and before/after dental X-rays without monolithic EHR software.
- **Core Features:** Interactive tooth chart selector (32 teeth), treatment history log per tooth, prescription generator, MinIO image upload for X-rays.
- **Stack:** Python (FastAPI) + SQLite + MinIO + Vanilla JS/Alpine.js.
- **Docker Services:** `api` (`python:3.11-slim`), `storage` (`minio/minio:RELEASE.2024-05-10T01-41-38Z`).

#### 003. `003-physio-rehab-planner`
- **Target Persona:** Physical Therapists, Chiropractors, Rehab Coaches.
- **Problem Solved:** Patients forget exercise routines given on paper sheets; therapists need a rapid way to send a private web link with assigned stretches and video GIFs.
- **Core Features:** Exercise library (reps, sets, video/GIF preview), patient prescription builder, private access code for patient mobile view, recovery milestone progress tracker.
- **Stack:** Go / Node.js + SQLite + HTMX.
- **Docker Services:** `web` (`golang:1.22-alpine` or `node:20-alpine`).

#### 004. `004-pharmacy-stock-refill`
- **Target Persona:** Neighborhood Independent Chemists & Pharmacies.
- **Problem Solved:** Stockouts of critical chronic medications and missed patient recurring refills.
- **Core Features:** Medicine inventory with batch numbers & expiry dates, minimum stock reorder alerts, recurring chronic patient refill reminders list, barcode search.
- **Stack:** Python (Flask/FastAPI) + PostgreSQL + Bootstrap/Tailwind.
- **Docker Services:** `app`, `db` (`postgres:16-alpine`).

#### 005. `005-vet-pet-scheduler`
- **Target Persona:** Veterinary Doctors, Pet Clinics, Animal Shelters.
- **Problem Solved:** Managing pet medical records, vaccine schedules (Rabies, DHPP), and appointment scheduling across varied species.
- **Core Features:** Pet profile (species, breed, microchip ID, weight tracker), vaccination due date calculator, owner notification queue, appointment booking.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 006. `006-mental-health-notes-locker`
- **Target Persona:** Psychologists, Therapists, Counselors.
- **Problem Solved:** Strict confidentiality needed for therapy session notes without storing on commercial cloud servers.
- **Core Features:** Client-side encrypted session notes, SOAP note templates, crisis contact quick view, booking scheduler with buffer time between sessions.
- **Stack:** Node.js / Python + SQLite with AES-256 encrypted fields.
- **Docker Services:** `app` (`node:20-alpine`).

#### 007. `007-community-blood-match`
- **Target Persona:** Local Community Volunteers, Red Cross Chapters, Rotary Clubs.
- **Problem Solved:** Emergency requests for rare blood groups in local townships without privacy leaks.
- **Core Features:** Donor registry (blood group, city/area, last donation date), emergency SOS broadcaster, automated eligibility calculation (90 days cooldown).
- **Stack:** Go + SQLite + Tailwind.
- **Docker Services:** `app` (`golang:1.22-alpine`).

#### 008. `008-optometrist-rx-portal`
- **Target Persona:** Eye Doctors, Optical Stores, Optometrists.
- **Problem Solved:** Paper prescription cards get lost by customers; optical shops need instant lookup by customer phone number.
- **Core Features:** Optical RX card (OD/OS sphere, cylinder, axis, add, pupillary distance), frame selection history, order ready SMS/email notifier.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 009. `009-caregiver-vitals-log`
- **Target Persona:** Home Nurses, Elder Caretakers, Family Caregivers.
- **Problem Solved:** Tracking daily vitals (BP, sugar, pulse, medication schedule) for elderly patients and sharing reports with attending doctors.
- **Core Features:** 1-tap vital entry on phone, medication tick-off checklist, abnormal value alert highlight, 30-day PDF export for doctor review.
- **Stack:** Python (FastAPI) + SQLite + Chart.js.
- **Docker Services:** `app` (`python:3.11-slim`).

#### 010. `010-dietitian-meal-planner`
- **Target Persona:** Clinical Nutritionists, Dietitians, Lifestyle Coaches.
- **Problem Solved:** Preparing customized 7-day meal plans with macro breakdowns and sending them digitally to clients.
- **Core Features:** Calorie and macro calculator (Carbs, Protein, Fats), weekly meal grid builder, recipe ingredient notes, client view link with water tracker.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

---

### Category 2: Food, Hospitality, Dining & Nightlife

#### 011. `011-digital-qr-menu-board`
- **Target Persona:** Small Cafes, Canteens, Dhabas, Food Trucks.
- **Problem Solved:** Physical menus get stained, reprinted frequently, and price changes are costly; owners need instant price updates and instant QR display.
- **Core Features:** Mobile-first customer menu with category filters and dish images, manager admin to toggle "Out of Stock" and update prices in 5 seconds, auto-generated printable table QR codes.
- **Stack:** Node.js + SQLite + Tailwind CSS.
- **Docker Services:** `app` (`node:20-alpine`).

#### 012. `012-food-truck-specials-broadcast`
- **Target Persona:** Food Truck Operators, Pop-up Food Stalls.
- **Problem Solved:** Changing locations daily and announcing daily limited batch specials without high social media ad spend.
- **Core Features:** "Where are we today" live map pin, today's limited batch counter (e.g. "Only 40 Tacos left"), customer SMS/email alert opt-in.
- **Stack:** Python (FastAPI) + SQLite + Leaflet.js.
- **Docker Services:** `app` (`python:3.11-slim`).

#### 013. `013-bakery-custom-cake-orders`
- **Target Persona:** Home Bakers, Artisan Bakeries, Pastry Chefs.
- **Problem Solved:** Miscommunication on custom cake orders (flavor, eggless, tier count, custom message, reference photo).
- **Core Features:** Visual order builder (cake size, flavor, frosting, topper text), reference photo uploader, pickup date/slot selector, deposit status tracker.
- **Stack:** Node.js + SQLite + MinIO.
- **Docker Services:** `app` (`node:20-alpine`), `storage` (`minio/minio:RELEASE.2024-05-10T01-41-38Z`).

#### 014. `014-restaurant-waitlist-queue`
- **Target Persona:** Busy Diners, Family Restaurants, Bistro Hosts.
- **Problem Solved:** Crowds clustering at host podiums during rush hour.
- **Core Features:** Host adds walk-in (party size, phone), public TV waitlist board (e.g., "Party #14, Table ready"), SMS/webhook chime when table is assigned.
- **Stack:** Node.js + WebSocket + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 015. `015-canteen-token-system`
- **Target Persona:** Office Canteens, College Messes, Hospital Cafeterias.
- **Problem Solved:** Cash handling chaos and order counter bottlenecks during lunch hours.
- **Core Features:** Daily meal token generator, cashier counter punch-in, large live "Now Serving Token #104" screen display, daily meal count reconciliation.
- **Stack:** Go + SQLite + HTML5 WebSockets.
- **Docker Services:** `app` (`golang:1.22-alpine`).

#### 016. `016-kitchen-order-ticket-kot`
- **Target Persona:** Cloud Kitchens, Ghost Kitchens, Small Eateries.
- **Problem Solved:** Lost paper slips between counter and kitchen chefs.
- **Core Features:** Real-time digital Kitchen Display Screen (KDS), color-coded order urgency timers (Green -> Yellow -> Red), 1-tap "Order Ready" buzzer.
- **Stack:** Node.js + WebSocket + Alpine.js.
- **Docker Services:** `app` (`node:20-alpine`).

#### 017. `017-homestay-direct-booking`
- **Target Persona:** Bed & Breakfast (B&B) Owners, Homestay Hosts, Farmhouses.
- **Problem Solved:** 15-20% OTA commission fees (Airbnb/Booking.com) on repeat local guests.
- **Core Features:** Room availability calendar, direct booking inquiry form, guest ID upload, iCal calendar export/import sync with OTAs to avoid double booking.
- **Stack:** Python (Django or FastAPI) + SQLite.
- **Docker Services:** `app` (`python:3.11-slim`).

#### 018. `018-coffee-shop-stamp-card`
- **Target Persona:** Independent Coffee Shops, Juice Bars, Bubble Tea Shops.
- **Problem Solved:** Customers lose physical paper punch cards; building a native mobile app is too expensive.
- **Core Features:** Customer enters phone or scans merchant QR to collect stamps (e.g., "Buy 9, 10th free"), cashier PIN validation screen, fraud prevention limits.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 019. `019-catering-ingredient-estimator`
- **Target Persona:** Event Caterers, Wedding Chefs, Banquet Halls.
- **Problem Solved:** Inaccurate food cost estimation leading to food waste or stockouts at 500+ person events.
- **Core Features:** Headcount to raw ingredient calculator (rice, meat, vegetables, spices), menu cost estimator, supplier shopping list generator.
- **Stack:** Python (Flask) + SQLite.
- **Docker Services:** `app` (`python:3.11-slim`).

#### 020. `020-bar-taplist-happyhour-screen`
- **Target Persona:** Craft Breweries, Sports Bars, Pubs.
- **Problem Solved:** Manually editing chalkboard menus when beer kegs run out or happy hour pricing starts.
- **Core Features:** Digital tap list (ABV, IBU, brewery, style), automatic Happy Hour schedule toggle, full-screen TV HDMI display mode, keg remaining percentage meter.
- **Stack:** Node.js + Tailwind CSS.
- **Docker Services:** `app` (`node:20-alpine`).

---

### Category 3: Education, Tuition & Coaching

#### 021. `021-tuition-student-fee-register`
- **Target Persona:** Private Tuition Teachers, Small Coaching Classes, After-School Tutors.
- **Problem Solved:** Tracking student monthly fees, unpaid dues, and attendance in messy paper notebooks.
- **Core Features:** Batch/Course creation, student roster with parent phone numbers, monthly fee payment ledger with receipt PDF generation, unpaid fee reminder list.
- **Stack:** Node.js + SQLite + PDFKit.
- **Docker Services:** `app` (`node:20-alpine`).

#### 022. `022-solo-tutor-homework-box`
- **Target Persona:** Independent Tutors, Academic Coaches.
- **Problem Solved:** Homework submissions scattered across WhatsApp messages and random emails.
- **Core Features:** Dedicated student upload portal with submission deadline timer, teacher annotation/grading interface, return feedback with grade sheet.
- **Stack:** Python (FastAPI) + SQLite + MinIO.
- **Docker Services:** `app` (`python:3.11-slim`), `storage` (`minio/minio:RELEASE.2024-05-10T01-41-38Z`).

#### 023. `023-driving-school-scheduler`
- **Target Persona:** Driving Instructors, Small Driving Schools.
- **Problem Solved:** Scheduling vehicle slots between multiple learners and tracking RTO test readiness.
- **Core Features:** Instructor/car slot calendar, learner driving skill checklist (parallel parking, highway, hill start), RTO mock test scoring sheet.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 024. `024-music-teacher-practice-log`
- **Target Persona:** Piano, Guitar, Violin & Vocal Teachers.
- **Problem Solved:** Students not practicing between weekly lessons; teachers lack visibility into practice frequency.
- **Core Features:** Practice timer with audio recording upload, sheet music PDF viewer, teacher weekly assignment notebook, metronome & practice streak tracker.
- **Stack:** Node.js + SQLite + MinIO.
- **Docker Services:** `app` (`node:20-alpine`), `storage` (`minio/minio:RELEASE.2024-05-10T01-41-38Z`).

#### 025. `025-dojo-belt-academy-tracker`
- **Target Persona:** Karate, Taekwondo, BJJ, Boxing Academies.
- **Problem Solved:** Managing belt rank advancement requirements, sparring logs, and class attendance credits.
- **Core Features:** Belt hierarchy configuration (White to Black), attendance requirements calculator for next grading exam, tournament sparring record log.
- **Stack:** Go + SQLite.
- **Docker Services:** `app` (`golang:1.22-alpine`).

#### 026. `026-daycare-daily-activity-log`
- **Target Persona:** Daycare Centers, Creches, Preschool Caretakers.
- **Problem Solved:** Anxious parents constantly calling about naps, meals, diaper changes, and mood.
- **Core Features:** Quick timeline logging (Meals, Nap time, Mood, Potty, Photos), parent private PIN link to see today's timeline, emergency parent contact card.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 027. `027-student-spaced-repetition-vault`
- **Target Persona:** High School & College Students, Competitive Exam Aspirants (UPSC, MCAT, GRE).
- **Problem Solved:** Forgetting facts before exams; proprietary apps restrict card limits or charge high subscription fees.
- **Core Features:** Markdown flashcards with LaTeX math support, SM-2 spaced repetition algorithm, daily review queue, CSV import/export.
- **Stack:** Python (FastAPI) + SQLite + KaTeX.
- **Docker Services:** `app` (`python:3.11-slim`).

#### 028. `028-grad-research-citation-vault`
- **Target Persona:** PhD Students, Academic Researchers, Lab Assistants.
- **Problem Solved:** Disorganized PDF papers, missing BibTeX citations, and disconnected research notes.
- **Core Features:** PDF paper storage with text search, BibTeX citation generator, literature review tagging, key findings summary cards.
- **Stack:** Python + SQLite + MinIO.
- **Docker Services:** `app` (`python:3.11-slim`), `storage` (`minio/minio:RELEASE.2024-05-10T01-41-38Z`).

#### 029. `029-language-partner-matcher`
- **Target Persona:** Community Language Clubs, ESL Organizers.
- **Problem Solved:** Pairing native and target language speakers for 1-on-1 practice conversations.
- **Core Features:** Native/Target language profile matrix, weekly conversation topic generator, 30-minute structured exchange timer with prompts.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 030. `030-stem-lab-equipment-checkout`
- **Target Persona:** School Science Lab Assistants, Makerspaces.
- **Problem Solved:** Microscopes, calipers, Arduino kits, and chemicals getting lost or broken without accountability.
- **Core Features:** Barcode equipment scan, borrower student ID logging, safety checklist sign-off, damage report tracker.
- **Stack:** Go + SQLite.
- **Docker Services:** `app` (`golang:1.22-alpine`).

---

### Category 4: Professional, Legal, Financial & Consulting Services

#### 031. `031-lawyer-case-docket`
- **Target Persona:** Solo Advocates, Independent Lawyers, Legal Paralegals.
- **Problem Solved:** Missing court hearing dates across different tribunals and losing track of case proceedings.
- **Core Features:** Court case docket (Case number, Court hall, Opposing counsel, Client name), hearing timeline log with adjournments and orders, upcoming court date calendar.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 032. `032-ca-tax-document-vault`
- **Target Persona:** Chartered Accountants (CAs), CPAs, Tax Preparers.
- **Problem Solved:** Clients emailing tax forms (W-2, Form 16, Bank statements) through insecure email threads.
- **Core Features:** Branded client upload portal, tax filing checklist by year, secure encrypted document storage, missing document reminder ping.
- **Stack:** Python (FastAPI) + PostgreSQL + MinIO.
- **Docker Services:** `app` (`python:3.11-slim`), `db` (`postgres:16-alpine`), `storage` (`minio/minio:RELEASE.2024-05-10T01-41-38Z`).

#### 033. `033-architect-project-moodboard`
- **Target Persona:** Architects, Interior Designers, Landscape Planners.
- **Problem Solved:** Endless revision loops and client disputes over design approvals and material samples.
- **Core Features:** Visual milestone board with high-res photo gallery, 1-click client "Approve Design" timestamped sign-off, material specification list.
- **Stack:** Node.js + SQLite + MinIO.
- **Docker Services:** `app` (`node:20-alpine`), `storage` (`minio/minio:RELEASE.2024-05-10T01-41-38Z`).

#### 034. `034-notary-public-journal`
- **Target Persona:** Notary Publics, Legal Stamp Vendors.
- **Problem Solved:** Maintaining mandated sequential notarial registers with client identity verification.
- **Core Features:** Sequential notarization serial number generator, party ID verification record, thumbprint/signature photo attachment, audit log.
- **Stack:** Go + SQLite.
- **Docker Services:** `app` (`golang:1.22-alpine`).

#### 035. `035-consultant-deliverables-hub`
- **Target Persona:** Management Consultants, Fractional Executives.
- **Problem Solved:** Clients claiming ignorance of project milestones, scope drift, and deliverables status.
- **Core Features:** Scope of work (SOW) milestone tracker, client executive summary dashboard, deliverable file locker, progress percentage indicators.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 036. `036-trademark-patent-renewals`
- **Target Persona:** IP Attorneys, Trademark Agents, Patent Brokers.
- **Problem Solved:** Missing 5-year or 10-year renewal deadlines for client intellectual property.
- **Core Features:** Application number tracker, statutory renewal deadline calculator, automated notification dispatch, status log (Filed, Examined, Opposed, Registered).
- **Stack:** Python (FastAPI) + SQLite.
- **Docker Services:** `app` (`python:3.11-slim`).

#### 037. `037-private-investigator-casebook`
- **Target Persona:** Private Investigators, Corporate Fraud Auditors.
- **Problem Solved:** Strict chain-of-custody needed for evidence timestamps, surveillance logs, and subject profiles.
- **Core Features:** Subject dossiers, timestamped observation timeline with GPS coordinates, media locker with SHA-256 integrity hash verification.
- **Stack:** Node.js + SQLite + MinIO.
- **Docker Services:** `app` (`node:20-alpine`), `storage` (`minio/minio:RELEASE.2024-05-10T01-41-38Z`).

#### 038. `038-translation-word-delivery`
- **Target Persona:** Freelance Translators, Subtitlers, Localizers.
- **Problem Solved:** Quoting translation jobs accurately based on source word count and managing multi-language deliverables.
- **Core Features:** Word count and character analyzer for uploaded docs, per-word rate calculator, bilingual side-by-side translation delivery format.
- **Stack:** Python (FastAPI) + SQLite.
- **Docker Services:** `app` (`python:3.11-slim`).

#### 039. `039-insurance-policy-tracker`
- **Target Persona:** Independent Insurance Agents, Brokers.
- **Problem Solved:** Tracking policy renewal dates across health, vehicle, and life policies for hundreds of clients.
- **Core Features:** Client policy matrix, annual premium due date alerts, claim history logger, policy document storage.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 040. `040-self-hosted-doc-signature`
- **Target Persona:** Small Business Owners, Freelancers, Consultants.
- **Problem Solved:** Paying \$25/month for DocuSign just to sign simple NDAs, proposals, and service contracts.
- **Core Features:** Upload PDF, place signature and date boxes, email signing link to counterparty, audit trail with IP address and timestamp certificate.
- **Stack:** Node.js + SQLite + PDF-lib.
- **Docker Services:** `app` (`node:20-alpine`).

---

### Category 5: Human Resources, Attendance, Timesheets & Internal Ops

#### 041. `041-minimalist-employee-attendance`
- **Target Persona:** Small Companies (5–50 employees), Workshops, Retail Shops.
- **Problem Solved:** Big HRMS tools (Workday, BambooHR) are bloated and costly; managers just need a clean attendance check-in/out board with customizable employee fields.
- **Core Features:** Admin dashboard to add/deactivate employees with customizable metadata (department, role, joining date), PIN or 1-click check-in/out, daily attendance status overview (Present, Late, Absent, Half-day), monthly CSV export.
- **Stack:** Node.js + SQLite + Tailwind CSS.
- **Docker Services:** `app` (`node:20-alpine`).

#### 042. `042-monthly-employee-timesheets`
- **Target Persona:** Agencies, Consultancies, Freelance Teams, Law Firms.
- **Problem Solved:** Tracking daily billable hours per project/client and generating clean monthly payroll/billing summaries.
- **Core Features:** Weekly/monthly grid view where employees log hours worked per client/project, manager approval workflow, monthly summary breakdown by employee and project, one-click PDF/CSV payroll export.
- **Stack:** Python (FastAPI) + SQLite + Tailwind + ReportLab.
- **Docker Services:** `app` (`python:3.11-slim`).

#### 043. `043-shift-roster-generator`
- **Target Persona:** Retail Stores, Hospital Nursing Staff, Security Guard Agencies.
- **Problem Solved:** Chaotic weekly shift scheduling, shift clash conflicts, and last-minute swap requests.
- **Core Features:** Visual drag-and-drop shift calendar (Morning, Evening, Night), conflict detection (double booking, overtime rules), mobile-friendly view for staff.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 044. `044-leave-vacation-planner`
- **Target Persona:** Small Startups, Non-Profits, Local Businesses.
- **Problem Solved:** Tracking paid time off (PTO), sick leave, and maternity leave without back-and-forth email trails.
- **Core Features:** Employee leave balance tally (Earned, Casual, Medical), 1-click request submission, manager approve/reject dashboard, team holiday calendar view.
- **Stack:** Go + SQLite.
- **Docker Services:** `app` (`golang:1.22-alpine`).

#### 045. `045-simple-candidate-ats`
- **Target Persona:** Small Business Hiring Managers, Startup Founders.
- **Problem Solved:** Hundreds of resumes buried in unread email inboxes.
- **Core Features:** Public job posting page, candidate application form with PDF resume upload, Kanban pipeline (Applied -> Screened -> Interview -> Offered -> Rejected), interview scorecard.
- **Stack:** Node.js + SQLite + MinIO.
- **Docker Services:** `app` (`node:20-alpine`), `storage` (`minio/minio:RELEASE.2024-05-10T01-41-38Z`).

#### 046. `046-peer-kudos-shoutout-board`
- **Target Persona:** Remote & Hybrid Work Teams.
- **Problem Solved:** Lack of employee recognition and appreciation in distributed teams.
- **Core Features:** Virtual appreciation cards with emojis and values (Teamwork, Speed, Innovation), public office shoutout feed, monthly most-appreciated leaderboard.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 047. `047-it-asset-inventory-tracker`
- **Target Persona:** Office Admins, Internal IT Managers.
- **Problem Solved:** Laptops, monitors, SIM cards, and access badges disappearing when employees depart.
- **Core Features:** Hardware inventory (Serial number, Model, Purchase date, Warranty), employee assignment history, return check-off on exit.
- **Stack:** Python (Flask) + SQLite.
- **Docker Services:** `app` (`python:3.11-slim`).

#### 048. `048-async-daily-standup-board`
- **Target Persona:** Software Teams, Distributed Project Teams.
- **Problem Solved:** 30-minute daily zoom meetings that disrupt deep focus work.
- **Core Features:** Three prompt check-ins: "What did you do yesterday?", "What will you do today?", "Any blockers?", team aggregated view, Slack/Discord webhook ping.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 049. `049-anonymous-feedback-box`
- **Target Persona:** HR Leaders, School Principals, Factory Managers.
- **Problem Solved:** Employees afraid of speaking up about safety, workplace toxicity, or management feedback.
- **Core Features:** Zero-tracking anonymous submission form (no cookies, no IP logging), categorized topic tagging, admin public or private reply thread.
- **Stack:** Go + SQLite.
- **Docker Services:** `app` (`golang:1.22-alpine`).

#### 050. `050-employee-onboarding-checklist`
- **Target Persona:** HR Coordinators, Operations Leads.
- **Problem Solved:** New hires feeling lost during their first week; missing tax, NDA, and tool setup tasks.
- **Core Features:** Step-by-step onboarding roadmap (Day 1, Week 1, Month 1), task progress bar, company document download links, manager verification check.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

---

### Category 6: Trades, Field Services, Maintenance & Repair

#### 051. `051-auto-repair-jobcard`
- **Target Persona:** Independent Car Mechanics, Auto Garages, Bike Workshops.
- **Problem Solved:** Disorganized physical repair slips; customer disputes about parts replaced or authorized labor.
- **Core Features:** Vehicle intake card (License plate, Make/Model, Odometer, Fuel level), symptom description, parts & labor cost breakdown, customer estimate approval.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 052. `052-electrician-plumber-quickquote`
- **Target Persona:** Plumbers, Electricians, Handymen, HVAC Technicians.
- **Problem Solved:** Generating fast, professional PDF quotes and invoices on mobile right at the client's doorstep.
- **Core Features:** Quick line-item selector (Hourly rate, Pipe fittings, Wire rolls), on-the-spot client signature, instant PDF invoice generation with payment QR code.
- **Stack:** Python (FastAPI) + SQLite + WeasyPrint/PDFKit.
- **Docker Services:** `app` (`python:3.11-slim`).

#### 053. `053-hvac-maintenance-dispatch`
- **Target Persona:** Air Conditioning Technicians, Commercial HVAC Contractors.
- **Problem Solved:** Forgetting seasonal AC servicing schedules and refrigerant gas pressure logs.
- **Core Features:** Client building unit database, seasonal filter and coil cleaning schedule, technician checklist (freon pressure, amp draw, filter status).
- **Stack:** Go + SQLite.
- **Docker Services:** `app` (`golang:1.22-alpine`).

#### 054. `054-field-service-photo-proof`
- **Target Persona:** Roofers, Painters, Landscapers, Cleaning Crews.
- **Problem Solved:** Clients claiming work was incomplete or damaged prior to service.
- **Core Features:** Job creation with Before and After photo side-by-side uploader, GPS and timestamp verification stamp, instant client shareable link.
- **Stack:** Node.js + SQLite + MinIO.
- **Docker Services:** `app` (`node:20-alpine`), `storage` (`minio/minio:RELEASE.2024-05-10T01-41-38Z`).

#### 055. `055-tailor-garment-measurements`
- **Target Persona:** Custom Tailors, Bespoke Suit Makers, Bridal Boutiques.
- **Problem Solved:** Paper measurement books getting damaged or misplaced; altered measurements lost across fittings.
- **Core Features:** Garment measurement profile (Chest, Waist, Inseam, Sleeve, Collar, Shoulder), design sketch upload, fitting trial schedule, delivery date tracker.
- **Stack:** Node.js + SQLite + MinIO.
- **Docker Services:** `app` (`node:20-alpine`), `storage` (`minio/minio:RELEASE.2024-05-10T01-41-38Z`).

#### 056. `056-drycleaner-tag-pickup`
- **Target Persona:** Dry Cleaners, Laundry Services, Shoe Restoration Shops.
- **Problem Solved:** Lost garments, mixed-up suits, and angry customers waiting at counter.
- **Core Features:** Garment barcode tagging, stain & fabric defect notation at intake, stage tracker (Washing -> Pressing -> Ready -> Picked up), customer SMS ready ping.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 057. `057-locksmith-emergency-callout`
- **Target Persona:** Emergency Locksmiths, Key Duplication Centers.
- **Problem Solved:** Tracking emergency lockouts, key codes, and dispatch response times.
- **Core Features:** Emergency service dispatch ticket, key bitting code storage, proof of home/car ownership verification file, invoice logger.
- **Stack:** Python (FastAPI) + SQLite.
- **Docker Services:** `app` (`python:3.11-slim`).

#### 058. `058-pest-control-service-log`
- **Target Persona:** Pest Exterminators, Fumigation Companies.
- **Problem Solved:** Compliance tracking of chemical applications and recurring pest warranty inspections.
- **Core Features:** Property inspection diagram (bait station locations), chemicals applied with dilution ratios, next warranty inspection reminder.
- **Stack:** Go + SQLite.
- **Docker Services:** `app` (`golang:1.22-alpine`).

#### 059. `059-appliance-repair-parts-log`
- **Target Persona:** Refrigerator, Washing Machine, Microwave Repair Technicians.
- **Problem Solved:** Tracking ordered spare parts for pending customer appliances waiting in workshop.
- **Core Features:** Appliance model number lookup, part order status (Pending, Arrived, Installed), warranty guarantee card generation.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 060. `060-pool-maintenance-log`
- **Target Persona:** Swimming Pool Cleaners, Resort Maintenance Teams.
- **Problem Solved:** Inconsistent chemical balance (Chlorine, pH, Alkalinity) causing green pool water or skin irritation.
- **Core Features:** Test strip chemical reading input, chemical dosage recommendation calculator, service visit completion confirmation email to property owner.
- **Stack:** Python (Flask) + SQLite.
- **Docker Services:** `app` (`python:3.11-slim`).

---

### Category 7: Retail, Commerce, Inventory & Rental

#### 061. `061-local-boutique-barcode-pos`
- **Target Persona:** Local Clothing Boutiques, Gift Shops, Neighborhood Stationery.
- **Problem Solved:** Traditional POS systems charge high monthly subscriptions and lock data into proprietary terminals.
- **Core Features:** Barcode scanner compatibility, product catalog with sizes/variants, cash & digital payment register, receipt printer support.
- **Stack:** Node.js + SQLite + HTML5 Web APIs.
- **Docker Services:** `app` (`node:20-alpine`).

#### 062. `062-equipment-rental-ledger`
- **Target Persona:** Power Tool Rentals, Scaffolding Providers, AV Equipment Rentals.
- **Problem Solved:** Missing rental gear, unreturned items, and uncollected security deposits.
- **Core Features:** Equipment availability calendar, rental contract duration, security deposit tracking, overdue item late-fee calculator.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 063. `063-bookshop-lending-library`
- **Target Persona:** Community Libraries, Second-hand Bookshops, Book Cafes.
- **Problem Solved:** Tracking borrowed books and late returns without complicated library management software.
- **Core Features:** ISBN barcode lookup, member borrow history, due date calculation, overdue fine calculator, wishlist book requests.
- **Stack:** Python (FastAPI) + SQLite.
- **Docker Services:** `app` (`python:3.11-slim`).

#### 064. `064-supplier-price-comparison`
- **Target Persona:** Wholesalers, Retail Store Purchasing Managers.
- **Problem Solved:** Vendors changing raw product prices frequently, leading to suboptimal margin purchasing.
- **Core Features:** Item catalog linked to multiple suppliers, unit price history chart, best-price supplier recommendation per SKU.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 065. `065-perishable-expiry-tracker`
- **Target Persona:** Grocery Stores, Supermarkets, Dairy Shops.
- **Problem Solved:** Perishable food items expiring unnoticed on shelves, resulting in total revenue loss.
- **Core Features:** Batch expiry date logging, 7-day and 3-day expiry warning dashboard, quick discount tag generator ("30% off expiring soon").
- **Stack:** Go + SQLite.
- **Docker Services:** `app` (`golang:1.22-alpine`).

#### 066. `066-consignment-store-payouts`
- **Target Persona:** Consignment Boutiques, Pre-owned Luxury Stores, Thrift Shops.
- **Problem Solved:** Calculating split payouts (e.g. 60/40) for hundreds of consignors who supplied items.
- **Core Features:** Consignor vendor account, inventory intake with agreed split percentage, sale confirmation trigger, pending payout ledger.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 067. `067-thrift-item-reserve-bot`
- **Target Persona:** Vintage Sellers, Thrift Curators, Instagram Sellers.
- **Problem Solved:** Multiple buyers claiming the same one-of-a-kind vintage piece simultaneously.
- **Core Features:** One-off item listing with single inventory count, 15-minute checkout hold timer, payment proof screenshot upload.
- **Stack:** Python (FastAPI) + SQLite + MinIO.
- **Docker Services:** `app` (`python:3.11-slim`), `storage` (`minio/minio:RELEASE.2024-05-10T01-41-38Z`).

#### 068. `068-flea-market-shared-till`
- **Target Persona:** Flea Market Vendors Sharing a Single Stall/Booth.
- **Problem Solved:** At end of day, figuring out whose goods sold and how to divide cash and digital payments.
- **Core Features:** Multi-seller tag prefix (e.g. Seller A: #A102, Seller B: #B50), live sale recording, end-of-day revenue split sheet.
- **Stack:** Go + SQLite.
- **Docker Services:** `app` (`golang:1.22-alpine`).

#### 069. `069-hardware-fastener-locator`
- **Target Persona:** Hardware Stores, Workshop Technicians, Hobbyist Garages.
- **Problem Solved:** Finding the exact bin location among thousands of screw, nut, bolt, and washer variants.
- **Core Features:** Visual bin/rack location finder (Row 3, Bin B-12), thread size and pitch filter, low stock reorder flag.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 070. `070-florist-bouquet-inventory`
- **Target Persona:** Independent Florists, Wedding Flower Stylists.
- **Problem Solved:** High perishability of fresh flower stems; needing to cost out complex bouquet recipes.
- **Core Features:** Stem cost and shelf-life tracker, bouquet recipe builder with markup margin, seasonal flower arrival schedule.
- **Stack:** Python (FastAPI) + SQLite.
- **Docker Services:** `app` (`python:3.11-slim`).

---

### Category 8: Personal Services, Fitness, Beauty & Pets

#### 071. `071-salon-barber-chair-booking`
- **Target Persona:** Hair Salons, Barber Shops, Beauty Parlors.
- **Problem Solved:** Phone call interruptions during haircuts and calculating stylist commission splits.
- **Core Features:** Stylist chair selection, service menu (Haircut, Beard trim, Color, Facial), appointment booking calendar, daily stylist commission calculation.
- **Stack:** Node.js + SQLite + Tailwind.
- **Docker Services:** `app` (`node:20-alpine`).

#### 072. `072-gym-member-pass-qr`
- **Target Persona:** Independent Gyms, Crossfit Boxes, Fitness Centers.
- **Problem Solved:** Members sharing passes or continuing to work out after their monthly subscription has expired.
- **Core Features:** Member profile with expiry date, mobile digital QR pass, tablet/camera check-in scanner (Green = Active, Red = Expired), expiry renewal alert.
- **Stack:** Node.js + SQLite + HTML5 QR Scanner.
- **Docker Services:** `app` (`node:20-alpine`).

#### 073. `073-personal-trainer-workout-log`
- **Target Persona:** Gym Personal Trainers, Online Fitness Coaches.
- **Problem Solved:** Keeping client workout logs across random WhatsApp chats and Google Sheets.
- **Core Features:** Client workout routine builder (Exercise, Weight, Sets, Reps, RPE), progressive overload line chart, body composition photo progress gallery.
- **Stack:** Python (FastAPI) + SQLite + MinIO + Chart.js.
- **Docker Services:** `app` (`python:3.11-slim`), `storage` (`minio/minio:RELEASE.2024-05-10T01-41-38Z`).

#### 074. `074-yoga-studio-mat-reserver`
- **Target Persona:** Yoga Instructors, Pilates Studios, Meditation Spaces.
- **Problem Solved:** Overcrowded studios where students fight for front-row mat spaces.
- **Core Features:** Visual studio mat layout floor plan, 1-click mat reservation, class pack credit deduction (e.g. 10-class pass), waitlist bump system.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 075. `075-tattoo-consent-aftercare`
- **Target Persona:** Tattoo Artists, Piercing Studios.
- **Problem Solved:** Mandatory legal liability consent waivers on paper and clients forgetting aftercare instructions.
- **Core Features:** Digital legal waiver form with touchscreen signature, health disclosures checklist, automated email with care routine.
- **Stack:** Go + SQLite.
- **Docker Services:** `app` (`golang:1.22-alpine`).

#### 076. `076-pet-grooming-intake-board`
- **Target Persona:** Dog Groomers, Pet Spas.
- **Problem Solved:** Pet skin allergies, bite history, or coat matting issues not communicated to the bather.
- **Core Features:** Pet coat & temperament intake notes, groomer service selection (Bath, Haircut, Nail grind, Deshedding), kennel holding status board.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 077. `077-spa-treatment-room-matrix`
- **Target Persona:** Day Spas, Massage Therapy Centers.
- **Problem Solved:** Booking massage therapists when all massage rooms or sauna booths are occupied.
- **Core Features:** 2D allocation grid (Therapist x Treatment Room), equipment constraint checks (Hot stone heater, Hydro bath), appointment confirmation.
- **Stack:** Python (FastAPI) + SQLite.
- **Docker Services:** `app` (`python:3.11-slim`).

#### 078. `078-nail-art-design-slot-booker`
- **Target Persona:** Nail Technicians, Manicurists.
- **Problem Solved:** Clients booking simple manicure slots when they actually want 2 hours of intricate hand-painted nail art.
- **Core Features:** Visual nail design catalog with time and price estimates, client reference upload, accurate slot duration booking.
- **Stack:** Node.js + SQLite + MinIO.
- **Docker Services:** `app` (`node:20-alpine`), `storage` (`minio/minio:RELEASE.2024-05-10T01-41-38Z`).

#### 079. `079-martial-arts-tournament-bracket`
- **Target Persona:** Martial Arts Instructors, Wrestling Coaches.
- **Problem Solved:** Drawing messy handwritten single-elimination tournament trees on whiteboards.
- **Core Features:** Automatic single and double-elimination bracket generator, weight category grouping, live match scorekeeper screen.
- **Stack:** Node.js + Tailwind + Canvas.
- **Docker Services:** `app` (`node:20-alpine`).

#### 080. `080-dog-walking-route-pupdate`
- **Target Persona:** Dog Walkers, Pet Sitters.
- **Problem Solved:** Pet owners want visual reassurance that their dog was walked and did their business.
- **Core Features:** Walk start/stop timer, route note logger, potty icon tags (Pee, Poop, Water), post-walk photo report card link for owner.
- **Stack:** Node.js + SQLite + MinIO.
- **Docker Services:** `app` (`node:20-alpine`), `storage` (`minio/minio:RELEASE.2024-05-10T01-41-38Z`).

---

### Category 9: Real Estate, Housing & Property Management

#### 081. `081-pg-hostel-mess-manager`
- **Target Persona:** Paying Guest (PG) Owners, Student Hostel Wardens.
- **Problem Solved:** Tracking shared room bed vacancies, monthly rent dues, and communal mess meal charges.
- **Core Features:** Room & bed allocation matrix (e.g. Room 204, Bed B), tenant ID proof storage, monthly rent receipt generation, mess meal opt-in counter.
- **Stack:** Node.js + SQLite + PDFKit.
- **Docker Services:** `app` (`node:20-alpine`).

#### 082. `082-landlord-unit-rent-tracker`
- **Target Persona:** Independent Landlords managing 2 to 20 rental properties.
- **Problem Solved:** Commercial landlord software charges per-unit subscriptions; spreadsheets lack receipt automation and maintenance issue logs.
- **Core Features:** Property and tenant ledger, lease agreement expiry alerts, tenant maintenance request ticket tracker, monthly income/expense summary.
- **Stack:** Python (FastAPI) + SQLite.
- **Docker Services:** `app` (`python:3.11-slim`).

#### 083. `083-realtor-single-property-showcase`
- **Target Persona:** Independent Real Estate Agents, Property Sellers.
- **Problem Solved:** Property listings getting lost in crowded portals; agents need a standalone high-impact showcase page to capture direct buyer leads.
- **Core Features:** High-res photo gallery with floor plan layout, property specs (BHK, sqft, price, HOA), interactive mortgage payment calculator, direct WhatsApp inquiry button.
- **Stack:** Node.js + Tailwind CSS.
- **Docker Services:** `app` (`node:20-alpine`).

#### 084. `084-coworking-hotdesk-room-booker`
- **Target Persona:** Boutique Co-working Spaces, Shared Office Studios.
- **Problem Solved:** Conference room squabbles and unmonitored hot desk day-pass usage.
- **Core Features:** Meeting room hourly reservation calendar, hot desk daily pass check-in, wifi credential display upon booking.
- **Stack:** Go + SQLite.
- **Docker Services:** `app` (`golang:1.22-alpine`).

#### 085. `085-apartment-visitor-parcel-log`
- **Target Persona:** Residential Society Gate Guards, Apartment Committees.
- **Problem Solved:** Paper gate visitor registers with illegible phone numbers and lost courier deliveries.
- **Core Features:** Tablet guard interface for visitor entry (Name, Flat #, Purpose, Photo), delivery parcel holding notification to resident flat.
- **Stack:** Node.js + SQLite.
- **Docker Services:** `app` (`node:20-alpine`).

#### 086. `086-self-storage-locker-access`
- **Target Persona:** Self-Storage Operators, Warehouse Locker Rentals.
- **Problem Solved:** Tracking unit occupancy, overdue locks, and customer gate access credentials.
- **Core Features:** Visual locker grid (Occupied, Available, Overdue), access code assignment, payment due lockdown notice.
- **Stack:** Python (FastAPI) + SQLite.
- **Docker Services:** `app` (`python:3.11-slim`).

#### 087. `087-vacation-rental-turnover-checklist`
- **Target Persona:** Airbnb Property Managers, Short-term Rental Cleaning Crews.
- **Problem Solved:** Cleaners forgetting to restock essentials or report guest damages before next check-in.
- **Core Features:** Room-by-room turnover inspection checklist (Linens changed, toiletries restocked, smoke alarm test), damage photo upload.
- **Stack:** Node.js + SQLite + MinIO.
- **Docker Services:** `app` (`node:20-alpine`), `storage` (`minio/minio:RELEASE.2024-05-10T01-41-38Z`).

#### 088. `088-tenant-move-condition-log`
- **Target Persona:** Tenants and Landlords during lease move-in/move-out.
- **Problem Solved:** Unfair deductions from security deposits due to pre-existing scratches, scuffs, and water stains.
- **Core Features:** Room-by-room condition checklist with dated photos, mutually signable inspection report, PDF export for lease attachment.
- **Stack:** Node.js + SQLite + MinIO.
- **Docker Services:** `app` (`node:20-alpine`), `storage` (`minio/minio:RELEASE.2024-05-10T01-41-38Z`).

---

### Category 10: Data Sovereignty, Personal Cloud & Everyday Utilities

#### 089. `089-private-cloud-storage-vault`
- **Target Persona:** Privacy-Conscious Individuals, Small Teams wanting a Google Drive / Dropbox alternative.
- **Problem Solved:** Commercial cloud drives scan user files, train AI models on private data, or impose monthly storage fees.
- **Core Features:** Beautiful, fast web UI for uploading, organizing folders, file preview (images, PDF, video, code), secure shareable download links with password/expiration, powered by MinIO S3 backend.
- **Stack:** Node.js + SQLite + MinIO.
- **Docker Services:** `app` (`node:20-alpine`), `storage` (`minio/minio:RELEASE.2024-05-10T01-41-38Z`).

#### 090. `090-encrypted-markdown-journal`
- **Target Persona:** Writers, Thinkers, Executives, Daily Reflectors.
- **Problem Solved:** Private thoughts exposed on note-taking SaaS platforms; need local, client-side encrypted storage.
- **Core Features:** Minimal distraction-free Markdown editor, AES-GCM client-side encryption, calendar heat map of journaling habits, tag filtering, offline-first.
- **Stack:** Node.js + SQLite + WebCrypto API.
- **Docker Services:** `app` (`node:20-alpine`).

#### 091. `091-selfhosted-bookmark-reader`
- **Target Persona:** Researchers, Techies, Avid Web Readers.
- **Problem Solved:** Bookmarks rot when websites shut down; Pocket / Instapaper lock full-text search behind paywalls.
- **Core Features:** Browser extension / 1-click URL bookmarking, offline readability view extraction, tag organization, full-text search across saved articles.
- **Stack:** Python (FastAPI) + SQLite + Readability.js.
- **Docker Services:** `app` (`python:3.11-slim`).

#### 092. `092-networth-debt-snowball-tracker`
- **Target Persona:** Everyday Individuals, Families planning Financial Independence.
- **Problem Solved:** Mint shut down, and bank aggregators sell customer financial spending data to advertisers.
- **Core Features:** Asset and liability ledger (Bank balances, Investments, Loans, Credit cards), Debt Snowball / Avalanche payoff payoff calculator, net worth growth chart over time.
- **Stack:** Node.js + SQLite + Chart.js.
- **Docker Services:** `app` (`node:20-alpine`).

#### 093. `093-family-recipe-grocery-aggregator`
- **Target Persona:** Home Cooks, Meal Preppers, Families.
- **Problem Solved:** Recipe websites cluttered with ads, popups, and long life stories; grocery shopping lists scattered.
- **Core Features:** 1-click recipe URL importer (strips all ads, keeps ingredients and steps), weekly meal planner, aggregated grocery checklist combining quantities automatically.
- **Stack:** Python (FastAPI) + SQLite.
- **Docker Services:** `app` (`python:3.11-slim`).

#### 094. `094-recurring-subscription-guard`
- **Target Persona:** Anyone with recurring SaaS, streaming, gym, and utility bills.
- **Problem Solved:** Forgetting about trial periods or unused subscriptions until credit card statements arrive.
- **Core Features:** Subscription cost ledger, upcoming renewal alerts (7 days, 1 day prior), monthly and annual cost burn-rate graphs, cancellation step notes.
- **Stack:** Go + SQLite.
- **Docker Services:** `app` (`golang:1.22-alpine`).

#### 095. `095-homelab-ping-uptime-monitor`
- **Target Persona:** Self-Hosters, Home Network Enthusiasts, Small Webmasters.
- **Problem Solved:** Paying for Pingdom or UptimeRobot to monitor internal home server IPs or websites.
- **Core Features:** HTTP, Ping, and TCP port checks, status page with uptime percentage bars, webhook alerts (Telegram, Discord, Email) when services drop.
- **Stack:** Go / Node.js + SQLite.
- **Docker Services:** `app` (`golang:1.22-alpine`).

---

### Category 11: Creative, Freelancers, Media & Communities

#### 096. `096-freelancer-client-proofing-gallery`
- **Target Persona:** Photographers, Videographers, Graphic Designers.
- **Problem Solved:** Clients taking screenshots of proofs and sending disorganized WhatsApp change requests.
- **Core Features:** High-resolution photo/asset gallery with automatic preview watermarking, client favorite & select mechanism, pin-point feedback comments on specific coordinates of an image.
- **Stack:** Node.js + SQLite + MinIO + Sharp.
- **Docker Services:** `app` (`node:20-alpine`), `storage` (`minio/minio:RELEASE.2024-05-10T01-41-38Z`).

#### 097. `097-onepage-invoice-receipt-generator`
- **Target Persona:** Freelancers, Indie Hackers, Solopreneurs.
- **Problem Solved:** Subscribing to Freshbooks or QuickBooks just to send 3 invoices a month.
- **Core Features:** Clean invoice form with line items, tax/GST calculation, discount support, dynamic payment QR code (UPI, SEPA, Stripe/PayPal link), vector-crisp PDF download.
- **Stack:** Node.js + SQLite + PDFKit.
- **Docker Services:** `app` (`node:20-alpine`).

#### 098. `098-community-event-ticket-scanner`
- **Target Persona:** Local Meetup Organizers, College Fests, Indie Musicians.
- **Problem Solved:** Ticket booking platforms taking 8-15% platform fees on free or low-cost community events.
- **Core Features:** Event landing page, RSVP registration form, instant unique QR code ticket email, camera-based door scanner for check-in validation.
- **Stack:** Node.js + SQLite + HTML5 Barcode/QR API.
- **Docker Services:** `app` (`node:20-alpine`).

#### 099. `099-ngo-volunteer-donation-tracker`
- **Target Persona:** Non-Profits, Local Charities, Volunteer Groups.
- **Problem Solved:** Tracking volunteer service hours and issuing official donation receipts with zero administrative overhead.
- **Core Features:** Volunteer directory with logged service hours, donor contribution ledger with instant 80G/501(c)(3) tax receipt generation, cause impact dashboard.
- **Stack:** Python (FastAPI) + SQLite + ReportLab.
- **Docker Services:** `app` (`python:3.11-slim`).

#### 100. `100-podcast-guest-intake-scheduler`
- **Target Persona:** Podcasters, YouTube Interviewers, Media Hosts.
- **Problem Solved:** Chasing guests for bio, headshot, mic check details, and scheduling recording times.
- **Core Features:** Guest booking calendar, media kit intake form (Bio, Headshot upload, Social links, Topics to cover), pre-recording tech checklist, host show-notes export.
- **Stack:** Node.js + SQLite + MinIO.
- **Docker Services:** `app` (`node:20-alpine`), `storage` (`minio/minio:RELEASE.2024-05-10T01-41-38Z`).

---

## 🎯 Implementation Roadmap & Execution Strategy

We will build these projects systematically, one by one. Each project will be completely self-contained in its own folder:
- **Phase 1: Foundational 6 Flagship Projects** (The user's direct examples):
  1. `001-doctor-appointment-portal` (Healthcare)
  2. `011-digital-qr-menu-board` (Food/Canteen)
  3. `089-private-cloud-storage-vault` (Private Cloud / Google Drive alternative with MinIO)
  4. `041-minimalist-employee-attendance` (HR / Small business check-in)
  5. `042-monthly-employee-timesheets` (Timesheets & CSV/PDF export)
  6. `021-tuition-student-fee-register` (Coaching / Tuition tracker)
- **Phase 2: High Demand Utilities** (e.g., Invoicing `097`, Gym pass `072`, Job card `051`, Lawyer docket `031`).
- **Phase 3: Deep Vertical Utility Apps** (Completing all 100).
