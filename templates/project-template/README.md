# Project Blueprint Template

This folder serves as the standard template for each utility micro-app in OpenSourceHub.

## 🚀 Quickstart (30 seconds)

1. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
2. Start the container stack:
   ```bash
   docker compose up -d
   ```
3. Open `http://localhost:3000` in your web browser.

---

## 🌐 Deploying to Production with Custom Domain & Auto-SSL

1. Point your domain's DNS `A` record to your server's public IP address.
2. Edit `.env` and configure:
   ```env
   DOMAIN=app.yourdomain.com
   ACME_EMAIL=your-email@example.com
   ```
3. In `docker-compose.yml`, switch `ports:` to `expose:` on `app`, and uncomment the `caddy:` service block.
4. Run:
   ```bash
   docker compose up -d
   ```
   Caddy will automatically provision a Let's Encrypt SSL certificate and handle HTTPS traffic.
