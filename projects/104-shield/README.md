# 🔒 EnvShield

> **Sovereign In-Memory Secret Vault & AI Agent Data Loss Prevention (DLP)**  
> Seals `.env` files with **Argon2id + AES-256-GCM** so AI agents (Claude Code, Cursor, Aider) and scripts cannot read plaintext secrets from disk.  
> Runs across **Linux, macOS, and Windows** with **zero root/admin privileges**.

---

## ⚡ The Problem: AI Agents Leak Plaintext Secrets

In the agentic AI era, coding agents like **Claude Code**, **Cursor**, **Aider**, and **OpenDevin** run with full access to your workspace folder. 
- Ignore files like `.gitignore`, `.cursorignore`, and `.claudeignore` **fail to protect secrets** because agents can still execute terminal commands (`cat .env`, `python -c ...`) or accidentally commit `.env` into context tokens.
- Tools like `dotenvx` write private keys in plaintext to `.env.keys` on disk, which agents can easily read!

**EnvShield makes it mathematically impossible for an AI agent to read `.env` by shredding plaintext from disk and injecting secrets only into application RAM.**

---

## 🛡️ The 4-Step Workflow

### 1. Seal your project (`.env` $\rightarrow$ `.env.vault`)
```bash
envshield seal
```
- Prompts for your Master Password.
- Derives a 256-bit key via **Argon2id** (memory-hard, GPU-resistant).
- Encrypts secrets into `.env.vault` using **AES-256-GCM**.
- **Securely shreds and deletes the plaintext `.env` from your storage.**
- Automatically appends `.env` to `.gitignore`.

If an AI agent now runs `cat .env`, it gets:
```text
cat: .env: No such file or directory
```
If it runs `cat .env.vault`, it sees unreadable binary ciphertext.

---

### 2. Run your application with In-Memory Secrets
```bash
envshield run -- npm run dev
# or
envshield run -- docker compose up
# or
envshield run -- python main.py
```
- Asks for your Master Password.
- Decrypts secrets **directly into process RAM**.
- Injects environment variables into the child process.
- **Plaintext `.env` is NEVER written to the hard drive or SSD.**

---

### 3. Edit your secrets in RAM
```bash
envshield edit
```
- Decrypts into `/dev/shm` (temporary RAM disk).
- Opens your favorite editor (`nano`, `vim`, `$EDITOR`).
- On exit, automatically re-encrypts into `.env.vault` with fresh salt & nonce, then shreds the RAM file.

---

### 4. View or Unseal
```bash
# View secrets in terminal stdout
envshield view

# Restore plaintext .env and remove .env.vault
envshield unseal

# Check protection state
envshield status
```

---

## 🚀 Installation

### One-Line Install (Zero Root Needed)
```bash
curl -sSL https://raw.githubusercontent.com/sudarshanj01/OpenSourceHub/main/projects/104-shield/install.sh | bash
```

### Or Build with Cargo
```bash
cd daemon
cargo build --release
cp target/release/envshield ~/.local/bin/
```

---

## 🔒 Threat Model & Security Guarantees

| Attack Vector | Standard Setup | With EnvShield Active |
| :--- | :--- | :--- |
| **Agent runs `cat .env`** | 🚨 Plaintext leaked to prompt context | ❌ `No such file or directory` (Shredded) |
| **Agent runs `cat .env.vault`** | N/A | 🔒 Unreadable AES-256-GCM ciphertext |
| **Agent runs `envshield unseal`** | N/A | 🛑 Denied: Prompts for human Master Password |
| **Attacker gains `root` access** | 🚨 Can read all `.env` files | 🔒 Cannot decrypt vault (Password not on disk) |
| **Accidental `git commit -a`** | 🚨 Pushed to GitHub | 🔒 `.env` does not exist; vault is encrypted |
| **Kernel / System Crash Risk** | N/A | **0% (Pure userspace; zero kernel hooks)** |

---

## 📜 License

Released under the permissive [MIT License](../../LICENSE).
