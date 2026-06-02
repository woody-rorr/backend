# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; \
    else npm install --no-audit --no-fund; fi
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
RUN apk add --no-cache curl ca-certificates
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; \
    else npm install --omit=dev --no-audit --no-fund; fi \
    && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY deploy/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
EXPOSE 5013
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:5013/health || exit 1
ENTRYPOINT ["/app/entrypoint.sh"]
