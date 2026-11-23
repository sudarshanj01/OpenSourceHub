# 🤖 Project Manual: EnvShield (`agent.md`)

Welcome to **EnvShield** — the sovereign kernel-level `.env` file guard and AI Agent Data Loss Prevention (DLP) utility.

---

## 🎯 1. Persona & Occupational Mission

- **Target Persona**: Software Developers, Security Engineers, DevOps Specialists, and Teams adopting AI coding harnesses (Claude Code, Cursor, Aider, OpenDevin, Copilot Workspace).
- **Core Problem**: AI coding agents execute shell commands under the developer's exact user account (UID 1000). If a project directory contains a `.env` file with API keys (Stripe, OpenAI, AWS, PostgreSQL), any agent command (`cat .env`, `grep API_KEY`, or background file indexing) reads the credentials in plaintext, embedding them in prompt tokens, context windows, and telemetry logs.
- **Sovereign Value Proposition**: EnvShield operates at the operating system kernel boundary (`fanotify` on Linux). When any process attempts to open any `.env` file anywhere on the system, the Linux kernel halts the calling process in kernel space and prompts the developer via a native desktop modal dialog for their Master Password. Without that password, the process receives `EACCES: Permission denied`.

---

## 🛠️ 2. Exact Tech Stack & Kernel Architecture

### Daemon & Core Engine
- **Language**: Rust 1.80+ / Edition 2021
- **Kernel Interception**: Linux `fanotify` (`fanotify_init` with `FAN_CLASS_CONTENT`, `fanotify_mark` with `FAN_OPEN_PERM` on mount/filesystem)
- **Cryptography**: Argon2id password hashing via pure-Rust `argon2` crate with OS CSPRNG salt (`rand_core`)
- **CLI Subcommands**: `clap v4.5` (derive interface)
- **Modal Dialog Engine**: Native `zenity` / `pinentry` with automatic desktop session display discovery (`DISPLAY`, `WAYLAND_DISPLAY`, `XAUTHORITY`)
- **Memory Footprint**: `< 12 MB RAM`, single static binary (`< 8 MB`)

### Web Showcase & Interactive Simulator
- **Framework**: Next.js 16 (Turbopack, App Router)
- **UI Engine**: React 19, Tailwind CSS 3.4
- **Aesthetics**: Aceternity UI-inspired slate/zinc palette (`#09090b`), radial dot pattern, Bento Grid metrics, interactive terminal simulator

### Container Standard
- **Base Image**: `node:22-alpine` (Pinned)
- **Reverse Proxy**: `caddy:2.9-alpine` (Pinned)

---

## 🔒 3. Security & Kernel Interception Workflow

```text
[ Process: claude-code / cat / python ]
              │
              ▼ (Calls openat(AT_FDCWD, ".env", O_RDONLY))
       [ Linux Kernel ] ──► (Freezes Process Execution)
              │
              ▼ (Kernel notifies EnvShield Daemon via fanotify)
     [ EnvShield Daemon ]
              │
              ▼ (Spawns Native Desktop Modal on Human Screen)
   ┌─────────────────────────────────────────────────────────┐
   │ 🔒 EnvShield: Secret Access Requested                    │
   │ Process:   claude-code (PID: 4892)                      │
   │ Target:    /home/user/work/my-project/.env              │
   │ Action:    READ_ACCESS                                  │
   │ Enter Master Password to authorize: [ •••••••••••• ]     │
   │        [ Deny / Cancel ]     [ Authorize Once ]         │
   └─────────────────────────────────────────────────────────┘
              │
              ├─► Password Matches Argon2id ──► FAN_ALLOW (Kernel resumes process)
              └─► Wrong / Canceled / Timeout  ──► FAN_DENY (Kernel returns EACCES)
```

---

## ⚙️ 4. Environment Variables Reference

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `PORT` | `3104` | Web showcase and documentation port |
| `NODE_ENV` | `production` | Node.js production mode |
| `DOMAIN` | `""` | Production domain for Caddy SSL proxy |
| `ACME_EMAIL` | `""` | Let's Encrypt account email for SSL certs |

---

## 🚀 5. Quickstart & Deployment

### Run the Web Showcase in Docker:
```bash
cp .env.example .env
docker compose up -d
# Access at http://localhost:3104
```

### Install the Native Rust Binary on Linux:
```bash
cd daemon
cargo build --release
sudo cp target/release/envshield /usr/local/bin/
sudo envshield init --install-service
```

### Run Live Watch in Foreground:
```bash
sudo envshield watch --all
```

---

## 🔍 6. CLI Commands Reference

- `envshield init`: Prompts for master password, generates Argon2id hash, and creates `/etc/envshield/config.json`.
- `envshield watch [--all]`: Starts real-time kernel guard monitoring.
- `envshield status`: Displays daemon status, config path, and recent audit log entries.
- `envshield scan [--path <DIR>]`: Scans directory tree for all `.env` files protected by EnvShield.
- `envshield uninstall`: Prompts for master password and safely removes service and config.

---

## 🛡️ 7. AI Prompt Extension Guidelines

When extending EnvShield:
1. Never compromise the kernel-level blocking integrity: `FAN_OPEN_PERM` must always respond with either `FAN_ALLOW` or `FAN_DENY`.
2. Do not log plaintext passwords or decrypted file contents to `/var/log/envshield.log` or console.
3. Preserve the multi-tier desktop prompter: always provide clean fallbacks when `$DISPLAY` is not accessible.
