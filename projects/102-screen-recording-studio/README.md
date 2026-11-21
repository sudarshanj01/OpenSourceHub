# 🎥 CapFlow — Sovereign Screen & Cam Studio

> **"Code is not a MOAT anymore. Software should be free, accessible, and self-sovereign for every occupation on Earth."**  
> *A self-contained, production-ready open-source utility by OpenSourceHub.*

---

## 🎯 The Problem: Loom's 5-Minute Paywall & Monthly Tax
Commercial screen recording SaaS (e.g. Loom, Vidyard) locks creators and professionals into aggressive paywalls:
1. **5-Minute Limit on Free Accounts**: Cuts you off mid-thought or mid-demo.
2. **Library Capped at 25 Videos**: Deletes or locks your older recordings.
3. **$15 to $25 per user/month**: An ongoing monthly tax just to share a 6-minute walkthrough video.
4. **Ad-Supported Online Recorders**: Riddle screens with pop-up ads, require suspicious browser extensions, or process videos on slow cloud queues.

**CapFlow solves this permanently.** Record your screen, webcam bubble, and microphone directly in your browser with zero time limits, non-destructive video trimming, local MP4/WebM downloads, and optional 1-click self-hosted link publishing (`/v/:id`).

---

## ✨ Features

- **🖥️ Flexible Video Sources:**
  - **Screen + Cam Bubble:** High-resolution screen capture composited with a floating circular, square, or pill webcam bubble.
  - **Screen Only:** Clean desktop, application window, or Chrome tab recording.
  - **Cam Only:** Fullscreen presenter webcam recording.
- **🎙️ Pro Audio & Mic Meter:**
  - Real-time audio waveform/decibel meter.
  - Native browser echo cancellation and noise suppression.
  - 1-click Mute / Unmute toggle.
- **🎨 Live Video Compositor (60 FPS):**
  - Composites display capture and camera feed in real-time on an internal HTML5 canvas.
  - Mirror camera toggle.
- **✂️ Post-Recording Studio & Non-Destructive Trimming:**
  - Instant in-browser hardware-accelerated playback.
  - Start and end trim handles to eliminate awkward silence at the start or finish.
- **⚡ Two Output Workflows:**
  - **Download Local File:** 1-click WebM/MP4 download directly to your computer.
  - **Publish & Share Link:** Uploads to your sovereign Rust backend to generate a permanent public link (`/v/:id`) with HTTP 206 range-request video streaming (smooth scrubbing/seeking).
- **📁 Built-in Video Library:**
  - Video catalog with duration badges, file sizes, view counts, and copy-link actions.

---

## 🛠️ Architecture & Tech Stack

- **Backend:** High-performance **Rust** using **Axum 0.8** and **Tokio**.
- **Database:** Embedded **SQLite** via `rusqlite` (bundled, zero separate DB containers needed).
- **Streaming Engine:** Asynchronous HTTP 206 Partial Content (Byte-Range Requests) for instant video seeking.
- **Frontend:** Reactive HTML5 + ES Modules + Tailwind CSS with hardware-accelerated Web Media APIs (`MediaRecorder`, `getDisplayMedia`, `AudioContext`).
- **Container Footprint:** Ultra-lightweight multi-stage Alpine Docker container (< 25MB).
- **Default Port:** `3102`.

---

## 🚀 Quick Start (60 Seconds)

### Option 1: Docker Compose (Recommended)

```bash
# 1. Navigate to the project directory
cd projects/102-screen-recording-studio

# 2. Start the container
docker compose up -d

# 3. Open in your browser
# Studio: http://localhost:3102
```

### Option 2: Local Cargo Development

```bash
cd projects/102-screen-recording-studio
cargo run
# Open http://localhost:3102
```

---

## 🌐 Production Deployment with Custom Domain & Free SSL

When deploying to a custom domain (e.g. `record.mybusiness.com`):

1. Point your domain's DNS `A` record to your server's public IP address.
2. In `.env`, configure:
   ```env
   DOMAIN=record.mybusiness.com
   ACME_EMAIL=admin@mybusiness.com
   ```
3. In `docker-compose.yml`, uncomment the `caddy` service.
4. Run `docker compose up -d`. Caddy will automatically provision and renew Let's Encrypt SSL certificates.

---

## 📜 License
MIT © OpenSourceHub
