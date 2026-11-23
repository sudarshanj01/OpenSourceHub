# 🔒 EnvShield

> **Sovereign Kernel-Level `.env` Guard & AI Agent Data Loss Prevention (DLP)**  
> Intercepts all `.env` file access attempts at the Linux kernel boundary (`fanotify`).  
> Demands a master password via native desktop pop-up before a single byte of secrets can be read.

---

## ⚡ The Problem: The AI Agent Secret Leak

In the agentic AI era, coding agents like **Claude Code**, **Cursor**, **Aider**, and **OpenDevin** run with your exact developer user permissions (`UID 1000`). If a `.env` file exists with database passwords, OpenAI keys, or Stripe secrets, any background agent command (`cat .env`, `grep`, or file indexing) reads those secrets directly into LLM prompts, context tokens, and telemetry logs.

**EnvShield stops this at the Linux kernel boundary.**

---

## 🛡️ Key Features

- **Kernel-Level Interception (`fanotify`)**: Attaches to `FAN_OPEN_PERM`. When any process attempts to open any `.env` file anywhere on the system, the Linux kernel **freezes process execution** in kernel space.
- **Desktop Modal Prompt**: EnvShield queries the active human screen via a native desktop dialog (`zenity`/`pinentry`). The AI agent in the terminal cannot see, type into, or bypass the modal.
- **Argon2id Cryptographic Vault**: The master password is encrypted with modern Argon2id hashing and salt.
- **Global Scope (Zero-Config)**: Protects all `.env`, `.env.local`, and `.env.production` files across every directory on your machine without requiring per-project initialization.
- **Tamper-Resistant Root Daemon**: Runs as an untouchable systemd service. A user-level AI agent cannot `kill -9` the process or delete the guard.
- **Sub-Microsecond Latency**: Non-secret file operations bypass the filter in `< 0.5 µs`.

---

## 🚀 Quickstart

### 1. Build and Install the Rust Binary
```bash
cd daemon
cargo build --release
sudo cp target/release/envshield /usr/local/bin/
```

### 2. Establish Master Password
```bash
sudo envshield init --install-service
```

### 3. Check Status & Guarded Files
```bash
envshield status
envshield scan --path ~/workspace
```

---

## 🌐 Web Showcase & Simulator

EnvShield includes an interactive Next.js 16 Web Showcase featuring a live kernel interception simulator:

```bash
docker compose up -d
```
Open **`http://localhost:3104`** in your browser.

---

## 📜 License

Released under the permissive [MIT License](../../LICENSE).
