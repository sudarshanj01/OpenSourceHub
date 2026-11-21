# 🤖 Agent Operational Manual (`agent.md`) — Project 102: CapFlow

This document specifies the operational standards, tech stack decisions, and extension guides for **CapFlow** (`102-screen-recording-studio`).

---

## 🎯 Project Identity & Scope
- **Project Number:** 102
- **Name:** CapFlow — Sovereign Screen & Cam Studio
- **Directory:** `projects/102-screen-recording-studio`
- **Port:** `3102`
- **Domain:** Developer Tooling, Async Team Communication, Video Demos, Bug Reporting
- **Anti-Pattern Solved:** Loom's 5-minute cap on free accounts, 25-video limit, and $15/month subscription tax.

---

## 🛠️ Stack & Standards

1. **Backend:**
   - Rust 1.85+ with `axum 0.8`, `tokio 1.40`, `tower-http 0.6`.
   - Multipart file ingestion for video chunks and metadata.
   - HTTP 206 Partial Content range requests streaming for seamless playback scrubbing.

2. **Database:**
   - Embedded SQLite (`rusqlite 0.32` with bundled feature).
   - Zero separate database containers needed.
   - Persistent volume mount `./data` for `db.sqlite` and `./data/recordings/`.

3. **Frontend:**
   - Responsive HTML5 + ES Modules + Tailwind CSS.
   - Draggable & resizable webcam bubble with circular, pill, and square styling.
   - 60 FPS real-time canvas compositor combining screen and webcam.
   - Client-side trimming timeline scrubber.

4. **Containerization:**
   - Multi-stage Alpine Dockerfile (< 25MB total image size).
   - Single service `app` on port `3102`.
