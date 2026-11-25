# ==============================================================================
# Production Multi-Stage Container for VaultEngine
# Node.js 22-alpine base image
# ==============================================================================

FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# ------------------------------------------------------------------------------
# Dependencies Layer
# ------------------------------------------------------------------------------
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY web/package.json ./
RUN npm install --omit=dev

# ------------------------------------------------------------------------------
# Builder Layer
# ------------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY web/package.json ./
RUN npm install
COPY web/ ./
RUN mkdir -p public
RUN npm run build

# ------------------------------------------------------------------------------
# Production Runner Layer
# ------------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3103
ENV PORT=3103
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
