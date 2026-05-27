# syntax=docker/dockerfile:1

# ---- Builder stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Native build deps for node-gyp based packages (bcrypt 등)
RUN apk add --no-cache python3 make g++

# NOTE: package-lock.json이 레포에 없어 `npm ci`가 실패하므로 단기 해결책으로 `npm install` 사용.
COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY deploy/entrypoint.sh ./deploy/entrypoint.sh
RUN chmod +x ./deploy/entrypoint.sh

EXPOSE 5013
ENTRYPOINT ["./deploy/entrypoint.sh"]
