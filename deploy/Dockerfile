# syntax=docker/dockerfile:1
# Multi-stage build (01-stack-and-deploy.md §8)

# ---- builder ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# curl required for ECS container healthCheck (db_migration.md: alpine runtime healthCheck)
RUN apk add --no-cache curl ca-certificates

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# compiled output only — no src/ in production image
COPY --from=builder /app/dist ./dist
COPY deploy/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 5013

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:5013/health || exit 1

ENTRYPOINT ["./entrypoint.sh"]
