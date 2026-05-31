# syntax=docker/dockerfile:1
# Multi-stage build for new-project API (NestJS).
# lockfile fallback per 01-stack-and-deploy.md §9 / scaffold_module.md bootstrap rules.

# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; \
    else npm install --no-audit --no-fund; fi

COPY . .
RUN npm run build

# ---------- runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app

# curl + ca-certificates required for ECS container healthCheck (alpine ships without curl)
RUN apk add --no-cache curl ca-certificates

ENV NODE_ENV=production

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; \
    else npm install --omit=dev --no-audit --no-fund; fi

COPY --from=builder /app/dist ./dist
COPY deploy/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 5013

ENTRYPOINT ["./entrypoint.sh"]
