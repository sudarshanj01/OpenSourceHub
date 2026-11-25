# 🛡️ VaultEngine (`103-vaultengine`)

> **Sovereign Database Continuous Archiving & Point-in-Time Recovery (PITR) to Amazon S3**  
> Ditch the 120% AWS RDS markup. Enterprise-grade database protection on raw EC2.

---

## ⚡ 60-Second Quickstart

### 1. Run the Promotional Web Application
```bash
docker compose up -d
```
Visit `http://localhost:3103` to view the promotional platform, live cost savings calculator, and interactive PITR simulator.

### 2. Install the Standalone CLI on your Database Server
```bash
# 1-Line Installer from Live Production URL
curl -sSL https://vaultengine.opensourcehub.dpdns.org/install.sh | sudo bash

# Or compile locally from source
cd cli && cargo build --release
sudo cp target/release/vaultengine /usr/local/bin/
```

### 3. Initialize & Start Protection
```bash
# Run guided setup wizard
vaultengine init

# Validate AWS IMDSv2 IAM role & S3 access
vaultengine doctor

# Check operational status & RPO lag
vaultengine status

# Run daemon or start systemd service
sudo systemctl enable --now vaultengine
```

---

## 🎯 Architecture Overview

- **Component A: CLI & Daemon (`cli/`)**: Single memory-safe Rust static binary (< 15MB RAM). Runs strictly inside the database server with zero external port exposure.
- **Component B: SEO Promotional Platform (`web/`)**: Next.js 16 (App Router), React 19, Tailwind CSS, Aceternity UI aesthetics, dynamic `sitemap.xml`, `robots.txt`, and rich Google JSON-LD structured schemas.
- **Cloud Security**: EC2 IMDSv2 auto-discovery—never stores static AWS access keys on disk.
- **Storage Target**: Amazon S3 (or S3-compatible storage like MinIO, Wasabi, Cloudflare R2).
