# 🤖 VaultEngine — Project Agent Manual (`agent.md`)

Welcome to **VaultEngine** (`103-sovereign-db-vault`) — the sovereign continuous database transaction archiver and Point-in-Time Recovery (PITR) engine.

---

## 🎯 1. Project Persona & Occupational Focus
- **Target Occupations**: Systems Engineers, Site Reliability Engineers (SREs), Database Administrators (DBAs), and Startup Founders running production databases on raw EC2, bare-metal Linux, or VPS infrastructure.
- **Pain Point Solved**: Eliminates the 60%–120% AWS RDS compute and storage premium while preserving the single critical feature that forces companies to use RDS: **continuous sub-second Point-in-Time Recovery to S3**.

---

## 🏗️ 2. Exact Tech Stack & Architecture
1. **Core In-Server Engine & CLI (`cli/`)**:
   - **Language**: Rust 1.97+ (2021 edition)
   - **Binary Target**: Single static binary (`vaultengine`), < 15MB RAM footprint, zero GC pauses, zero external dependencies.
   - **Key Crates**: `clap` (CLI), `tokio` (async I/O), `reqwest` + `hmac` + `sha2` (AWS IMDSv2 & SigV4 S3 streaming), `flate2` / `zstd` (compression), `dialoguer` (interactive TUI wizard), `indicatif` (progress bars).
2. **Promotional Web Platform (`web/`)**:
   - **Framework**: Next.js 16.4 (App Router, Turbopack, Standalone output)
   - **Runtime**: Node.js 22 LTS (`node:22-alpine`)
   - **UI & Styling**: React 19, Tailwind CSS 3.4, Lucide Icons, Aceternity-inspired dark slate aesthetics (`#09090b` canvas with radial dot grid).
   - **SEO Dominance**: Semantic HTML5, dynamic `robots.txt`, dynamic `sitemap.xml`, OpenGraph tags, and Google Rich Snippet JSON-LD schemas (`SoftwareApplication`, `FAQPage`).

---

## 🔒 3. Cloud Security & IAM Architecture
- **Zero-Secret Golden Path**: Uses AWS EC2 Instance Metadata Service v2 (IMDSv2) via `http://169.254.169.254/latest/api/token`.
- Automatically fetches temporary STS credentials from the attached EC2 IAM Role.
- **Zero Static Secrets**: No `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` is ever stored on disk.
- **Least-Privilege Policy**:
  - `s3:CreateBucket`, `s3:ListBucket`, `s3:GetBucketLocation`
  - `s3:PutObject`, `s3:GetObject`, `s3:AbortMultipartUpload`
  - Resource: `arn:aws:s3:::vaultengine-*`

---

## ⚙️ 4. Environment Variables Reference

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Local port for promotional web platform | `3103` |
| `NODE_ENV` | Node runtime environment | `production` |
| `DOMAIN` | Production domain for Let's Encrypt Caddy SSL | *(Optional)* |
| `ACME_EMAIL` | Contact email for Let's Encrypt certificates | *(Optional)* |

---

## 🚀 5. Local Deployment Steps
1. Navigate into project folder:
   ```bash
   cd projects/103-sovereign-db-vault
   ```
2. Build and launch container:
   ```bash
   docker compose up -d --build
   ```
3. Open `http://localhost:3103` in your browser.

---

## 🌐 6. Production Deployment Steps
1. Configure `.env`:
   ```bash
   DOMAIN=vaultengine.yourdomain.com
   ACME_EMAIL=admin@yourdomain.com
   ```
2. Uncomment the `caddy` service in `docker-compose.yml`.
3. Launch:
   ```bash
   docker compose up -d --build
   ```
4. Caddy will automatically provision Let's Encrypt TLS certificates.

---

## 🛠️ 7. CLI Subcommands Reference
- `vaultengine init`: Interactive setup wizard for database engine, S3 bucket, and IAM role.
- `vaultengine daemon`: Background watcher managing continuous transaction spooling.
- `vaultengine backup`: Triggers an on-demand non-blocking hot physical base snapshot.
- `vaultengine status`: Displays operational metrics, last snapshot, transaction sequence, and RPO lag.
- `vaultengine restore --target-time "<timestamp>"`: Second-precision Point-in-Time Recovery.
- `vaultengine doctor`: Diagnostic tool for EC2 IMDSv2 and S3 connectivity.

---

## 🤖 8. AI Prompt Extension Notes
- **Zero External Port Exposure**: Never add web endpoints or HTTP listening ports to the core `vaultengine` CLI binary. It must remain strictly an in-server command-line tool and daemon for database hosts.
- **Memory Safety**: Keep the Rust CLI memory footprint strictly under 15MB. Do not introduce heavy dependencies.
- **Zero AI-Slop**: Keep all web copywriting dignified, technical, and authentic. Never display tech stack tags or demo badges on public interfaces.
