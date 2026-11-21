#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL database to be ready on db:5432..."
until nc -z db 5432; do
  echo "Database is still initializing... waiting 2 seconds"
  sleep 2
done

echo "✅ Database connection verified!"

echo "📦 Pushing Prisma database schema to PostgreSQL..."
npx prisma db push --skip-generate --accept-data-loss

echo "🌱 Ensuring database has starter campaigns & seed data..."
npx tsx prisma/seed.ts || true

echo "🚀 Starting QRShield Sovereign Dynamic QR Campaign Studio on port 3101..."
exec "$@"
